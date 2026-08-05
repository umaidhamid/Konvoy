// models/User.ts

import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
{
  fullname: String,

  email: {
    type: String,
    lowercase: true,
    unique: true,
  },

  passwordHash:{
    type: String,
    select: false,
  },

  profileImage: {
    type: String,
    default: "",
  },

  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user",
  },

  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    default: null,
  },

  // null = plan never expires (e.g. the default/free plan, or a plan assigned
  // with no duration). Past date = expired, resolvePlanLimitsForUser falls back.
  planExpiresAt: {
    type: Date,
    default: null,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  // Email verification
  verificationToken: String,
  verificationTokenExpiresAt: Date,

  // Forgot password
  resetPasswordToken: String,
  resetPasswordTokenExpiresAt: Date,

  // Email change - new address is only applied once its confirmation link is clicked
  pendingEmail: String,
  pendingEmailToken: String,
  pendingEmailTokenExpiresAt: Date,

  lastLoginAt: Date,

  refreshToken: {
    type: String,
    select: false,
  },

  phoneNumber: String,

  // Emergency account recovery
  recoveryCode: {
    code: {
      type: String,
      select: false,
    },

    used: {
      type: Boolean,
      default: false,
    },
  },

  isDeactivated: {
    type: Boolean,
    default: false,
  },

  deactivationNote: String,

  notifications: {
    type: Boolean,
    default: true,
  },

  // Referral program
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },

  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // Rewarded once, when the referred user verifies their email - stacks on
  // top of maxStorageBytes from resolvePlanLimitsForUser, on both sides of a referral.
  bonusStorageBytes: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true,
}
);

export default mongoose.model("User", userSchema);
