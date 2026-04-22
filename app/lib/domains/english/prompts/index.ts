import type { CEFRLevel, EnglishMode } from "../types";
import { buildSystemPrompt as nativePrompt } from "./native";
import { buildSystemPrompt as lessonPrompt } from "./lesson";
import { buildSystemPrompt as translatePrompt } from "./translate";
import { buildSystemPrompt as flashcardsPrompt } from "./flashcards";
import { buildSystemPrompt as grammarPrompt } from "./grammar";
import { buildSystemPrompt as quizPrompt } from "./quiz";

/**
 * Dispatches to the correct per-mode system prompt. Keep modes explicit —
 * no dynamic import / object lookup — so bundlers can tree-shake and so
 * TypeScript exhaustiveness-checks new mode additions.
 */
export function buildSystemPrompt(mode: EnglishMode, level: CEFRLevel): string {
  switch (mode) {
    case "native":
      return nativePrompt(level);
    case "lesson":
      return lessonPrompt(level);
    case "translate":
      return translatePrompt(level);
    case "flashcards":
      return flashcardsPrompt(level);
    case "grammar":
      return grammarPrompt(level);
    case "quiz":
      return quizPrompt(level);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown English mode: ${String(_exhaustive)}`);
    }
  }
}

export { buildSystemPrompt as buildPlacementPrompt } from "./placement";
