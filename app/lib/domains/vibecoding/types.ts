/**
 * Vibecoding domain — типы и shared константы.
 * Зеркальная архитектура относительно english/types.ts: level вместо CEFR,
 * 6 modes, placement с fallback.
 */

export type VibecodingMode =
  | "explain"      // «объясни X на пальцах»
  | "chat"         // думаю вслух про задачу
  | "review"       // code/skill/agent review
  | "recipe"       // «как сделать Y за N шагов»
  | "debrief"      // разбираем item из радара
  | "challenge";   // мини-квест под уровень

export type VibecodingLevel =
  | "newbie"          // впервые слышит про Claude Code
  | "practitioner"    // юзает CLI, немного скиллов/хуков
  | "architect"       // проектирует агент-пайплайны, знает MCP/SDK
  | "maintainer";     // учит других, держит в голове evolution платформы

export type MessageRole = "user" | "assistant" | "system";

export interface VMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface VibecodingSession {
  id: string;
  mode: VibecodingMode;
  level: VibecodingLevel;
  messages: VMessage[];
  lastActivityAt: string | null;
}

export type ModeAccent = "coral" | "violet" | "amber" | "neutral";

export interface ModeMeta {
  id: VibecodingMode;
  title: string;
  subtitle: string;
  description: string;
  accent: ModeAccent;
  hero: boolean;
  Icon: string;
}

// ─── Placement ────────────────────────────────────────────────────────────

export interface PlacementOption {
  label: string;
}

export interface PlacementQuestion {
  id: string;
  /** Какому уровню скорее принадлежит корректный ответ. */
  level: VibecodingLevel;
  prompt: string;
  options: PlacementOption[];
  /** Index into `options`. */
  correctIndex: number;
  /** Зона знания: claude-code, mcp, ai-sdk, prompting, agents, observability. */
  tag: string;
}

export interface PlacementResult {
  level: VibecodingLevel;
  /** 0..1 */
  confidence: number;
  summary: string;
  correct: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export const LEVEL_ORDER: VibecodingLevel[] = [
  "newbie",
  "practitioner",
  "architect",
  "maintainer",
];

export const LEVEL_LABEL: Record<VibecodingLevel, string> = {
  newbie: "Новичок",
  practitioner: "Практик",
  architect: "Архитектор",
  maintainer: "Maintainer",
};

export const LEVEL_SHORT: Record<VibecodingLevel, string> = {
  newbie: "NB",
  practitioner: "PR",
  architect: "AR",
  maintainer: "MT",
};

export const LEVEL_HINT: Record<VibecodingLevel, string> = {
  newbie: "только начинаю с Claude Code",
  practitioner: "уже юзаю скиллы и хуки",
  architect: "проектирую агент-пайплайны",
  maintainer: "учу других, знаю эволюцию",
};
