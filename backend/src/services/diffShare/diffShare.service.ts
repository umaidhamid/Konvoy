import crypto from "crypto";
import DiffShare from "../../models/diffShare.model.js";
import { AppError } from "../../utils/AppError.js";

const generateToken = () => crypto.randomBytes(24).toString("hex");

const isExhausted = (diff: any) =>
  diff.maxViews !== null && diff.maxViews !== undefined && diff.viewCount >= diff.maxViews;

export const diffShareService = {
  async createDiffShare(
    userId: string,
    leftContent: string,
    rightContent: string,
    expiresInMinutes: number,
    title?: string,
    leftLabel?: string,
    rightLabel?: string,
    language?: string,
    maxViews?: number | null
  ) {
    const diff = await DiffShare.create({
      token: generateToken(),
      createdBy: userId,
      title: title || "",
      leftLabel: leftLabel || "Original",
      rightLabel: rightLabel || "Modified",
      leftContent,
      rightContent,
      language: language || "plaintext",
      maxViews: maxViews ?? null,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });

    return { token: diff.token, expiresAt: diff.expiresAt, maxViews: diff.maxViews };
  },

  // Public read - this is a read-only share (no separate peek/reveal step), so
  // the view counter is incremented on every successful load.
  async getDiffShare(token: string) {
    const diff = await DiffShare.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!diff) throw new AppError("This diff link is invalid or has expired.", 404);
    if (isExhausted(diff)) {
      throw new AppError("This diff link has reached its view limit and is no longer available.", 410);
    }

    diff.viewCount += 1;
    await diff.save();

    return {
      title: diff.title,
      leftLabel: diff.leftLabel,
      rightLabel: diff.rightLabel,
      leftContent: diff.leftContent,
      rightContent: diff.rightContent,
      language: diff.language,
      viewCount: diff.viewCount,
      maxViews: diff.maxViews,
      createdAt: diff.createdAt,
      expiresAt: diff.expiresAt,
    };
  },

  async listMyDiffShares(userId: string) {
    return DiffShare.find({ createdBy: userId })
      .select("-leftContent -rightContent")
      .sort({ createdAt: -1 });
  },

  async deleteDiffShare(id: string, userId: string) {
    const diff = await DiffShare.findOneAndDelete({ _id: id, createdBy: userId });
    if (!diff) throw new AppError("Diff share not found", 404);
  },
};
