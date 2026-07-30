import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const accessFilter = (userId: string) => ({
  $or: [{ userId }, { "members.userId": userId }],
});

export const searchService = {
  async search(userId: string, query: string) {
    const regex = { $regex: escapeRegex(query), $options: "i" };

    const accessibleProjects = await Project.find(accessFilter(userId)).select("_id name slug");
    const projectIds = accessibleProjects.map((p) => p._id);
    const projectById = new Map(accessibleProjects.map((p) => [String(p._id), p]));

    const [projects, files] = await Promise.all([
      Project.find({ ...accessFilter(userId), $or: [{ name: regex }, { description: regex }] })
        .select("name slug description")
        .limit(10),
      ProjectFile.find({ projectId: { $in: projectIds }, isDeleted: false, name: regex })
        .select("name projectId")
        .limit(20),
    ]);

    return {
      projects: projects.map((p) => ({ _id: p._id, name: p.name, slug: p.slug, description: p.description })),
      files: files.map((f) => {
        const project = projectById.get(String(f.projectId));
        return {
          _id: f._id,
          name: f.name,
          projectId: f.projectId,
          projectName: project?.name || "Unknown project",
          projectSlug: project?.slug || "",
        };
      }),
    };
  },
};
