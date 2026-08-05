import User from "../../models/users.model.js";
import Project from "../../models/projects.model.js";
import ProjectFile from "../../models/ProjectFile.model.js";
import Secret from "../../models/secret.model.js";
import DiffShare from "../../models/diffShare.model.js";
import ActivityLog from "../../models/activityLog.model.js";
import Notification from "../../models/notification.model.js";
import { decrypt } from "../../utils/encryption.js";
import { AppError } from "../../utils/AppError.js";

// Self-service GDPR-style export of everything tied to this account. Secret
// CONTENT is deliberately excluded (only metadata) - decrypted secrets sitting
// in a downloaded JSON file on disk defeat the purpose of the whole feature.
export const dataExportService = {
  async generateUserDataExport(userId: string) {
    const user = await User.findById(userId).select(
      "-passwordHash -refreshToken -recoveryCode -verificationToken -resetPasswordToken -pendingEmailToken"
    );
    if (!user) throw new AppError("Account not found", 404);

    const projects = await Project.find({ userId }).lean();
    const projectIds = projects.map((p) => p._id);

    const files = await ProjectFile.find({ projectId: { $in: projectIds }, isDeleted: false }).lean();
    const decryptedFiles = files.map((f) => ({
      projectId: f.projectId,
      name: f.name,
      language: f.language,
      content: safeDecrypt(f.content),
      sizeBytes: f.sizeBytes,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    const secrets = await Secret.find({ createdBy: userId }).select("-content -passphraseHash").lean();
    const diffShares = await DiffShare.find({ createdBy: userId }).lean();
    const activity = await ActivityLog.find({ actorId: userId }).sort({ createdAt: -1 }).limit(1000).lean();
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(1000).lean();

    return {
      exportedAt: new Date().toISOString(),
      account: user,
      projects,
      files: decryptedFiles,
      secrets,
      diffShares,
      activity,
      notifications,
    };
  },
};

function safeDecrypt(content: string) {
  try {
    return decrypt(content);
  } catch {
    return null;
  }
}
