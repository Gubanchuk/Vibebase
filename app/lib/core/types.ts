export type UserId = string & { readonly __brand: "UserId" };

export type ModelId =
  | "gpt-5.4"
  | "gpt-5.4-mini"
  | "gpt-5.4-nano"
  | "anthropic/claude-opus-4-7"
  | "anthropic/claude-sonnet-4-6"
  | "anthropic/claude-haiku-4-5";

export type Domain =
  | "english.lesson"
  | "english.native"
  | "english.translate"
  | "english.flashcards"
  | "english.grammar"
  | "english.quiz"
  | "english.placement"
  | "english.mistakes"
  | "skills.generate-lesson"
  | "radar.sync"
  | "journal.summary";

export interface AuthContext {
  userId: UserId;
  email: string;
  displayName: string;
}

export interface UsageRow {
  id?: string;
  userId: UserId;
  domain: Domain;
  model: ModelId;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  status: "ok" | "aborted" | "error";
  finishReason: string;
  createdAt: string;
}

export interface BudgetConfig {
  userId: UserId;
  dailyCostCapUsd: number;
  monthlyCostCapUsd: number;
  perCallMaxTokensOut: number;
}
