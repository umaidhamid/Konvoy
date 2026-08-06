import { Request, Response } from "express";
import { envDriftService } from "./envDrift.service.js";

const handleError = (res: Response, error: unknown) => {
  const status = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Something went wrong.";
  return res.status(status).json({ success: false, message });
};

// GET /env-drift/compare?fileIdA=&fileIdB=&reveal=true
export const compareEnvFiles = async (req: any, res: Response) => {
  try {
    const { fileIdA, fileIdB, reveal } = req.query as { fileIdA?: string; fileIdB?: string; reveal?: string };
    if (!fileIdA || !fileIdB) {
      return res.status(400).json({ success: false, message: "Both fileIdA and fileIdB are required" });
    }
    const result = await envDriftService.compare(fileIdA, fileIdB, req.user.userId, reveal === "true");
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};
