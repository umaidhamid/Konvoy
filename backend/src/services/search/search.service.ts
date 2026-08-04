import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const accessFilter = (userId: string) => ({
  $or: [{ userId }, { "members.userId": userId }],
});

export const searchService = {
  async search(userId: string, query: string) {
    const regex = { $regex: escapeRegex(query), $options: "i" };

    const accessibleProjects = await Project.find(accessFilter(userId)).select("_id name slug userId members");
    const projectById = new Map(accessibleProjects.map((p) => [String(p._id), p]));

    // Restricted members only see the file subset they were granted; owners and
    // unrestricted members see every file in the project.
    const allowedFileIds = (project: any) => {
      if (String(project.userId) === String(userId)) return null;
      const member = project.members?.find((m: any) => String(m.userId) === String(userId));
      return member?.fileIds?.length ? member.fileIds.map((id: any) => String(id)) : null;
    };
    const fileScopeClauses = accessibleProjects.map((p) => {
      const fileIds = allowedFileIds(p);
      return fileIds ? { projectId: p._id, _id: { $in: fileIds } } : { projectId: p._id };
    });

    const [projects, files] = await Promise.all([
      Project.find({
        $and: [accessFilter(userId), { $or: [{ name: regex }, { description: regex }] }],
      })
        .select("name slug description")
        .limit(10),
      fileScopeClauses.length
        ? ProjectFile.find({ $and: [{ $or: fileScopeClauses }, { isDeleted: false, name: regex }] })
            .select("name projectId")
            .limit(20)
        : [],
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
