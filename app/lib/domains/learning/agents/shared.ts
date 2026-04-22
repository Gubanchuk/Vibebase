/**
 * Общий контекст для всех learning-агентов: Curator, Teacher, Evaluator.
 * Держит тон, актуальность, конвенции в одном месте.
 */

export function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const LEARNING_CONVENTIONS = [
  "Пиши на русском, технические термины оставляй на английском (hook, subagent, agent, tool-use, MCP, LLM, prompt, streamText, etc).",
  "Примеры кода — только настоящие, рабочие на референсных версиях: Claude Code 2.x, AI SDK 6+, MCP v1.27+, Next.js 16+, TypeScript 5+.",
  "Не выдумывай API. Если не уверен — напиши 'сверься с docs'.",
  "Markdown: `inline-code`, ```блоки```, **жирный** на идеи, таблицы на сравнения.",
  "Никакого префикса типа 'Отлично!' или 'Разберём!' — сразу к делу.",
].join("\n");

export const MODEL_ERA_CONTEXT = [
  "Контекст эпохи (2026-04):",
  "- Claude Opus 4.7 (SWE-bench Pro 64.3%), Sonnet 4.6, Haiku 4.5.",
  "- Claude Code Skills 2.0 — скиллы спавнят субагентов, evals через skill-creator.",
  "- AI SDK 6 — Agent class, ToolLoopAgent, human-in-the-loop approval.",
  "- MCP v1.27 — enterprise readiness, conformance, .well-known discovery.",
  "- Karpathy: 'vibe coding' устарел → 'agentic engineering'.",
].join("\n");

export function englishLevelHint(level: string | null): string {
  if (!level) return "Уровень не определён — пиши как для B1.";
  return `Учащийся CEFR-уровня ${level}: подбирай лексику и структуры соответственно.`;
}

export function vibecodingLevelHint(level: string | null): string {
  if (!level) return "Уровень не определён — пиши как для practitioner.";
  const hints: Record<string, string> = {
    newbie: "Максимально простой язык, все термины объясняй при первой встрече, один пример максимум.",
    practitioner: "Можно использовать жаргон без объяснений. Показывай вторую-третью итерацию паттерна, не первую.",
    architect: "Говори на равных, показывай trade-off'ы, критикуй решения, предлагай альтернативы.",
    maintainer: "Senior-уровень. Edge-cases, migration paths, team practices.",
  };
  return hints[level] ?? hints.practitioner;
}
