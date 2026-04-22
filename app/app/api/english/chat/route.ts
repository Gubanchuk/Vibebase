import { NextResponse } from "next/server";
import { z } from "zod";
import { tryAuth } from "@/lib/core/auth";
import { getKernel, type UIMessage } from "@/lib/core/ai-kernel";
import { toTextStreamResponse } from "@/lib/core/stream-http";
import type { Domain, ModelId } from "@/lib/core/types";
import { buildSystemPrompt } from "@/lib/domains/english/prompts";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const BodySchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum([
    "native",
    "lesson",
    "translate",
    "flashcards",
    "grammar",
    "quiz",
  ]),
  messages: z.array(MessageSchema).min(1),
  level: z
    .enum(["A1", "A2", "B1", "B1+", "B2", "C1", "C2"])
    .optional()
    .default("B1+"),
});

const MODEL: ModelId = "gpt-5.4";

export async function POST(req: Request) {
  const auth = await tryAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { mode, messages, level } = parsed.data;

  const system = buildSystemPrompt(mode, level);
  const domain = `english.${mode}` as Domain;
  const uiMessages: UIMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const { stream, softWarning } = await getKernel().stream({
    userId: auth.userId,
    domain,
    model: MODEL,
    system,
    messages: uiMessages,
  });

  const extraHeaders = softWarning ? { "X-Budget-Warning": softWarning } : undefined;
  return toTextStreamResponse(stream, extraHeaders);
}
