import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const AVATAR_FOLDER = "konvoy/avatars";

export const uploadAvatarBuffer = (
  buffer: Buffer,
  userId: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: AVATAR_FOLDER,
        public_id: `${userId}-${Date.now()}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// Extracts the Cloudinary public_id (including folder) from a secure_url we
// previously stored, so the old avatar can be deleted once a new one is
// uploaded. Returns null for anything that isn't one of our own avatar URLs
// (e.g. no avatar set yet, or an externally-set URL).
export const extractAvatarPublicId = (url: string | undefined | null): string | null => {
  if (!url) return null;
  const match = /\/konvoy\/avatars\/([^/.]+)\.[a-zA-Z0-9]+(?:$|\?)/.exec(url);
  return match ? `${AVATAR_FOLDER}/${match[1]}` : null;
};

export const deleteAvatar = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // Not fatal - the new avatar already uploaded successfully, an orphaned
    // old asset in Cloudinary isn't worth failing the request over.
    console.error("Failed to delete old avatar from Cloudinary:", error);
  }
};
