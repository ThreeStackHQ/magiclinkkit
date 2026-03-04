import { randomBytes, randomInt } from "crypto";
import bcryptjs from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateOtp(): string {
  const num = randomInt(100000, 1000000);
  return num.toString();
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}
