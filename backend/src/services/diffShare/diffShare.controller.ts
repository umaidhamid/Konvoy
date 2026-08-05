import { Request, Response } from "express";
import { diffShareService } from "./diffShare.service.js";

const handleError = (res: Response, error: unknown) => {
  const status = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Something went wrong.";
  return res.status(status).json({ success: false, message });
};

// POST /diff-shares
export const createDiffShare = async (req: any, res: Response) => {
  try {
    const { leftContent, rightContent, expiresInMinutes, title, leftLabel, rightLabel, language, maxViews } = req.body;
    const result = await diffShareService.createDiffShare(
      req.user.userId,
      leftContent,
      rightContent,
      expiresInMinutes,
      title,
      leftLabel,
      rightLabel,
      language,
      maxViews ?? null
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /diff-shares/mine
export const listMyDiffShares = async (req: any, res: Response) => {
  try {
    const diffs = await diffShareService.listMyDiffShares(req.user.userId);
    return res.status(200).json({ success: true, data: diffs });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /diff-shares/:id
export const deleteDiffShare = async (req: any, res: Response) => {
  try {
    await diffShareService.deleteDiffShare(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, message: "Removed." });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /diff-shares/:token - public read
export const getDiffShare = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as { token: string };
    const result = await diffShareService.getDiffShare(token);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};
