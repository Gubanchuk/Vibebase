import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { tryAuth } from "@/lib/core/auth";
import { getKernel } from "@/lib/core/ai-kernel";
import { toTextStreamResponse } from "@/lib/core/stream-http";

const BodySchema = z.object({
  nodeId: z.string().min(1),
  nodeTitle: z.string().min(1),
  skillName: z.string().min(1),
});

const SYSTEM = [
  "You are an expert tutor who writes concise, hands-on lesson notes in Russian when the learner's context is Russian, else in English.",
  "Output valid GitHub-flavoured markdown only — no front-matter, no code fences around the whole response.",
  "Prefer H2/H3 headings, tight bullets, one tiny table when useful, and a short self-check at the end.",
  "Aim for ~400 words and keep examples concrete.",
].join("\n");

export async function POST(
  request: NextRequest,
  _ctx: { params: Promise<{ skillId: string }> }
) {
  const auth = await tryAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    const raw = (await request.json()) as unknown;
    parsed = BodySchema.parse(raw);
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const { nodeTitle, skillName } = parsed;
  const kernel = getKernel();

  const { stream, softWarning } = await kernel.stream({
    userId: auth.userId,
    domain: "skills.generate-lesson",
    model: "gpt-5.4",
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Напиши практичный урок про "${nodeTitle}" в навыке "${skillName}". Формат: H2-заголовки, короткие буллеты, один код-блок или таблица если уместно, маленькая самопроверка в конце. Объём ~400 слов. Если тема про английский — оставь примеры на английском, объяснения на русском.`,
      },
    ],
  });

  const headers: Record<string, string> = {};
  if (softWarning) headers["X-Budget-Soft-Warning"] = softWarning;

  return toTextStreamResponse(stream, headers);
}
