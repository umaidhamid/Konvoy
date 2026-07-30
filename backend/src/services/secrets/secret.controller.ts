import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { secretService } from "./secret.service.js";
import { JwtPayload } from "../../types/auth.js";

const handleError = (res: Response, error: unknown) => {
  const status = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Something went wrong.";
  return res.status(status).json({ success: false, message });
};

// Reveal/burn are public routes (the recipient may have no account), but a
// secret can optionally require sign-in. This never rejects - it just returns
// undefined when there's no valid session, same as being logged out.
const getOptionalUserId = (req: Request): string | undefined => {
  try {
    let accessToken = (req as any).cookies?.accessToken;
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) accessToken = authHeader.split(" ")[1];
    }
    if (!accessToken) return undefined;
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch {
    return undefined;
  }
};

// POST /secrets
export const createSecret = async (req: any, res: Response) => {
  try {
    const { content, expiresInMinutes, maxViews, label, passphrase, requireAuth } = req.body;
    const result = await secretService.createSecret(
      req.user.userId,
      content,
      expiresInMinutes,
      maxViews ?? null,
      label,
      passphrase,
      requireAuth
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /secrets/:id/recreate
export const recreateSecret = async (req: any, res: Response) => {
  try {
    const { expiresInMinutes, maxViews } = req.body;
    const result = await secretService.recreateSecret(req.params.id, req.user.userId, expiresInMinutes, maxViews ?? null);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /secrets/:id/extend
export const extendSecret = async (req: any, res: Response) => {
  try {
    const { addMinutes } = req.body;
    const secret = await secretService.extendExpiry(req.params.id, req.user.userId, addMinutes);
    return res.status(200).json({ success: true, data: secret });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /secrets/mine
export const listMySecrets = async (req: any, res: Response) => {
  try {
    const secrets = await secretService.listMySecrets(req.user.userId);
    return res.status(200).json({ success: true, data: secrets });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /secrets/export.csv
export const exportMySecretsCsv = async (req: any, res: Response) => {
  try {
    const csv = await secretService.exportMySecretsCsv(req.user.userId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="secrets.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /secrets/:id - revoke (soft, keeps the row in history)
export const revokeSecret = async (req: any, res: Response) => {
  try {
    const secret = await secretService.revokeSecret(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, data: secret });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /secrets/:id/history - permanently remove a dead entry from the list
export const deleteSecretHistory = async (req: any, res: Response) => {
  try {
    await secretService.deleteSecretHistory(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, message: "Removed." });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /secrets/peek/:token - public, safe, never burns the secret
export const peekSecret = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as { token: string };
    const result = await secretService.peekSecret(token);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /secrets/reveal/:token - public (optionally requires sign-in per-secret), counts toward the view limit
export const revealSecret = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as { token: string };
    const { passphrase } = req.body || {};
    const viewerUserId = getOptionalUserId(req);
    const result = await secretService.revealSecret(token, passphrase, viewerUserId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /secrets/burn/:token - public, lets the recipient destroy it themselves
export const burnSecret = async (req: Request, res: Response) => {
  try {
    const { token } = req.params as { token: string };
    await secretService.burnSecret(token);
    return res.status(200).json({ success: true, message: "Secret deleted." });
  } catch (error) {
    return handleError(res, error);
  }
};
