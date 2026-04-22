/**
 * Placement fallback: static 15-question bank exported as the UI source of
 * truth when the AI-driven adaptive path isn't wired. Re-exports from the
 * fixtures module so there is a single source and callers that want "just
 * the static test" have a focused import.
 */

import {
  PLACEMENT_QUESTIONS,
  PLACEMENT_RESULT_SEED,
} from "./fixtures";
import type { CEFRLevel, PlacementQuestion, PlacementResult } from "./types";

export const PLACEMENT_BANK: PlacementQuestion[] = PLACEMENT_QUESTIONS;
export const SEEDED_RESULT: PlacementResult = PLACEMENT_RESULT_SEED;

/**
 * Maps a raw score to a CEFR band using fixed thresholds over 15 items.
 * Kept simple and pure — easy to swap for something smarter later.
 */
export function scoreToLevel(correct: number, total: number): CEFRLevel {
  const pct = total === 0 ? 0 : correct / total;
  if (pct >= 0.93) return "C2";
  if (pct >= 0.85) return "C1";
  if (pct >= 0.73) return "B2";
  if (pct >= 0.6) return "B1+";
  if (pct >= 0.45) return "B1";
  if (pct >= 0.28) return "A2";
  return "A1";
}

/**
 * Converts the scored band into a small natural-language summary.
 */
export function buildResultSummary(level: CEFRLevel): string {
  switch (level) {
    case "A1":
      return "Базовые конструкции в процессе. Начнём с основ и быстро наберём уверенность.";
    case "A2":
      return "Неплохая база. Фокус — Past Simple, артикли, повседневная лексика.";
    case "B1":
      return "Крепкий intermediate. Проседают времена Perfect и сложные коллокации.";
    case "B1+":
      return "Почти B2. Уверенно держишь основные времена, точим нюансы и false friends.";
    case "B2":
      return "Уверенный Upper-Intermediate. Работаем над регистром, идиомами и письменным стилем.";
    case "C1":
      return "Продвинутый уровень. Фокус — тонкие стилистические различия и native-like collocations.";
    case "C2":
      return "Практически носитель. Оттачиваем редкие структуры и профессиональную лексику.";
  }
}

/**
 * Calculates a rough confidence value based on how many items the learner
 * answered and how close the score is to a band threshold.
 */
export function computeConfidence(correct: number, total: number): number {
  if (total === 0) return 0;
  const pct = correct / total;
  // Confidence peaks when answers cluster cleanly and total is full.
  const sampleFactor = Math.min(1, total / 15);
  const decisiveness = 1 - Math.abs(pct - Math.round(pct * 4) / 4) * 2;
  return Math.max(0.4, Math.min(0.98, sampleFactor * (0.6 + 0.4 * decisiveness)));
}

export type { PlacementQuestion, PlacementResult, CEFRLevel };
