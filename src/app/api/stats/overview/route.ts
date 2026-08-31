import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/infrastructure/auth/require-session";
import { getDashboardStats } from "@/query-agent/application/get-dashboard-stats.use-case";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const GET = async (req: NextRequest) => {
  const session = await requireSession(req);
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Not signed in." },
      },
      { status: 401 },
    );
  }

  const parsed = querySchema.safeParse({
    days: req.nextUrl.searchParams.get("days") ?? 7,
  });
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "VALIDATION", message: "Invalid days query." },
      },
      { status: 400 },
    );
  }

  try {
    const data = await getDashboardStats(session, parsed.data.days);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}
