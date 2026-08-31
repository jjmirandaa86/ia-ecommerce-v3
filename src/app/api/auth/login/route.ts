import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/infrastructure/db/prisma";
import { cookieMaxAgeSeconds, issueToken } from "@/infrastructure/auth/jwt";
import { env } from "@/shared/env";

const bodySchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
  rememberMe: z.boolean().optional().default(false),
});

const requestHost = (req: NextRequest): string => {
  const host = req.headers.get("host") ?? "localhost:3000";
  return host.toLowerCase();
}

export const POST = async (req: NextRequest) => {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION", message: "Invalid login payload." },
        },
        { status: 400 },
      );
    }

    const host = requestHost(req);
    const company = await prisma.clientCompany.findUnique({
      where: { hostKey: host },
      include: { systemType: true },
    });

    if (!company || !company.isActive) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "This host is not registered.",
          },
        },
        { status: 404 },
      );
    }

    const user = await prisma.appUser.findUnique({
      where: {
        clientCompanyId_username: {
          clientCompanyId: company.id,
          username: parsed.data.username,
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "AUTH_INVALID",
            message: "Invalid username or password.",
          },
        },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "AUTH_INVALID",
            message: "Invalid username or password.",
          },
        },
        { status: 401 },
      );
    }

    await prisma.appUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await issueToken(
      {
        userId: user.id.toString(),
        companyId: company.id.toString(),
        systemType: company.systemType.code,
        host: company.hostKey,
      },
      parsed.data.rememberMe,
    );

    const res = NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id.toString(),
          username: user.username,
          displayName: user.displayName,
        },
        company: {
          id: company.id.toString(),
          name: company.name,
          systemType: company.systemType.code,
        },
      },
    });

    res.cookies.set(env.authCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: cookieMaxAgeSeconds(parsed.data.rememberMe),
    });

    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL", message: "An unexpected error occurred." },
      },
      { status: 500 },
    );
  }
}
