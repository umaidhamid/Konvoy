import Project from "../../models/projects.model.js";
import User from "../../models/users.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { notify } from "../notifications/notification.service.js";

const accessFilter = (userId: string) => ({
  $or: [{ userId }, { "members.userId": userId }],
});

// member.userId may be populated ({_id, fullname, email}) or a raw ObjectId/string
const memberUserId = (m: any) => (m.userId && m.userId._id ? m.userId._id : m.userId);

// Attaches the requesting user's role (and file access scope) on each project
// so the frontend/CLI can show it
const withRole = (project: any, userId: string) => {
  const obj = project.toObject ? project.toObject() : project;
  if (String(obj.userId) === String(userId)) {
    return { ...obj, myRole: "owner", myFileIds: null };
  }
  const member = obj.members?.find((m: any) => String(memberUserId(m)) === String(userId));
  return {
    ...obj,
    myRole: member?.role || null,
    myFileIds: member ? (member.fileIds?.length ? member.fileIds.map(String) : null) : null,
  };
};

export const createProject = async (req: any, res: any) => {
  try {
    const { name, description } = req.body;

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

    const data = projects.map((p) => {
      const { userId, ...rest } = withRole(p, req.user.userId);
      return rest;
    });

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
    const { name, description } = req.body;
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

    const { userId, ...rest } = withRole(project, req.user.userId);

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

// POST /projects/:projectId/members - owner only, invite by email
export const addProjectMember = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { email, fileIds } = req.body;

    const project = await Project.findOne({ _id: projectId, userId: req.user.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("_id email fullname");
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
