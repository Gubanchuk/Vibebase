import type { VibecodingLevel, VibecodingMode } from "../types";
import { buildExplainPrompt } from "./explain";
import { buildChatPrompt } from "./chat";
import { buildReviewPrompt } from "./review";
import { buildRecipePrompt } from "./recipe";
import { buildDebriefPrompt } from "./debrief";
import { buildChallengePrompt } from "./challenge";

export { buildExplainPrompt } from "./explain";
export { buildChatPrompt } from "./chat";
export { buildReviewPrompt } from "./review";
export { buildRecipePrompt } from "./recipe";
export { buildDebriefPrompt } from "./debrief";
export { buildChallengePrompt } from "./challenge";
export { buildPlacementPrompt } from "./placement";

export function buildSystemPrompt(
  mode: VibecodingMode,
  level: VibecodingLevel
): string {
  switch (mode) {
    case "explain":
      return buildExplainPrompt(level);
    case "chat":
      return buildChatPrompt(level);
    case "review":
      return buildReviewPrompt(level);
    case "recipe":
      return buildRecipePrompt(level);
    case "debrief":
      return buildDebriefPrompt(level);
    case "challenge":
      return buildChallengePrompt(level);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown vibecoding mode: ${String(_exhaustive)}`);
    }
  }
}
