import crypto from "crypto";
import bcrypt from "bcrypt";

const CODE_LENGTH = 16;
const SALT_ROUNDS = 12;

export const createRecoveryCode = async () => {
  const code = crypto.randomBytes(CODE_LENGTH).toString("hex");

  return {
    code: code as string,
    hash: (await bcrypt.hash(code, SALT_ROUNDS)) as string,
  };
};

export const verifyRecoveryCode = async (code: string, hash: string) => {
  return bcrypt.compare(code, hash) as Promise<boolean>;
};