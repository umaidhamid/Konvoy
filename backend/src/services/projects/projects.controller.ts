import Project from "../../models/projects.model.js";
import User from "../../models/users.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { notify } from "../notifications/notification.service.js";
import { resolvePlanLimitsForUser } from "../plans/plan.service.js";

const accessFilter = (userId: string) => ({
  $or: [{ userId }, { "members.userId": userId }],
});

// member.userId may be populated ({_id, fullname, email}) or a raw ObjectId/string
const memberUserId = (m: any) => (m.userId && m.userId._id ? m.userId._id : m.userId);

// Attaches the requesting user's role (and file access scope) on each project
// so the frontend/CLI can show it
const withRole = (project: any, userId: string) => {
  const obj = project.toObject ? project.toObject() : project;
  const isPinned = (obj.pinnedBy || []).some((id: any) => String(id) === String(userId));
  if (String(obj.userId) === String(userId)) {
    return { ...obj, myRole: "owner", myFileIds: null, isPinned };
  }
  const member = obj.members?.find((m: any) => String(memberUserId(m)) === String(userId));
  return {
    ...obj,
    myRole: member?.role || null,
    myFileIds: member ? (member.fileIds?.length ? member.fileIds.map(String) : null) : null,
    isPinned,
  };
};

export const createProject = async (req: any, res: any) => {
  try {
    const name = String(req.body.name || "").trim();
    const { description } = req.body;

    const { maxProjectsPerUser } = await resolvePlanLimitsForUser(req.user.userId);
    const ownedCount = await Project.countDocuments({ userId: req.user.userId });
    if (ownedCount >= maxProjectsPerUser) {
      return res.status(403).json({
        success: false,
        message: `You've reached the limit of ${maxProjectsPerUser} projects.`,
      });
    }

    const existingProject = await Project.findOne({
      userId: req.user.userId,
      name,
    }).select("name");

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project with this name already exists.",
      });
    }

    const project = await Project.create({
      userId: req.user.userId,
      name,
      description,
    });

    await notify(req.user.userId, "project_created", `You created the project "${project.name}".`, {
      projectId: project._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const getProjects = async (req: any, res: any) => {
  try {
    const projects = await Project.find(
      accessFilter(req.user.userId)
    ).sort({ createdAt: -1 });

    const projectIds = projects.map((p) => p._id);
    const fileStats = await ProjectFile.aggregate([
      { $match: { projectId: { $in: projectIds }, isDeleted: false } },
      { $group: { _id: "$projectId", fileCount: { $sum: 1 }, sizeBytes: { $sum: "$sizeBytes" } } },
    ]);
    const fileStatsByProject = new Map(fileStats.map((f: any) => [String(f._id), f]));

    // Members limit is scoped to the project OWNER's plan (not the viewer's),
    // same reasoning as enforcement - resolve once per unique owner, not per project.
    const ownerIds = [...new Set(projects.map((p) => String(p.userId)))];
    const limitsByOwner = new Map(
      await Promise.all(
        ownerIds.map(async (ownerId) => {
          const { maxMembersPerProject } = await resolvePlanLimitsForUser(ownerId);
          return [ownerId, { maxMembersPerProject }] as const;
        })
      )
    );

    const data = projects.map((p) => {
      const stats = fileStatsByProject.get(String(p._id));
      const limits = limitsByOwner.get(String(p.userId));
      const { userId, pinnedBy, ...rest } = withRole(p, req.user.userId);
      return {
        ...rest,
        fileCount: stats?.fileCount || 0,
        sizeBytes: stats?.sizeBytes || 0,
        memberCount: p.members?.length || 0,
        limits,

      };
    });

    // Pinned projects surface first, most-recently-created within each group.
    data.sort((a: any, b: any) => Number(b.isPinned) - Number(a.isPinned));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /projects/team - everyone the requesting user collaborates with, across
// every project, deduplicated by person (not by project). Two directions:
// people they've invited into projects they own, and owners of projects
// they've been invited into.
export const getMyTeam = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const [ownedProjects, memberProjects] = await Promise.all([
      Project.find({ userId }).select("name slug members").populate("members.userId", "fullname email profileImage"),
      Project.find({ "members.userId": userId, userId: { $ne: userId } })
        .select("name slug userId")
        .populate("userId", "fullname email profileImage"),
    ]);

    const myTeamMap = new Map<string, { user: any; projects: { _id: string; name: string; slug: string }[] }>();
    for (const project of ownedProjects) {
      for (const member of project.members) {
        const memberUser = member.userId as any;
        if (!memberUser?._id) continue; // deleted user
        const key = String(memberUser._id);
        if (!myTeamMap.has(key)) myTeamMap.set(key, { user: memberUser, projects: [] });
        myTeamMap.get(key)!.projects.push({ _id: String(project._id), name: project.name, slug: project.slug });
      }
    }

    const sharedWithMeMap = new Map<string, { user: any; projects: { _id: string; name: string; slug: string }[] }>();
    for (const project of memberProjects) {
      const owner = project.userId as any;
      if (!owner?._id) continue;
      const key = String(owner._id);
      if (!sharedWithMeMap.has(key)) sharedWithMeMap.set(key, { user: owner, projects: [] });
      sharedWithMeMap.get(key)!.projects.push({ _id: String(project._id), name: project.name, slug: project.slug });
    }

    return res.status(200).json({
      success: true,
      data: {
        myTeam: Array.from(myTeamMap.values()),
        sharedWithMe: Array.from(sharedWithMeMap.values()),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
export const deleteProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOneAndDelete({ _id: projectId, userId: req.user.userId }).select("name members");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    await notify(req.user.userId, "project_deleted", `You deleted the project "${project.name}".`);
    for (const member of project.members) {
      await notify(
        member.userId.toString(),
        "project_deleted",
        `The project "${project.name}" was deleted by its owner.`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
export const updateProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { description } = req.body;
    const name = String(req.body.name || "").trim();
    const project = await Project.findOneAndUpdate({ _id: projectId, userId: req.user.userId }, {
      name,
      description,
    },{new:true});

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    await notify(req.user.userId, "project_updated", `You updated the project "${project.name}".`, {
      projectId: project._id.toString(),
    });
    for (const member of project.members) {
      await notify(
        member.userId.toString(),
        "project_updated",
        `The project "${project.name}" was updated.`,
        { projectId: project._id.toString() }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
export const getProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({
      _id: projectId,
      ...accessFilter(req.user.userId),
    }).populate("members.userId", "fullname email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const { userId, pinnedBy, ...rest } = withRole(project, req.user.userId);

    return res.status(200).json({
      success: true,
      data: rest,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// POST /projects/:projectId/pin - toggles the requesting user's pin on a project they can access
export const togglePinProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOne({ _id: projectId, ...accessFilter(userId) }).select("pinnedBy");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const isPinned = project.pinnedBy.some((id: any) => String(id) === String(userId));
    await Project.updateOne(
      { _id: projectId },
      isPinned ? { $pull: { pinnedBy: userId } } : { $addToSet: { pinnedBy: userId } }
    );

    return res.status(200).json({
      success: true,
      message: isPinned ? "Project unpinned." : "Project pinned.",
      data: { isPinned: !isPinned },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// POST /projects/:projectId/members - owner only, invite by email
export const addProjectMember = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { email, fileIds } = req.body;

    const project = await Project.findOne({ _id: projectId, userId: req.user.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("_id email fullname");
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with this email." });
    }

    if (String(user._id) === String(project.userId)) {
      return res.status(409).json({ success: false, message: "This user already owns the project." });
    }

    const alreadyMember = project.members.some((m: any) => String(m.userId) === String(user._id));
    if (alreadyMember) {
      return res.status(409).json({ success: false, message: "User is already a member." });
    }

    const { maxMembersPerProject } = await resolvePlanLimitsForUser(req.user.userId);
    if (project.members.length >= maxMembersPerProject) {
      return res.status(403).json({
        success: false,
        message: `This project has reached its limit of ${maxMembersPerProject} member(s).`,
      });
    }

    let resolvedFileIds: string[] = [];
    if (Array.isArray(fileIds) && fileIds.length) {
      const validCount = await ProjectFile.countDocuments({
        _id: { $in: fileIds },
        projectId: project._id,
        isDeleted: false,
      });
      if (validCount !== fileIds.length) {
        return res.status(400).json({ success: false, message: "One or more selected files don't belong to this project." });
      }
      resolvedFileIds = fileIds;
    }

    project.members.push({ userId: user._id, role: "member", fileIds: resolvedFileIds as any });
    await project.save();
    await project.populate("members.userId", "fullname email");

    const accessScope = resolvedFileIds.length
      ? `${resolvedFileIds.length} file(s)`
      : "all files";

    try {
      await sendEmail({
        to: user.email as string,
        subject: `You've been added to "${project.name}" on Konvoy`,
        html: `<p>Hi ${user.fullname || ""},</p>
<p><strong>${req.user.email || "A teammate"}</strong> has given you access (${accessScope}) to the project <strong>${project.name}</strong> on Konvoy.</p>
<p>Log in to your dashboard to see it in your project list.</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send invite email:", emailError);
    }

    await notify(
      user._id.toString(),
      "member_added_you",
      `You were added to the project "${project.name}" (${accessScope}).`,
      { projectId: project._id.toString(), actorId: req.user.userId }
    );
    await notify(
      req.user.userId,
      "member_added",
      `You added ${user.fullname || user.email} to "${project.name}".`,
      { projectId: project._id.toString() }
    );

    return res.status(200).json({
      success: true,
      message: "Member added successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// DELETE /projects/:projectId/members/:memberId - owner only
export const removeProjectMember = async (req: any, res: any) => {
  try {
    const { projectId, memberId } = req.params;

    const existingProject = await Project.findOne({ _id: projectId, userId: req.user.userId }).select("members");
    if (!existingProject) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    const wasMember = existingProject.members.some((m: any) => String(m.userId) === String(memberId));
    if (!wasMember) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId: req.user.userId },
      { $pull: { members: { userId: memberId } } },
      { new: true }
    ).populate("members.userId", "fullname email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    await notify(
      memberId,
      "member_removed_you",
      `You were removed from the project "${project.name}".`,
      { projectId: project._id.toString(), actorId: req.user.userId }
    );
    await notify(
      req.user.userId,
      "member_removed",
      `You removed a member from "${project.name}".`,
      { projectId: project._id.toString() }
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully.",
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// POST /projects/:projectId/leave - a member removes themselves; owners can't leave their own project
export const leaveProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, "members.userId": req.user.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "You're not a member of this project." });
    }

    project.members = project.members.filter(
      (m: any) => String(m.userId) !== String(req.user.userId)
    );
    await project.save();

    await notify(
      project.userId.toString(),
      "member_left",
      `${req.user.email || "A member"} left your project "${project.name}".`,
      { projectId: project._id.toString(), actorId: req.user.userId }
    );

    return res.status(200).json({
      success: true,
      message: "You left the project.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
