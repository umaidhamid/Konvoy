// ============================================
// services/projectfile.service.ts
// ============================================
import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";
import { AppError } from "../../utils/AppError.js"; // swap for your own error class if different
import { encrypt, decrypt } from "../../utils/encryption.js";
export const projectFileService = {
  async getProjectFiles(slug: string, userId: string) {
    const project = await Project.findOne({ slug, userId });
    if (!project) throw new AppError("Project not found", 404);

    const files = await ProjectFile.find({
      projectId: project._id,
      userId,
      isDeleted: false,
    })
      .select("_id name path extension language createdAt")
      .sort({ createdAt: 1 });

    return { project, files };
  },

  async createProjectFile(
    slug: string,
    userId: string,
    payload: { name: string }
  ) {
    const { name } = payload;

    if (!name?.trim()) throw new AppError("File name is required", 400);

    const project = await Project.findOne({ slug, userId });
    if (!project) throw new AppError("Project not found", 404);

    const existing = await ProjectFile.findOne({
      projectId: project._id,
      userId,
      name,
      isDeleted: false,
    });
    if (existing) throw new AppError("A file with this name already exists", 409);

    const file = await ProjectFile.create({
      projectId: project._id,
      userId,
      name,
      content: encrypt(""),
    });

    return file;
  },

  async getProjectFileById(id: string, userId: string) {
    const file = await ProjectFile.findOne({ _id: id, userId, isDeleted: false });
    if (!file) throw new AppError("File not found", 404);
    const fileObj = file.toObject();

fileObj.content = decrypt(file.content);

return fileObj;
  },

  async updateProjectFileContent(id: string, userId: string, content: string) {
    if (content === undefined) throw new AppError("Content is required", 400);

    const file = await ProjectFile.findOne({ _id: id, userId, isDeleted: false });
    if (!file) throw new AppError("File not found", 404);

file.content = encrypt(content);
    await file.save();
    return file;
  },

  async renameProjectFile(id: string, userId: string, name: string) {
    if (!name?.trim()) throw new AppError("File name is required", 400);

    const file = await ProjectFile.findOne({ _id: id, userId, isDeleted: false });
    if (!file) throw new AppError("File not found", 404);

    const duplicate = await ProjectFile.findOne({
      _id: { $ne: id },
      projectId: file.projectId,
      userId,
      name,
      isDeleted: false,
    });
    if (duplicate) throw new AppError("A file with this name already exists", 409);

    file.name = name;
    await file.save();
    return file;
  },

  async deleteProjectFile(id: string, userId: string) {
    const file = await ProjectFile.findOne({ _id: id, userId, isDeleted: false });
    if (!file) throw new AppError("File not found", 404);

    file.isDeleted = true;
    await file.save();
    return file;
  },
};