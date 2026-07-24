import * as crypto from "crypto";
import { config } from "../config";

const algorithm = "aes-256-gcm";

const key = Buffer.from(config.fileEncryptionKey, "hex");

if (key.length !== 32) {
  throw new Error("FILE_ENCRYPTION_KEY must be 32 bytes.");
}

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

export const decrypt = (encryptedText: string): string => {
  const [ivHex, tagHex, encryptedHex] = encryptedText.split(":");

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};