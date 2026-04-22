import type { ModeMeta, VibecodingMode, VibecodingSession } from "./types";

/**
 * Vibecoding-режимы — метаданные для mode grid.
 * Hero = explain (чаще всего юзеру нужно разжевать концепт).
 */

export const MODES: ModeMeta[] = [
  {
    id: "explain",
    title: "Explain",
    subtitle: "Объясни концепт на пальцах",
    description:
      "Разжёвывает любой термин / фичу / паттерн под твой уровень: идея, механика, gotcha, когда не надо.",
    accent: "coral",
    hero: true,
    Icon: "BookOpen",
  },
  {
    id: "chat",
    title: "Chat",
    subtitle: "Думаю вслух про задачу",
    description:
      "Собеседник, не лектор. Зеркалит, уточняет, критикует конструктивно. Позиция всегда занята.",
    accent: "coral",
    hero: false,
    Icon: "MessagesSquare",
  },
  {
    id: "review",
    title: "Review",
    subtitle: "Ревью кода, скилла, агента",
    description:
      "Severity-ranked ревью: BLOCKER / SMELL / POLISH. Без фейковых комплиментов, конкретные фиксы.",
    accent: "violet",
    hero: false,
    Icon: "ScrollText",
  },
  {
    id: "recipe",
    title: "Recipe",
    subtitle: "Как сделать X за 5 шагов",
    description:
      "Пошаговый рецепт с кодом и gotcha'ми. Один путь, самый короткий. 15-30 минут на повторение.",
    accent: "amber",
    hero: false,
    Icon: "ChefHat",
  },
  {
    id: "debrief",
    title: "Radar-debrief",
    subtitle: "Разбираем item из радара",
    description:
      "Прочитал статью / релиз — тьютор превращает в конкретные действия на неделю под твой уровень.",
    accent: "violet",
    hero: false,
    Icon: "Radar",
  },
  {
    id: "challenge",
    title: "Challenge",
    subtitle: "Мини-квест под уровень",
    description:
      "Задача 15-20 минут с acceptance criteria. Решил — проверяю строго по критериям.",
    accent: "neutral",
    hero: false,
    Icon: "Target",
  },
];

export function getModeMeta(mode: VibecodingMode): ModeMeta {
  const m = MODES.find((x) => x.id === mode);
  if (!m) throw new Error(`Unknown vibecoding mode: ${mode}`);
  return m;
}

// Пустые сессии — живут как носители метаданных. Реальные сообщения будут
// в Supabase, пока — in-memory, сбрасываются на рефреш.
export const SESSIONS: Record<VibecodingMode, VibecodingSession> = {
  explain:   { id: "vc-explain",   mode: "explain",   level: "practitioner", lastActivityAt: null, messages: [] },
  chat:      { id: "vc-chat",      mode: "chat",      level: "practitioner", lastActivityAt: null, messages: [] },
  review:    { id: "vc-review",    mode: "review",    level: "practitioner", lastActivityAt: null, messages: [] },
  recipe:    { id: "vc-recipe",    mode: "recipe",    level: "practitioner", lastActivityAt: null, messages: [] },
  debrief:   { id: "vc-debrief",   mode: "debrief",   level: "practitioner", lastActivityAt: null, messages: [] },
  challenge: { id: "vc-challenge", mode: "challenge", level: "practitioner", lastActivityAt: null, messages: [] },
};

export function getSession(mode: VibecodingMode): VibecodingSession {
  return SESSIONS[mode];
}
