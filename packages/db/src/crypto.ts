import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

interface EncryptedData {
  iv: string;
  tag: string;
  encrypted: string;
}

export function encrypt(text: string, key: string): EncryptedData {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuffer, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    encrypted,
  };
}

export function decrypt(
  encrypted: string,
  iv: string,
  tag: string,
  key: string
): string {
  const keyBuffer = Buffer.from(key, "hex");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyBuffer,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
