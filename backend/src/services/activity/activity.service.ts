import ActivityLog, { ActivityAction } from "../../models/activityLog.model.js";

export const logActivity = (
  projectId: string,
  actorId: string,
  action: ActivityAction,
  message: string
) => {
  ActivityLog.create({ projectId, actorId, action, message }).catch((err) =>
    console.error("Failed to write activity log:", err)
  );
};

export const listProjectActivity = async (
  projectId: string,
  requesterId: string,
  page: number,
  limit: number
) => {
  const [docs, total] = await Promise.all([
    ActivityLog.find({ projectId })
      .populate("actorId", "fullname email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActivityLog.countDocuments({ projectId }),
  ]);

  const entries = docs.map((doc) => {
    const actor = doc.actorId as any;
    return {
      _id: doc._id,
      projectId: doc.projectId,
      action: doc.action,
      message: doc.message,
      createdAt: doc.createdAt,
      isMine: String(actor?._id) === String(requesterId),
      actor: actor?._id
        ? { _id: actor._id, name: actor.fullname || actor.email }
        : null,
    };
  });

  return { entries, total };
};
