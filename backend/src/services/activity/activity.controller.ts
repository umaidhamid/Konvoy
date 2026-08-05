import Project from "../../models/projects.model.js";
import { listProjectActivity } from "./activity.service.js";

const accessFilter = (userId: string) => ({
  $or: [{ userId }, { "members.userId": userId }],
});

// GET /projects/:projectId/activity?page=&limit=
export const getProjectActivity = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const project = await Project.findOne({
      _id: projectId,
      ...accessFilter(req.user.userId),
    }).select("_id");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const { entries, total } = await listProjectActivity(projectId, page, limit);

    return res.status(200).json({
      success: true,
      data: entries,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};
