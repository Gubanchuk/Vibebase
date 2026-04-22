import { NextResponse } from "next/server";
import { z } from "zod";
import { tryAuth } from "@/lib/core/auth";
import { getKernel, type UIMessage } from "@/lib/core/ai-kernel";
import { toTextStreamResponse } from "@/lib/core/stream-http";
import type { Domain, ModelId } from "@/lib/core/types";
import { buildSystemPrompt } from "@/lib/domains/vibecoding/prompts";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const BodySchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum(["explain", "chat", "review", "recipe", "debrief", "challenge"]),
  messages: z.array(MessageSchema).min(1),
  level: z
    .enum(["newbie", "practitioner", "architect", "maintainer"])
    .optional()
    .default("practitioner"),
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
  // Vibecoding домены мапим в единый core/types Domain пространство через
  // skills.generate-lesson (пока нет нового enum — живём с этим, позже
  // расширим Domain union).
  const domain: Domain = "skills.generate-lesson";

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
