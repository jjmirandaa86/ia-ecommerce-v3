import { NextResponse } from "next/server";
import { env } from "@/shared/env";

export const POST = async () => {
  const res = NextResponse.json({
    ok: true,
    data: { loggedOut: true },
  });
  res.cookies.set(env.authCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
