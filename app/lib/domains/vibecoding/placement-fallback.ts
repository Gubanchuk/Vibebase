import { PLACEMENT_BANK } from "./placement-bank";
import type { VibecodingLevel } from "./types";

export { PLACEMENT_BANK };

/**
 * Score → level mapping. Баллов больше — уровень выше.
 * Границы подобраны так, чтобы пройденный ~40% респондент был уверенным
 * Practitioner, а ~80% — Architect. 100% = Maintainer (редкий кейс).
 */
export function scoreToLevel(correct: number, total: number): VibecodingLevel {
  const pct = (correct / total) * 100;
  if (pct >= 87) return "maintainer";
  if (pct >= 67) return "architect";
  if (pct >= 34) return "practitioner";
  return "newbie";
}

export function computeConfidence(correct: number, total: number): number {
  // Чем ближе результат к границе, тем ниже confidence.
  // Простая heuristic: |pct - центр ближайшей зоны| / полушир зоны.
  const pct = (correct / total) * 100;
  const bands: Array<{ center: number; half: number }> = [
    { center: 17, half: 17 },    // newbie: 0-33
    { center: 50, half: 16.5 },  // practitioner: 34-66
    { center: 77, half: 10 },    // architect: 67-86
    { center: 94, half: 7 },     // maintainer: 87-100
  ];
  const matching =
    bands.find(
      (b) => pct >= b.center - b.half - 0.01 && pct <= b.center + b.half + 0.01
    ) ?? bands[0];
  const distance = Math.min(Math.abs(pct - matching.center) / matching.half, 1);
  // Ближе к центру зоны → выше уверенность (минимум 0.5, максимум 0.95).
  return Math.max(0.5, Math.min(0.95, 1 - distance * 0.5));
}

export function buildResultSummary(level: VibecodingLevel): string {
  switch (level) {
    case "newbie":
      return "Базу понимаешь, но до свободного фарма агентов пока далеко. Сосредоточимся на фундаменте: Claude Code CLI, первые скиллы, как ставить задачу модели.";
    case "practitioner":
      return "Уже чувствуешь себя в CLI, знаешь про хуки и скиллы. Следующий шаг — субагенты, tool-use патерны и осознанная работа с AI SDK.";
    case "architect":
      return "Мыслишь системно — проектируешь агент-пайплайны, видишь trade-off'ы MCP vs native tools. Фокус: observability, evals, продакшн-паттерны.";
    case "maintainer":
      return "Держишь в голове всю экосистему и умеешь её объяснять. Движемся к «frontier» — свежие паттерны из radar, eval-engineering, безопасность агентов.";
  }
}
