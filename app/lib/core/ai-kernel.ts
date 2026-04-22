import { streamText, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { Domain, ModelId, UserId } from "./types";
import { costFor } from "./pricing";
import { budgetStatus, getBudget } from "./budget-guard";
import { insertUsageRow } from "./usage-repo";
import { env } from "@/lib/env";

export interface UIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OnFinishCtx {
  text: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

export interface StreamParams {
  userId: UserId;
  domain: Domain;
  model: ModelId;
  system: string;
  messages: UIMessage[];
  maxOutputTokensOverride?: number;
  onFinish?: (ctx: OnFinishCtx) => Promise<void>;
}

export interface StreamResult {
  stream: ReadableStream<string>;
  softWarning: string | null;
}

export interface AiKernel {
  stream(p: StreamParams): Promise<StreamResult>;
}

// ---------- OpenAI implementation ----------

class OpenAIKernel implements AiKernel {
  private openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

  async stream(p: StreamParams): Promise<StreamResult> {
    const status = await budgetStatus(p.userId);
    const budget = await getBudget(p.userId);
    const maxTokens = Math.min(
      p.maxOutputTokensOverride ?? budget.perCallMaxTokensOut,
      budget.perCallMaxTokensOut
    );

    if (status.blocked) {
      const blocked = new ReadableStream<string>({
        start(c) {
          c.enqueue(
            "⚠️  Budget cap reached. Open /settings/usage to adjust or wait for window reset."
          );
          c.close();
        },
      });
      return { stream: blocked, softWarning: status.softWarning };
    }

    // Map our Domain to OpenAI model: non-OpenAI model ids fall back to default.
    const modelId = p.model.startsWith("anthropic/") ? env.OPENAI_MODEL_DEFAULT : p.model;
    const openaiModel = this.openai(modelId);

    const modelMessages: ModelMessage[] = p.messages.map(
      (m) => ({ role: m.role, content: m.content }) as ModelMessage
    );

    const started = Date.now();

    const result = streamText({
      model: openaiModel,
      system: p.system,
      messages: modelMessages,
      maxOutputTokens: maxTokens,
      abortSignal: AbortSignal.timeout(90_000),
      onFinish: async ({ text, usage, finishReason }) => {
        const tokensIn = usage.inputTokens ?? 0;
        const tokensOut = usage.outputTokens ?? 0;
        const cost = costFor(p.model, tokensIn, tokensOut);
        try {
          await insertUsageRow({
            userId: p.userId,
            domain: p.domain,
            model: p.model,
            tokensIn,
            tokensOut,
            costUsd: cost,
            latencyMs: Date.now() - started,
            status: finishReason === "stop" ? "ok" : "aborted",
            finishReason: finishReason ?? "unknown",
          });
        } catch (err) {
          // Don't break the stream if usage logging fails — just log.
          console.error("usage log insert failed:", err);
        }
        await p.onFinish?.({ text, tokensIn, tokensOut, cost });
      },
    });

    // Adapt the SDK's textStream (AsyncIterable<string>) to ReadableStream<string>.
    const stream = new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return { stream, softWarning: status.softWarning };
  }
}

// ---------- Mock implementation (fallback when no key) ----------

const CANNED: Record<string, string> = {
  "english.lesson":
    "Nice to see you back. Today we'll work on **Past Perfect**. I'll start with a short example, then you try a rewrite. Ready?",
  "english.native":
    "Let's just chat — tell me what you did this morning in English. I'll gently correct anything that sounds off, without breaking the flow.",
  "english.translate":
    "Here's a natural translation and why I chose it:\n\n> По утрам я завариваю кофе и читаю rss\n\n**Every morning I brew a coffee and read my rss feed.**",
  "english.flashcards":
    "Here are 8 flashcards, targeted at B1→B2:\n\n1. **resilient** — способный восстанавливаться\n2. **nuance** — оттенок смысла\n3. **leverage** — использовать с выгодой",
  "english.grammar":
    "**Present Perfect vs Past Simple** — test: can you add 'yesterday' or 'in 2019'? → Past Simple.",
  "english.quiz":
    "**Quick quiz:**\n\n1. She ___ here since 2020.\n   (a) lives   (b) has lived",
  "skills.generate-lesson":
    "# Mock lesson\n\nЭто mock-ответ, потому что OPENAI_API_KEY не задан. Проверь `.env.local`.",
};

class MockKernel implements AiKernel {
  async stream(p: StreamParams): Promise<StreamResult> {
    const status = await budgetStatus(p.userId);
    const canned = CANNED[p.domain] ?? `Mock answer for ${p.domain}.`;
    const text = `[MOCK — OpenAI key not set]\n\n${canned}`;
    const stream = new ReadableStream<string>({
      async start(c) {
        for (const ch of text) {
          c.enqueue(ch);
          await new Promise((r) => setTimeout(r, 14));
        }
        c.close();
      },
    });
    return { stream, softWarning: status.softWarning };
  }
}

// ---------- Dispatcher ----------

let kernel: AiKernel | null = null;
export function getKernel(): AiKernel {
  if (kernel) return kernel;
  kernel = env.OPENAI_API_KEY ? new OpenAIKernel() : new MockKernel();
  return kernel;
}
