import User from "../../models/users.model.js";
import Plan from "../../models/plan.model.js";
import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";

// Fallback used only when a user has no assigned plan AND no plan is marked
// isDefault - keeps a fresh deployment (zero Plan documents yet) working exactly
// as it did before this feature existed.
export const DEFAULT_PLAN_LIMITS = {
  maxFileSizeBytes: 2 * 1024 * 1024, // matches the old MAX_FILE_CONTENT_BYTES constant
  maxFilesPerProject: 500, // no prior constant existed - generous placeholder, tune per real usage
  maxProjectsPerUser: 20, // matches the old MAX_PROJECTS_PER_USER constant
  maxStorageBytes: 500 * 1024 * 1024, // no prior constant existed - generous placeholder, tune per real usage
  maxMembersPerProject: 5, // no prior constant existed - generous placeholder, tune per real usage
};

export interface ResolvedPlanLimits {
  planId: string | null;
  planName: string;
  maxFileSizeBytes: number;
  maxFilesPerProject: number;
  maxProjectsPerUser: number;
  maxStorageBytes: number;
  maxMembersPerProject: number;
  planExpiresAt: Date | null;
  source: "user" | "default-plan" | "hardcoded-fallback";
}

// A user keeps their assigned plan's limits even if that plan is later
// deactivated (isActive only blocks NEW assignments, see setUserPlan) - but an
// EXPIRED assignment (planExpiresAt in the past) falls through to the default
// plan/hardcoded fallback below, same as having no plan at all.
export async function resolvePlanLimitsForUser(userId: string): Promise<ResolvedPlanLimits> {
  const user = await User.findById(userId).select("planId planExpiresAt").populate("planId");
  const assignedPlan = user?.planId as any;
  const isExpired = !!(user?.planExpiresAt && user.planExpiresAt.getTime() < Date.now());

  if (assignedPlan && !isExpired) {
    return {
      planId: String(assignedPlan._id),
      planName: assignedPlan.name,
      maxFileSizeBytes: assignedPlan.maxFileSizeBytes,
      maxFilesPerProject: assignedPlan.maxFilesPerProject,
      maxProjectsPerUser: assignedPlan.maxProjectsPerUser,
      maxStorageBytes: assignedPlan.maxStorageBytes,
      maxMembersPerProject: assignedPlan.maxMembersPerProject,
      planExpiresAt: user?.planExpiresAt || null,
      source: "user",
    };
  }

  const defaultPlan = await Plan.findOne({ isDefault: true, isActive: true }).sort({ createdAt: 1 });
  if (defaultPlan) {
    return {
      planId: String(defaultPlan._id),
      planName: defaultPlan.name,
      maxFileSizeBytes: defaultPlan.maxFileSizeBytes,
      maxFilesPerProject: defaultPlan.maxFilesPerProject,
      maxProjectsPerUser: defaultPlan.maxProjectsPerUser,
      maxStorageBytes: defaultPlan.maxStorageBytes,
      maxMembersPerProject: defaultPlan.maxMembersPerProject,
      planExpiresAt: null,
      source: "default-plan",
    };
  }

  return {
    planId: null,
    planName: "Free",
    ...DEFAULT_PLAN_LIMITS,
    planExpiresAt: null,
    source: "hardcoded-fallback",
  };
}

export async function getActivePlans() {
  return Plan.find({ isActive: true }).sort({ createdAt: 1 });
}

// Total plaintext bytes stored across every non-deleted file in every project
// OWNED by this user (not projects they're merely a member of) - storage is an
// account-wide quota, billed to whoever owns the project, same as maxFilesPerProject.
export async function getAccountStorageUsedBytes(ownerId: string): Promise<number> {
  const ownedProjects = await Project.find({ userId: ownerId }).select("_id");
  const projectIds = ownedProjects.map((p) => p._id);
  if (!projectIds.length) return 0;

  const [agg] = await ProjectFile.aggregate([
    { $match: { projectId: { $in: projectIds }, isDeleted: false } },
    { $group: { _id: null, totalBytes: { $sum: "$sizeBytes" } } },
  ]);
  return agg?.totalBytes || 0;
}
