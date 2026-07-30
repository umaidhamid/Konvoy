// One-time backfill: sizeBytes was added after some files already existed, so
// their stored size defaulted to 0 until next edited. This computes the real
// plaintext byte size for every file that still shows 0 and persists it.
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import ProjectFile from "../models/ProjectFile.model.js";
import { decrypt } from "../utils/encryption.js";

async function run() {
  await connectDB();

  const files = await ProjectFile.find({ sizeBytes: { $in: [0, null] }, isDeleted: false }).select(
    "content sizeBytes"
  );

  let updated = 0;
  let totalBytes = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const plaintext = decrypt(file.content);
      const bytes = Buffer.byteLength(plaintext, "utf8");
      if (bytes !== file.sizeBytes) {
        file.sizeBytes = bytes;
        await file.save();
        updated++;
        totalBytes += bytes;
      }
    } catch (err) {
      failed++;
      console.error(`Failed to backfill file ${file._id}:`, (err as Error).message);
    }
  }

  console.log(`Scanned ${files.length} file(s) with sizeBytes 0.`);
  console.log(`Updated ${updated} file(s), recovered ${totalBytes} byte(s) of accounted storage.`);
  if (failed) console.log(`${failed} file(s) failed to decrypt/backfill - left unchanged.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
