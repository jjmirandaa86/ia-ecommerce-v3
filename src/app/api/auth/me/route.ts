import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/prisma";
import { verifyToken } from "@/infrastructure/auth/jwt";
import { env } from "@/shared/env";

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get(env.authCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Not signed in." },
      },
      { status: 401 },
    );
  }

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
        userRoles: { include: { role: true } },
      },
    });

    if (!user || !user.company.isActive) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Session invalid." },
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id.toString(),
          username: user.username,
          displayName: user.displayName,
          department: user.department,
          roles: user.userRoles.map((ur) => ({
            code: ur.role.code,
            name: ur.role.name,
          })),
        },
        company: {
          id: user.company.id.toString(),
          name: user.company.name,
          systemType: user.company.systemType.code,
          hostKey: user.company.hostKey,
        },
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Session invalid." },
      },
      { status: 401 },
    );
  }
}
