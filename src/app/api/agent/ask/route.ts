import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/infrastructure/auth/require-session";
import { askQuestion } from "@/query-agent/application/ask-question.use-case";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const POST = async (req: NextRequest) => {
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

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "VALIDATION", message: "Invalid JSON body." },
      },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "VALIDATION", message: "Invalid message." },
      },
      { status: 400 },
    );
  }

  try {
    const data = await askQuestion(session, parsed.data.message);
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    const isDependency =
      /LLM|unreachable|ECONNREFUSED|Client database|Unsupported client/i.test(
        message,
      );
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: isDependency ? "DEPENDENCY_DOWN" : "INTERNAL",
          message: isDependency
            ? "A required dependency is unavailable."
            : "An unexpected error occurred.",
        },
      },
      { status: isDependency ? 503 : 500 },
    );
  }
}
