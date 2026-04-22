/**
 * English domain — shared types.
 *
 * These types are used by the English app routes, API handler, fixtures, and
 * prompts. Keep them dependency-free so server and client code can import
 * the same module without bringing in React or Next-specific runtime.
 */

export type EnglishMode =
  | "native"
  | "lesson"
  | "translate"
  | "flashcards"
  | "grammar"
  | "quiz";

export type CEFRLevel = "A1" | "A2" | "B1" | "B1+" | "B2" | "C1" | "C2";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  /** ISO string — keeps the type JSON-serialisable. */
  createdAt: string;
}

export interface EnglishSession {
  id: string;
  mode: EnglishMode;
  level: CEFRLevel;
  messages: Message[];
  /** ISO string — null если сессия ещё ни разу не открывалась. */
  lastActivityAt: string | null;
}

export type MistakeCategory =
  | "article"
  | "tense"
  | "preposition"
  | "word-choice"
  | "false-friend"
  | "collocation";

export interface Mistake {
  id: string;
  category: MistakeCategory;
  /** The raw phrase the learner produced. */
  original: string;
  /** The natural / corrected version. */
  correction: string;
  /** Short, plain-English explanation (may mix Russian when useful). */
  explanation: string;
  sessionId: string;
  /** ISO string. */
  createdAt: string;
}

export type ModeAccent = "coral" | "violet" | "amber" | "neutral";

export interface ModeMeta {
  id: EnglishMode;
  title: string;
  subtitle: string;
  description: string;
  accent: ModeAccent;
  hero: boolean;
  /** lucide-react icon name — resolved in the component layer. */
  Icon: string;
}

export interface PlacementOption {
  label: string;
}

export interface PlacementQuestion {
  id: string;
  /** Tag indicating the difficulty band this item targets. */
  level: CEFRLevel;
  prompt: string;
  options: PlacementOption[];
  /** Index into `options`. */
  correctIndex: number;
  /** What the question is probing (for UI hint / analytics). */
  tag: string;
}

export interface PlacementResult {
  level: CEFRLevel;
  /** 0..1 */
  confidence: number;
  /** Short human explanation of the result. */
  summary: string;
  correct: number;
  total: number;
}
