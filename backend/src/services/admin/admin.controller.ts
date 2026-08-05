import User from "../../models/users.model.js";
import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";
import AdminLog from "../../models/adminLog.model.js";
import Plan, { IPlanPricingOption } from "../../models/plan.model.js";
import ContactQuery from "../../models/contactQuery.model.js";
import { notify } from "../notifications/notification.service.js";
import { appSettingsService } from "../settings/appSettings.service.js";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePagination = (req: any) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  return { page, limit, search };
};

const logAdminAction = (
  actorId: string,
  action: string,
  targetType: "user" | "project" | "plan" | "broadcast" | "settings",
  targetId: string,
  details: string
) => {
  AdminLog.create({ actorId, action, targetType, targetId, details }).catch((err) =>
    console.error("Failed to write admin log:", err)
  );
};

export const getAllUsers = async (req: any, res: any) => {
  try {
    const { page, limit, search } = parsePagination(req);
    const planStatus = req.query.planStatus; // "active" | "expired" | undefined (= all)

    const filter: any = search
      ? {
          $or: [
            { fullname: { $regex: escapeRegex(search), $options: "i" } },
            { email: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    if (planStatus === "expired") {
      filter.planExpiresAt = { $lt: new Date() };
    } else if (planStatus === "active") {
      filter.planId = { $ne: null };
      filter.$and = [{ $or: [{ planExpiresAt: null }, { planExpiresAt: { $gte: new Date() } }] }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("fullname email role isVerified isDeactivated deactivationNote profileImage lastLoginAt createdAt planId planExpiresAt")
        .populate("planId", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const getAllProjects = async (req: any, res: any) => {
  try {
    const { page, limit, search } = parsePagination(req);

    const filter = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { description: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("userId", "fullname email")
        .populate("members.userId", "fullname email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    const fileCounts = await ProjectFile.aggregate([
      { $match: { isDeleted: false, projectId: { $in: projects.map((p) => p._id) } } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);
    const fileCountByProject = new Map(
      fileCounts.map((f: any) => [String(f._id), f.count])
    );

    const data = projects.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        fileCount: fileCountByProject.get(String(p._id)) || 0,
      };
    });

    return res.status(200).json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /admin/stats - storage/usage overview
export const getStats = async (_req: any, res: any) => {
  try {
    const [totalUsers, totalProjects, fileStats, topProjectsRaw] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      ProjectFile.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, totalFiles: { $sum: 1 }, totalSizeBytes: { $sum: "$sizeBytes" } } },
      ]),
      ProjectFile.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$projectId", fileCount: { $sum: 1 }, sizeBytes: { $sum: "$sizeBytes" } } },
        { $sort: { sizeBytes: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const projectIds = topProjectsRaw.map((p: any) => p._id);
    const projectDocs = await Project.find({ _id: { $in: projectIds } }).select("name slug userId").populate(
      "userId",
      "fullname email"
    );
    const projectById = new Map(projectDocs.map((p) => [String(p._id), p]));

    const topProjects = topProjectsRaw.map((p: any) => {
      const proj = projectById.get(String(p._id));
      return {
        projectId: p._id,
        name: proj?.name || "Unknown",
        slug: proj?.slug || "",
        owner: proj?.userId || null,
        fileCount: p.fileCount,
        sizeBytes: p.sizeBytes,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalFiles: fileStats[0]?.totalFiles || 0,
        totalSizeBytes: fileStats[0]?.totalSizeBytes || 0,
        topProjects,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// DELETE /admin/projects/:projectId - admin override, no owner check
export const adminDeleteProject = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByIdAndDelete(projectId).select("name userId members");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    await ProjectFile.deleteMany({ projectId: project._id });

    await notify(
      project.userId.toString(),
      "project_deleted",
      `Your project "${project.name}" was removed by an administrator.`
    );
    for (const member of project.members) {
      await notify(
        member.userId.toString(),
        "project_deleted",
        `The project "${project.name}" was removed by an administrator.`
      );
    }

    logAdminAction(
      req.user.userId,
      "project_deleted",
      "project",
      project._id.toString(),
      `Deleted project "${project.name}".`
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PATCH /admin/users/:userId/deactivate - toggles isDeactivated
export const setUserDeactivation = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { deactivated, note } = req.body;

    if (String(userId) === String(req.user.userId)) {
      return res.status(400).json({ success: false, message: "You can't deactivate your own account." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isDeactivated: !!deactivated,
        deactivationNote: deactivated ? note || "" : "",
      },
      { new: true }
    ).select("email fullname isDeactivated");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await notify(
      user._id.toString(),
      deactivated ? "account_deactivated" : "account_reactivated",
      deactivated
        ? "Your account was deactivated by an administrator."
        : "Your account was reactivated by an administrator."
    );

    logAdminAction(
      req.user.userId,
      deactivated ? "user_deactivated" : "user_reactivated",
      "user",
      user._id.toString(),
      `${deactivated ? "Deactivated" : "Reactivated"} ${user.email}${note ? ` — ${note}` : ""}.`
    );

    return res.status(200).json({
      success: true,
      message: `User ${deactivated ? "deactivated" : "reactivated"} successfully.`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PATCH /admin/users/:userId/role
export const setUserRole = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    if (String(userId) === String(req.user.userId)) {
      return res.status(400).json({ success: false, message: "You can't change your own role." });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select(
      "email fullname role"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await notify(
      user._id.toString(),
      "role_changed",
      `Your account role was changed to "${role}" by an administrator.`
    );

    logAdminAction(
      req.user.userId,
      "user_role_changed",
      "user",
      user._id.toString(),
      `Changed ${user.email}'s role to "${role}".`
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PATCH /admin/users/bulk-deactivate - body: { userIds: string[], deactivated: boolean, note?: string }
export const bulkSetUserDeactivation = async (req: any, res: any) => {
  try {
    const { userIds, deactivated, note } = req.body;

    if (!Array.isArray(userIds) || !userIds.length) {
      return res.status(400).json({ success: false, message: "userIds must be a non-empty array." });
    }

    const targetIds = userIds
      .map(String)
      .filter((id: string) => id !== String(req.user.userId));
    const skippedSelf = targetIds.length !== userIds.length;

    const users = await User.find({ _id: { $in: targetIds } }).select("email");
    await User.updateMany(
      { _id: { $in: targetIds } },
      { isDeactivated: !!deactivated, deactivationNote: deactivated ? note || "" : "" }
    );

    for (const u of users) {
      await notify(
        u._id.toString(),
        deactivated ? "account_deactivated" : "account_reactivated",
        deactivated
          ? "Your account was deactivated by an administrator."
          : "Your account was reactivated by an administrator."
      );
    }

    logAdminAction(
      req.user.userId,
      deactivated ? "user_bulk_deactivated" : "user_bulk_reactivated",
      "user",
      targetIds[0] || "bulk",
      `${deactivated ? "Deactivated" : "Reactivated"} ${users.length} user(s): ${users
        .map((u) => u.email)
        .join(", ")}.`
    );

    return res.status(200).json({
      success: true,
      message: `${users.length} user(s) ${deactivated ? "deactivated" : "reactivated"}${
        skippedSelf ? " (your own account was skipped)" : ""
      }.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// DELETE /admin/projects/bulk - body: { projectIds: string[] }
export const bulkDeleteProjects = async (req: any, res: any) => {
  try {
    const { projectIds } = req.body;

    if (!Array.isArray(projectIds) || !projectIds.length) {
      return res.status(400).json({ success: false, message: "projectIds must be a non-empty array." });
    }

    const projects = await Project.find({ _id: { $in: projectIds } }).select("name userId members");

    await Project.deleteMany({ _id: { $in: projectIds } });
    await ProjectFile.deleteMany({ projectId: { $in: projectIds } });

    for (const project of projects) {
      await notify(
        project.userId.toString(),
        "project_deleted",
        `Your project "${project.name}" was removed by an administrator.`
      );
      for (const member of project.members) {
        await notify(
          member.userId.toString(),
          "project_deleted",
          `The project "${project.name}" was removed by an administrator.`
        );
      }
    }

    logAdminAction(
      req.user.userId,
      "project_bulk_deleted",
      "project",
      String(projects[0]?._id || "bulk"),
      `Deleted ${projects.length} project(s): ${projects.map((p) => p.name).join(", ")}.`
    );

    return res.status(200).json({
      success: true,
      message: `${projects.length} project(s) deleted successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

const csvCell = (value: any) => {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// GET /admin/users/export - respects ?search=
export const exportUsersCsv = async (req: any, res: any) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = search
      ? {
          $or: [
            { fullname: { $regex: escapeRegex(search), $options: "i" } },
            { email: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("fullname email role isVerified isDeactivated lastLoginAt createdAt")
      .sort({ createdAt: -1 });

    const header = ["Full Name", "Email", "Role", "Verified", "Deactivated", "Last Login", "Joined"];
    const rows = users.map((u) =>
      [u.fullname, u.email, u.role, u.isVerified, u.isDeactivated, u.lastLoginAt || "", u.createdAt]
        .map(csvCell)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="users.csv"`);
    return res.status(200).send(csv);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /admin/projects/export - respects ?search=
export const exportProjectsCsv = async (req: any, res: any) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { description: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const projects = await Project.find(filter)
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    const fileCounts = await ProjectFile.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);
    const fileCountByProject = new Map(fileCounts.map((f: any) => [String(f._id), f.count]));

    const header = ["Name", "Slug", "Owner Email", "Members", "Files", "Created"];
    const rows = projects.map((p: any) =>
      [
        p.name,
        p.slug,
        p.userId?.email || "",
        p.members?.length || 0,
        fileCountByProject.get(String(p._id)) || 0,
        p.createdAt,
      ]
        .map(csvCell)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="projects.csv"`);
    return res.status(200).send(csv);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /admin/logs - recent admin actions
export const getAdminLogs = async (_req: any, res: any) => {
  try {
    const logs = await AdminLog.find()
      .populate("actorId", "fullname email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /admin/plans - unpaginated, plans are admin-curated and low cardinality
export const getAllPlans = async (_req: any, res: any) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });

    const userCounts = await User.aggregate([
      { $match: { planId: { $ne: null } } },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
    ]);
    const userCountByPlan = new Map(userCounts.map((u: any) => [String(u._id), u.count]));

    const data = plans.map((p) => ({
      ...p.toObject(),
      userCount: userCountByPlan.get(String(p._id)) || 0,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// POST /admin/plans
export const createPlan = async (req: any, res: any) => {
  try {
    const {
      name,
      priceLabel,
      priceSuffix,
      description,
      features,
      maxFileSizeBytes,
      maxProjectsPerUser,
      maxStorageBytes,
      maxMembersPerProject,
      pricingOptions,
      isHidden,
      isDefault,
      isActive,
    } = req.body;

    const existing = await Plan.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: "A plan with this name already exists." });
    }

    if (isDefault) {
      await Plan.updateMany({ isDefault: true }, { isDefault: false });
    }

    const plan = await Plan.create({
      name,
      priceLabel,
      priceSuffix,
      description,
      features,
      maxFileSizeBytes,
      maxProjectsPerUser,
      maxStorageBytes,
      maxMembersPerProject,
      pricingOptions: pricingOptions || [],
      isHidden: !!isHidden,
      isDefault: !!isDefault,
      isActive: isDefault ? true : isActive ?? true,
    });

    logAdminAction(req.user.userId, "plan_created", "plan", plan._id.toString(), `Created plan "${plan.name}".`);

    return res.status(201).json({
      success: true,
      message: "Plan created successfully.",
      data: plan,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PUT /admin/plans/:planId
export const updatePlan = async (req: any, res: any) => {
  try {
    const { planId } = req.params;
    const updates = { ...req.body };

    if (updates.name) {
      const existing = await Plan.findOne({ name: updates.name, _id: { $ne: planId } });
      if (existing) {
        return res.status(409).json({ success: false, message: "A plan with this name already exists." });
      }
    }

    if (updates.isDefault) {
      await Plan.updateMany({ _id: { $ne: planId }, isDefault: true }, { isDefault: false });
      updates.isActive = true;
    }

    const plan = await Plan.findByIdAndUpdate(planId, updates, { new: true, runValidators: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    logAdminAction(req.user.userId, "plan_updated", "plan", plan._id.toString(), `Updated plan "${plan.name}".`);

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully.",
      data: plan,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// DELETE /admin/plans/:planId
export const deletePlan = async (req: any, res: any) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    const assignedCount = await User.countDocuments({ planId });
    if (assignedCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete "${plan.name}" - it's assigned to ${assignedCount} user(s). Reassign those users first, or set this plan to inactive instead of deleting it.`,
      });
    }

    await plan.deleteOne();

    logAdminAction(req.user.userId, "plan_deleted", "plan", planId, `Deleted plan "${plan.name}".`);

    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PATCH /admin/users/:userId/plan - body: { planId: string | null, durationMonths?: number }
export const setUserPlan = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { planId, durationMonths } = req.body;

    let plan = null;
    let planExpiresAt: Date | null = null;

    if (planId) {
      plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: "Plan not found." });
      }
      if (!plan.isActive) {
        return res.status(400).json({ success: false, message: "This plan is inactive and can't be newly assigned." });
      }

      if (plan.pricingOptions.length > 0) {
        const option = plan.pricingOptions.find((o: IPlanPricingOption) => o.durationMonths === durationMonths);
        if (!option) {
          return res.status(400).json({
            success: false,
            message: `Choose one of this plan's durations: ${plan.pricingOptions
              .map((o: IPlanPricingOption) => `${o.durationMonths}mo`)
              .join(", ")}.`,
          });
        }
        planExpiresAt = new Date();
        planExpiresAt.setMonth(planExpiresAt.getMonth() + option.durationMonths);
      }
      // pricingOptions empty (e.g. the default/free plan) -> planExpiresAt stays null (never expires)
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { planId: planId || null, planExpiresAt },
      { new: true }
    )
      .select("email fullname planId planExpiresAt")
      .populate("planId", "name");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const expiryNote = planExpiresAt ? ` (expires ${planExpiresAt.toLocaleDateString()})` : "";
    await notify(
      user._id.toString(),
      "plan_changed",
      plan
        ? `Your account was moved to the "${plan.name}" plan by an administrator${expiryNote}.`
        : "Your plan assignment was removed by an administrator."
    );

    logAdminAction(
      req.user.userId,
      "user_plan_changed",
      "user",
      user._id.toString(),
      `Set ${user.email}'s plan to "${plan ? plan.name : "none"}"${expiryNote}.`
    );

    return res.status(200).json({
      success: true,
      message: "User plan updated successfully.",
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /admin/contact - submissions from the public /contact form
export const getContactQueries = async (req: any, res: any) => {
  try {
    const { page, limit, search } = parsePagination(req);

    const filter = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { email: { $regex: escapeRegex(search), $options: "i" } },
            { subject: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const [queries, total, unreadCount] = await Promise.all([
      ContactQuery.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContactQuery.countDocuments(filter),
      ContactQuery.countDocuments({ isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: queries,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
      unreadCount,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PATCH /admin/contact/:queryId/read - body: { isRead: boolean }
export const setContactQueryRead = async (req: any, res: any) => {
  try {
    const { queryId } = req.params;
    const { isRead } = req.body;

    const query = await ContactQuery.findByIdAndUpdate(queryId, { isRead: !!isRead }, { new: true });
    if (!query) {
      return res.status(404).json({ success: false, message: "Contact query not found." });
    }

    return res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

const buildAudienceFilter = (audience: string, planId?: string) => {
  const filter: any = { isDeactivated: { $ne: true } };
  if (audience === "verified") filter.isVerified = true;
  if (audience === "plan") filter.planId = planId;
  return filter;
};

// GET /admin/broadcast/audience-count?audience=all|verified|plan&planId=
export const getBroadcastAudienceCount = async (req: any, res: any) => {
  try {
    const audience = (req.query.audience as string) || "all";
    const planId = req.query.planId as string | undefined;

    if (!["all", "verified", "plan"].includes(audience)) {
      return res.status(400).json({ success: false, message: "Invalid audience." });
    }
    if (audience === "plan" && !planId) {
      return res.status(200).json({ success: true, data: { count: 0 } });
    }

    const count = await User.countDocuments(buildAudienceFilter(audience, planId));
    return res.status(200).json({ success: true, data: { count } });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// POST /admin/broadcast - body: { title, message, audience, planId? } - creates an in-app
// notification for every matching (active) user
export const sendBroadcast = async (req: any, res: any) => {
  try {
    const { title, message, audience, planId } = req.body;

    if (audience === "plan") {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: "Plan not found." });
      }
    }

    const recipients = await User.find(buildAudienceFilter(audience, planId)).select("_id");
    if (!recipients.length) {
      return res.status(400).json({ success: false, message: "No users match this audience." });
    }

    const fullMessage = `${title} — ${message}`;
    await Promise.all(recipients.map((u) => notify(u._id.toString(), "announcement", fullMessage)));

    logAdminAction(
      req.user.userId,
      "broadcast_sent",
      "broadcast",
      req.user.userId,
      `Sent "${title}" to ${recipients.length} user(s) (${audience}).`
    );

    return res.status(200).json({
      success: true,
      message: `Announcement sent to ${recipients.length} user(s).`,
      data: { recipientCount: recipients.length },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /admin/settings
export const getAppSettings = async (_req: any, res: any) => {
  try {
    const settings = await appSettingsService.getSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// PATCH /admin/settings - body: { referralRewardBytes }
export const updateAppSettings = async (req: any, res: any) => {
  try {
    const { referralRewardBytes } = req.body;
    const settings = await appSettingsService.updateSettings({ referralRewardBytes });

    logAdminAction(
      req.user.userId,
      "settings_updated",
      "settings",
      "global",
      `Set referral reward to ${(referralRewardBytes / (1024 * 1024)).toFixed(0)}MB.`
    );

    return res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
