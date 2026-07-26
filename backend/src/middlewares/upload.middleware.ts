import multer from "multer";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

// Memory storage - the file buffer is streamed straight to Cloudinary,
// nothing is written to local disk.
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new AppError("Avatar must be a JPEG, PNG, WEBP, or GIF image.", 400));
    }
    cb(null, true);
  },
});
