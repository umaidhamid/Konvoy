import { Request, Response } from "express";
import { awsPushService } from "./awsPush.service.js";

const handleError = (res: Response, error: unknown) => {
  const status = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Something went wrong.";
  return res.status(status).json({ success: false, message });
};

// POST /aws-push/ssm
// Body: { fileId, region, accessKeyId, secretAccessKey, prefix, overwrite }
// Credentials are used for this request only and are never persisted or logged.
export const pushToParameterStore = async (req: any, res: Response) => {
  try {
    const { fileId, region, accessKeyId, secretAccessKey, prefix, overwrite, secure } = req.body || {};

    if (!fileId || !region || !accessKeyId || !secretAccessKey || !prefix) {
      return res.status(400).json({
        success: false,
        message: "fileId, region, accessKeyId, secretAccessKey and prefix are all required",
      });
    }

    const result = await awsPushService.pushToParameterStore(
      fileId,
      req.user.userId,
      { region, accessKeyId, secretAccessKey },
      prefix,
      !!overwrite,
      secure !== false
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};
