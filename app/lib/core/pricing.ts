import type { ModelId } from "./types";

/**
 * Per-million-token pricing (USD). Pinned values — update intentionally
 * when provider pricing shifts. Source: https://platform.openai.com/pricing
 */
const TABLE: Record<ModelId, { in: number; out: number }> = {
  // OpenAI — GPT-5.4 family (April 2026 prices)
  "gpt-5.4":       { in: 1.25, out: 10.00 },
  "gpt-5.4-mini":  { in: 0.25, out:  2.00 },
  "gpt-5.4-nano":  { in: 0.05, out:  0.40 },

  // Kept for optional Anthropic routing via Gateway later
  "anthropic/claude-opus-4-7":   { in: 15,   out: 75   },
  "anthropic/claude-sonnet-4-6": { in:  3,   out: 15   },
  "anthropic/claude-haiku-4-5":  { in:  0.80, out: 4  },
};

export function costFor(model: ModelId, tokensIn: number, tokensOut: number): number {
  const rate = TABLE[model] ?? TABLE["gpt-5.4"];
  const cost = (tokensIn * rate.in + tokensOut * rate.out) / 1_000_000;
  return Number(cost.toFixed(6));
}

export function listPricing() {
  return TABLE;
}
