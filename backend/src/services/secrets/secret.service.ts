import crypto from "crypto";
import Secret, { MAX_PASSPHRASE_ATTEMPTS, MAX_VIEW_LOG_ENTRIES } from "../../models/secret.model.js";
import { AppError } from "../../utils/AppError.js";
import { encrypt, decrypt } from "../../utils/encryption.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { notify } from "../notifications/notification.service.js";

const generateToken = () => crypto.randomBytes(24).toString("hex");

const isExhausted = (secret: any) =>
  secret.maxViews !== null && secret.maxViews !== undefined && secret.viewCount >= secret.maxViews;

const isLive = (secret: any) =>
  !secret.isRevoked && secret.expiresAt.getTime() > Date.now() && !isExhausted(secret);

export const secretService = {
  async createSecret(
    userId: string,
    content: string,
    expiresInMinutes: number,
    maxViews: number | null,
    label?: string,
    passphrase?: string,
    requireAuth?: boolean
  ) {
    const passphraseHash = passphrase ? await hashPassword(passphrase) : null;

    const secret = await Secret.create({
      token: generateToken(),
      content: encrypt(content),
      label: label || "",
      createdBy: userId,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      maxViews: maxViews ?? null,
      requireAuth: !!requireAuth,
      hasPassphrase: !!passphraseHash,
      passphraseHash,
    });

    return { token: secret.token, expiresAt: secret.expiresAt, maxViews: secret.maxViews };
  },

  // Owner reuses an already-exhausted/expired/revoked secret's content under a
  // fresh token + expiry, without needing to re-paste it. Label, passphrase, and
  // the require-sign-in setting carry over unchanged.
  async recreateSecret(id: string, userId: string, expiresInMinutes: number, maxViews: number | null) {
    const original = await Secret.findOne({ _id: id, createdBy: userId }).select("+passphraseHash");
    if (!original) throw new AppError("Secret not found", 404);

    const secret = await Secret.create({
      token: generateToken(),
      content: original.content,
      label: original.label,
      createdBy: userId,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      maxViews: maxViews ?? null,
      requireAuth: original.requireAuth,
      hasPassphrase: original.hasPassphrase,
      passphraseHash: original.passphraseHash,
    });

    return { token: secret.token, expiresAt: secret.expiresAt, maxViews: secret.maxViews };
  },

  // Owner extends an ACTIVE secret's expiry without changing its link/token.
  async extendExpiry(id: string, userId: string, addMinutes: number) {
    const secret = await Secret.findOne({ _id: id, createdBy: userId });
    if (!secret) throw new AppError("Secret not found", 404);
    if (!isLive(secret)) throw new AppError("Only an active link can be extended.", 400);

    secret.expiresAt = new Date(secret.expiresAt.getTime() + addMinutes * 60 * 1000);
    await secret.save();
    return secret;
  },

  // Safe to call repeatedly (e.g. on page load) - never burns the secret, never
  // returns content. Just tells the viewer whether there's something to reveal.
  async peekSecret(token: string) {
    const secret = await Secret.findOne({ token });
    if (!secret || secret.isRevoked || secret.expiresAt.getTime() < Date.now()) {
      throw new AppError("This link is invalid or has expired.", 404);
    }
    if (isExhausted(secret)) {
      throw new AppError("This secret has reached its view limit and is no longer available.", 410);
    }
    return {
      maxViews: secret.maxViews,
      viewCount: secret.viewCount,
      expiresAt: secret.expiresAt,
      hasPassphrase: secret.hasPassphrase,
      requireAuth: secret.requireAuth,
    };
  },

  // Side-effecting - counts toward the view limit immediately, so this must only
  // be called from an explicit user action (a button click), never an automatic
  // page-load fetch or a link-preview crawler, or the real recipient could find
  // it already consumed.
  async revealSecret(token: string, passphrase?: string, viewerUserId?: string) {
    const secret = await Secret.findOne({ token }).select("+passphraseHash");
    if (!secret || secret.isRevoked || secret.expiresAt.getTime() < Date.now()) {
      throw new AppError("This link is invalid or has expired.", 404);
    }
    if (isExhausted(secret)) {
      throw new AppError("This secret has reached its view limit and is no longer available.", 410);
    }

    if (secret.requireAuth && !viewerUserId) {
      throw new AppError("Sign in to your Konvoy account to view this secret.", 401);
    }

    if (secret.hasPassphrase) {
      const ok = passphrase && (await comparePassword(passphrase, secret.passphraseHash as string));
      if (!ok) {
        secret.failedAttempts += 1;
        if (secret.failedAttempts >= MAX_PASSPHRASE_ATTEMPTS) {
          secret.isRevoked = true;
          await secret.save();
          throw new AppError("Too many incorrect attempts. This link has been disabled - ask for a new one.", 429);
        }
        await secret.save();
        const remaining = MAX_PASSPHRASE_ATTEMPTS - secret.failedAttempts;
        throw new AppError(`Incorrect passphrase. ${remaining} attempt(s) remaining.`, 401);
      }
    }

    const content = decrypt(secret.content);

    const now = new Date();
    secret.viewCount += 1;
    secret.viewedAt = now;
    secret.viewLog = [now, ...(secret.viewLog || [])].slice(0, MAX_VIEW_LOG_ENTRIES);
    await secret.save();

    if (secret.viewCount === 1) {
      await notify(
        secret.createdBy.toString(),
        "secret_viewed",
        `Your shared secret${secret.label ? ` "${secret.label}"` : ""} was just viewed.`
      );
    }

    return { content, viewCount: secret.viewCount, maxViews: secret.maxViews };
  },

  // Lets the RECIPIENT proactively destroy a secret right after reading it,
  // instead of waiting for the owner to notice and revoke it.
  async burnSecret(token: string) {
    const secret = await Secret.findOne({ token });
    if (!secret) throw new AppError("This link is invalid or has expired.", 404);
    secret.isRevoked = true;
    await secret.save();
  },

  async listMySecrets(userId: string) {
    return Secret.find({ createdBy: userId }).select("-content -passphraseHash").sort({ createdAt: -1 });
  },

  async revokeSecret(id: string, userId: string) {
    const secret = await Secret.findOneAndUpdate({ _id: id, createdBy: userId }, { isRevoked: true }, { new: true }).select(
      "-content -passphraseHash"
    );
    if (!secret) throw new AppError("Secret not found", 404);
    return secret;
  },

  // Permanently removes the row from the owner's history. Only allowed once the
  // link is no longer live, so this can never be used to silently kill an
  // active link without the "Revoked" trail a Revoke leaves behind.
  async deleteSecretHistory(id: string, userId: string) {
    const secret = await Secret.findOne({ _id: id, createdBy: userId });
    if (!secret) throw new AppError("Secret not found", 404);
    if (isLive(secret)) {
      throw new AppError("Revoke this link before deleting it from your history.", 400);
    }
    await secret.deleteOne();
  },

  async exportMySecretsCsv(userId: string) {
    const secrets = await Secret.find({ createdBy: userId }).select("-content -passphraseHash").sort({ createdAt: -1 });

    const csvCell = (value: any) => {
      const s = value === null || value === undefined ? "" : String(value);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Label", "Status", "Max Views", "View Count", "Passphrase", "Requires Sign-in", "Created", "Expires"];
    const rows = secrets.map((s) => {
      const status = s.isRevoked ? "Revoked" : s.expiresAt.getTime() < Date.now() ? "Expired" : isExhausted(s) ? "Viewed" : "Active";
      return [
        s.label,
        status,
        s.maxViews ?? "Unlimited",
        s.viewCount,
        s.hasPassphrase ? "Yes" : "No",
        s.requireAuth ? "Yes" : "No",
        s.createdAt,
        s.expiresAt,
      ]
        .map(csvCell)
        .join(",");
    });
    return [header.join(","), ...rows].join("\n");
  },
};
