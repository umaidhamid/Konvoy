// ============================================
// services/projectfile.service.ts
// ============================================
import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";
import { AppError } from "../../utils/AppError.js"; // swap for your own error class if different
import { encrypt, decrypt } from "../../utils/encryption.js";
import { resolvePlanLimitsForUser, getAccountStorageUsedBytes } from "../plans/plan.service.js";

const accessFilter = (userId: string) => ({
  $or: [{ userId }, { "members.userId": userId }],
});

// Resolves the requesting user's access on a project:
// - owner: full read/write on every file
// - member: full read/write, scoped to fileIds (empty/undefined = all files, else restricted set)
// - null if the user has no access at all
const getAccess = (project: any, userId: string) => {
  if (String(project.userId) === String(userId)) {
    return { role: "owner" as const, fileIds: null as string[] | null };
  }
  const member = project.members?.find((m: any) => String(m.userId) === String(userId));
  if (!member) return null;
  return {
    role: member.role as "member",
    fileIds: member.fileIds?.length ? member.fileIds.map((id: any) => String(id)) : null,
  };
};

const requireWriteAccess = (access: { role: string } | null) => {
  if (!access) throw new AppError("Project not found", 404);
};

const requireFileInScope = (access: { fileIds: string[] | null }, fileId: string) => {
  if (access.fileIds && !access.fileIds.includes(String(fileId))) {
    throw new AppError("File not found", 404);
  }
};

const findAccessibleProjectBySlug = async (slug: string, userId: string) => {
  const project = await Project.findOne({ slug, ...accessFilter(userId) });
  if (!project) throw new AppError("Project not found", 404);
  const access = getAccess(project, userId)!;
  return { project, access };
};

// File access is scoped to the project (owner or member), not the original creator,
// so team members can see/edit files created by other members - subject to their file scope.
const findAccessibleFile = async (id: string, userId: string, opts: { write?: boolean } = {}) => {
  const file = await ProjectFile.findOne({ _id: id, isDeleted: false });
  if (!file) throw new AppError("File not found", 404);

  const project = await Project.findOne({ _id: file.projectId, ...accessFilter(userId) });
  if (!project) throw new AppError("File not found", 404);

  const access = getAccess(project, userId)!;
  requireFileInScope(access, file._id.toString());
  if (opts.write) requireWriteAccess(access);

  return file;
};

export const projectFileService = {
  async getProjectFiles(slug: string, userId: string) {
    const { project, access } = await findAccessibleProjectBySlug(slug, userId);

    const fileFilter: any = { projectId: project._id, isDeleted: false };
    if (access.fileIds) fileFilter._id = { $in: access.fileIds };

    const files = await ProjectFile.find(fileFilter)
      .select("_id name path extension language createdAt")
      .sort({ createdAt: 1 });

    const projectObj = { ...project.toObject(), myRole: access.role, myFileIds: access.fileIds };

    return { project: projectObj, files };
  },

  async createProjectFile(
    slug: string,
    userId: string,
    payload: { name: string }
  ) {
    const { name } = payload;

    if (!name?.trim()) throw new AppError("File name is required", 400);

    const { project, access } = await findAccessibleProjectBySlug(slug, userId);
    requireWriteAccess(access);

    const existing = await ProjectFile.findOne({
      projectId: project._id,
      name,
      isDeleted: false,
    });
    if (existing) throw new AppError("A file with this name already exists", 409);

    // File-count cap is scoped to the project OWNER's plan, not the acting member's -
    // otherwise a lower-tier teammate could get blocked inside someone else's larger project.
    const { maxFilesPerProject } = await resolvePlanLimitsForUser(String(project.userId));
    const existingFileCount = await ProjectFile.countDocuments({
      projectId: project._id,
      isDeleted: false,
    });
    if (existingFileCount >= maxFilesPerProject) {
      throw new AppError(`This project has reached its limit of ${maxFilesPerProject} files.`, 403);
    }

    const file = await ProjectFile.create({
      projectId: project._id,
      userId,
      name,
      content: encrypt(""),
    });

    return file;
  },

  async getProjectFileById(id: string, userId: string) {
    const file = await findAccessibleFile(id, userId);
    const fileObj = file.toObject();

    fileObj.content = decrypt(file.content);

    return fileObj;
  },

  async updateProjectFileContent(id: string, userId: string, content: string) {
    if (content === undefined) throw new AppError("Content is required", 400);

    const newBytes = Buffer.byteLength(content, "utf8");

    // File-size cap uses the ACTING user's own plan - "how much can this person's save contain".
    const { maxFileSizeBytes } = await resolvePlanLimitsForUser(userId);
    if (newBytes > maxFileSizeBytes) {
      throw new AppError(
        `File exceeds the ${(maxFileSizeBytes / (1024 * 1024)).toFixed(1)}MB size limit for your plan`,
        413
      );
    }

    const file = await findAccessibleFile(id, userId, { write: true });

    // Storage quota is scoped to the project OWNER's account/plan, same reasoning
    // as the per-project file-count cap - it's the owner's storage being used up.
    const project = await Project.findById(file.projectId).select("userId");
    const ownerId = String(project!.userId);
    const { maxStorageBytes } = await resolvePlanLimitsForUser(ownerId);
    const usedBytes = await getAccountStorageUsedBytes(ownerId);
    const projectedTotal = usedBytes - (file.sizeBytes || 0) + newBytes;
    if (projectedTotal > maxStorageBytes) {
      throw new AppError(
        `This account has reached its ${(maxStorageBytes / (1024 * 1024)).toFixed(0)}MB storage limit.`,
        413
      );
    }

    // Keep the last 2 versions before this save, most recent first
    file.previousVersions = [
      { content: file.content, updatedAt: file.updatedAt },
      ...(file.previousVersions || []),
    ].slice(0, 2) as any;

    file.content = encrypt(content);
    file.sizeBytes = newBytes;
    await file.save();
    return file;
  },

  async getFileVersions(id: string, userId: string) {
    const file = await findAccessibleFile(id, userId);

    return {
      current: { content: decrypt(file.content), updatedAt: file.updatedAt },
      previousVersions: (file.previousVersions || []).map((v: any) => ({
        content: decrypt(v.content),
        updatedAt: v.updatedAt,
      })),
    };
  },

  async restoreFileVersion(id: string, userId: string, versionIndex: number) {
    const file = await findAccessibleFile(id, userId, { write: true });
    const versions = file.previousVersions || [];
    const target = versions[versionIndex];
    if (!target) throw new AppError("Version not found", 404);

    const remaining = versions.filter((_: any, i: number) => i !== versionIndex);
    file.previousVersions = [
      { content: file.content, updatedAt: file.updatedAt },
      ...remaining,
    ].slice(0, 2) as any;

    file.content = target.content;
    file.sizeBytes = Buffer.byteLength(decrypt(target.content), "utf8");
    await file.save();

    const fileObj = file.toObject();
    fileObj.content = decrypt(file.content);
    return fileObj;
  },

  async renameProjectFile(id: string, userId: string, name: string) {
    if (!name?.trim()) throw new AppError("File name is required", 400);

    const file = await findAccessibleFile(id, userId, { write: true });

    const duplicate = await ProjectFile.findOne({
      _id: { $ne: id },
      projectId: file.projectId,
      name,
      isDeleted: false,
    });
    if (duplicate) throw new AppError("A file with this name already exists", 409);

    file.name = name;
    await file.save();
    return file;
  },

  async deleteProjectFile(id: string, userId: string) {
    const file = await findAccessibleFile(id, userId, { write: true });

    file.isDeleted = true;
    await file.save();
    return file;
  },
};
