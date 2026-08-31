import type { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/db/prisma";
import { verifyToken, type SessionClaims } from "@/infrastructure/auth/jwt";
import { env } from "@/shared/env";

export type AuthedSession = SessionClaims & {
  username: string;
  displayName: string | null;
  systemTypeId: bigint;
  companyName: string;
};

export const requireSession = async (
  req: NextRequest,
): Promise<AuthedSession | null> => {
  const token = req.cookies.get(env.authCookieName)?.value;
  if (!token) return null;
  try {
    const claims = await verifyToken(token);
    const user = await prisma.appUser.findFirst({
      where: {
        id: BigInt(claims.userId),
        clientCompanyId: BigInt(claims.companyId),
        isActive: true,
      },
      include: {
        company: { include: { systemType: true } },
      },
    });
    if (!user || !user.company.isActive) return null;
    return {
      ...claims,
      username: user.username,
      displayName: user.displayName,
      systemTypeId: user.company.systemTypeId,
      companyName: user.company.name,
    };
  } catch {
    return null;
  }
}
