import Project from "../../models/projects.model.js";
import Plan from "../../models/plan.model.js";
import { resolvePlanLimitsForUser, getActivePlans, getAccountStorageUsedBytes } from "./plan.service.js";

// GET /plans/me
export const getMyPlan = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const [limits, allPlans, projectCount, storageUsedBytes] = await Promise.all([
      resolvePlanLimitsForUser(userId),
      getActivePlans(),
      Project.countDocuments({ userId }),
      getAccountStorageUsedBytes(userId),
    ]);

    // Hidden plans are excluded from the "browse plans" list a user sees, unless
    // it happens to be their own current plan (so their card still renders).
    const plans = allPlans.filter((p) => !p.isHidden || String(p._id) === limits.planId);

    return res.status(200).json({
      success: true,
      data: {
        plans,
        currentPlanId: limits.planId,
        currentPlanExpiresAt: limits.planExpiresAt,
        currentPlanLimits: {
          maxFileSizeBytes: limits.maxFileSizeBytes,
          maxFilesPerProject: limits.maxFilesPerProject,
          maxProjectsPerUser: limits.maxProjectsPerUser,
          maxStorageBytes: limits.maxStorageBytes,
          maxMembersPerProject: limits.maxMembersPerProject,
        },
        usage: {
          projectCount,
          storageUsedBytes,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// GET /plans/public - no auth, powers the public marketing pricing page
export const getPublicPlans = async (_req: any, res: any) => {
  try {
    const plans = await Plan.find({ isActive: true, isHidden: { $ne: true } }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: plans });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
