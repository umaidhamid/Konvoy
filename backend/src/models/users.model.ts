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
},
{
  timestamps: true,
}
);

export default mongoose.model("User", userSchema);
