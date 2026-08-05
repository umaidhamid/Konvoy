import ActivityLog from "../../models/activityLog.model.js";

export const logActivity = (
  projectId: string,
  actorId: string,
  action: string,
  message: string
) => {
  ActivityLog.create({ projectId, actorId, action, message }).catch((err) =>
    console.error("Failed to write activity log:", err)
  );
};

export const listProjectActivity = async (
  projectId: string,
  page: number,
  limit: number
) => {
  const [entries, total] = await Promise.all([
    ActivityLog.find({ projectId })
      .populate("actorId", "fullname email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActivityLog.countDocuments({ projectId }),
  ]);
  return { entries, total };
};
