import crypto from "crypto";
import User from "../../models/users.model.js";
import { notify } from "../notifications/notification.service.js";
import { appSettingsService } from "../settings/appSettings.service.js";

const generateReferralCode = () => crypto.randomBytes(4).toString("hex");

export const referralService = {
  // Idempotent - a user's code is created lazily on first request rather than
  // at signup, so existing accounts from before this feature get one too.
  async getOrCreateReferralCode(userId: string) {
    const user = await User.findById(userId);
    if (!user) return null;
    if (user.referralCode) return user.referralCode;

    // Collisions are astronomically unlikely at 4 random bytes, but guard anyway.
    let code = generateReferralCode();
    while (await User.exists({ referralCode: code })) {
      code = generateReferralCode();
    }
    user.referralCode = code;
    await user.save();
    return code;
  },

  async getMyReferralInfo(userId: string) {
    const code = await this.getOrCreateReferralCode(userId);
    const user = await User.findById(userId).select("bonusStorageBytes");
    const settings = await appSettingsService.getSettings();
    const referredUsers = await User.find({ referredBy: userId })
      .select("fullname email isVerified createdAt")
      .sort({ createdAt: -1 });

    return {
      referralCode: code,
      bonusStorageBytes: user?.bonusStorageBytes || 0,
      rewardBytesPerReferral: settings.referralRewardBytes,
      referredUsers: referredUsers.map((u) => ({
        fullname: u.fullname,
        email: u.email,
        verified: u.isVerified,
        joinedAt: u.createdAt,
        rewardEarned: u.isVerified,
      })),
      totalReferred: referredUsers.length,
      totalVerifiedReferrals: referredUsers.filter((u) => u.isVerified).length,
    };
  },

  // Called at signup - resolves a code to the referring user, doesn't grant any
  // reward yet (that happens on email verification, see grantReferralReward).
  async resolveReferrer(referralCode?: string) {
    if (!referralCode) return null;
    const referrer = await User.findOne({ referralCode: referralCode.trim() }).select("_id");
    return referrer?._id || null;
  },

  // Called once, from verifyAccount - grants storage to both sides. Safe to
  // call even if the user has no referredBy (no-op).
  async grantReferralReward(userId: string) {
    const user = await User.findById(userId).select("referredBy fullname");
    if (!user?.referredBy) return;

    const settings = await appSettingsService.getSettings();
    const rewardBytes = settings.referralRewardBytes;

    const referrer = await User.findByIdAndUpdate(
      user.referredBy,
      { $inc: { bonusStorageBytes: rewardBytes } },
      { new: true }
    );
    await User.findByIdAndUpdate(userId, { $inc: { bonusStorageBytes: rewardBytes } });

    if (referrer) {
      const mb = rewardBytes / (1024 * 1024);
      await notify(
        String(referrer._id),
        "referral_reward",
        `${user.fullname || "Someone you referred"} verified their account - you both earned ${mb}MB of bonus storage.`
      );
    }
  },
};
