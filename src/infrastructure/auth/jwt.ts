import { SignJWT, jwtVerify } from "jose";
import { env } from "@/shared/env";

export type SessionClaims = {
  userId: string;
  companyId: string;
  systemType: string;
  host: string;
};

const secretKey = () => {
  return new TextEncoder().encode(env.jwtSecret);
}

export const issueToken = async (
  claims: SessionClaims,
  rememberMe: boolean,
): Promise<string> => {
  const expiresIn = rememberMe ? env.jwtExpiresInRemember : env.jwtExpiresIn;
  return new SignJWT({
    companyId: claims.companyId,
    systemType: claims.systemType,
    host: claims.host,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export const verifyToken = async (token: string): Promise<SessionClaims> => {
  const { payload } = await jwtVerify(token, secretKey());
  const userId = payload.sub;
  const companyId = payload.companyId;
  const systemType = payload.systemType;
  const host = payload.host;
  if (
    typeof userId !== "string" ||
    typeof companyId !== "string" ||
    typeof systemType !== "string" ||
    typeof host !== "string"
  ) {
    throw new Error("Invalid token claims");
  }
  return { userId, companyId, systemType, host };
}

export const cookieMaxAgeSeconds = (rememberMe: boolean): number => {
  return rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
}
