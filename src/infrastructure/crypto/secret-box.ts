import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { env } from "@/shared/env";

const ALGO = "aes-256-gcm";

const keyFromSecret = (): Buffer => {
  return scryptSync(env.clientDbSecretKey, "ia-ecommerce-v3-salt", 32);
}

/** Encrypt client DB password before storing in product DB. */
export const encryptSecret = (plain: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, keyFromSecret(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

/** Decrypt client DB password from product DB (Infrastructure only). */
export const decryptSecret = (payload: string): string => {
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted secret format");
  }
  const decipher = createDecipheriv(ALGO, keyFromSecret(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
