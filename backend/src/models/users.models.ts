// models/User.ts

import mongoose from "mongoose";
import { boolean, string } from "zod";

const userSchema = new mongoose.Schema({
  fullname: String,

  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  email: String,

  passwordHash: String,

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

 verificationToken: {
  type: String,
},

verificationTokenExpiresAt: {
  type: Date,
},

resetPasswordOtp: {
  type: String,
},

resetPasswordOtpExpiresAt: {
  type: Date,
},

resetPasswordOtpUsed: {
  type: Boolean,
  default: false,
},
  lastLoginAt: Date,

  refreshToken: {
    type: String,
    select: false,
  },

  phoneNumber: String,

  recoveryCode: {
    code: String,
    used: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
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
  },
);

export default mongoose.model("User", userSchema);
