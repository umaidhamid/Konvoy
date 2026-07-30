import cron from "node-cron";
import User from "../models/users.model.js";

const UNVERIFIED_ACCOUNT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupUnverifiedUsers = async () => {
  const cutoff = new Date(Date.now() - UNVERIFIED_ACCOUNT_MAX_AGE_MS);

  const result = await User.deleteMany({
    isVerified: false,
    createdAt: { $lt: cutoff },
  });

  if (result.deletedCount) {
    console.log(`[cleanup] Removed ${result.deletedCount} unverified account(s) older than 7 days.`);
  }

  return result.deletedCount || 0;
};

// Runs daily at 03:00 server time
export const scheduleUnverifiedUserCleanup = () => {
  cron.schedule("0 3 * * *", () => {
    cleanupUnverifiedUsers().catch((err) => console.error("[cleanup] Failed:", err));
  });
};
