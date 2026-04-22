import type {
  EnglishMode,
  EnglishSession,
  Message,
  Mistake,
  ModeMeta,
  PlacementQuestion,
  PlacementResult,
} from "./types";

/**
 * Deterministic seed data used by server components and placement fallback.
 * Times are ISO strings with explicit offsets so Next SSR doesn't complain
 * about hydration mismatches. The values here are pinned relative to the
 * "current" session so "5 min ago" reads correctly in the UI.
 *
 * When Phase 1 lands with Supabase, these will be superseded by real rows,
 * but we keep the shape identical so the swap is mechanical.
 */

const now = () => new Date().toISOString();

/** Returns an ISO date N minutes in the past. */
function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────
// Modes metadata
// ─────────────────────────────────────────────────────────────────────────

export const MODES: ModeMeta[] = [
  {
    id: "native",
    title: "Native chat",
    subtitle: "Свободный разговор с мягкой правкой",
    description:
      "Живой диалог с носителем, который чинит ошибки на лету и не ломает вайб.",
    accent: "coral",
    hero: false,
    Icon: "MessagesSquare",
  },
  {
    id: "lesson",
    title: "Personal Lesson",
    subtitle: "Персональный микро-урок на 10 минут",
    description:
      "Одна тема, один структурный разбор, живые примеры и проверка себя. Ведущий режим.",
    accent: "coral",
    hero: true,
    Icon: "GraduationCap",
  },
  {
    id: "translate",
    title: "Translate",
    subtitle: "RU ↔ EN с объяснением выбора",
    description:
      "Переводит и рассказывает, *почему* так звучит естественнее.",
    accent: "violet",
    hero: false,
    Icon: "Languages",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    subtitle: "Подборки слов с коллокациями",
    description:
      "Быстрая генерация карточек для SRS по теме или уровню.",
    accent: "amber",
    hero: false,
    Icon: "Layers",
  },
  {
    id: "grammar",
    title: "Grammar",
    subtitle: "Точечные разборы правил",
    description:
      "Чёткое правило, контрастные пары, типичные ошибки русскоговорящих.",
    accent: "neutral",
    hero: false,
    Icon: "BookOpen",
  },
  {
    id: "quiz",
    title: "Quiz",
    subtitle: "Быстрая проверка темы",
    description:
      "Пять multi-choice вопросов, автоматическая проверка и разбор.",
    accent: "neutral",
    hero: false,
    Icon: "ListChecks",
  },
];

export function getModeMeta(mode: EnglishMode): ModeMeta {
  const m = MODES.find((x) => x.id === mode);
  if (!m) throw new Error(`Unknown mode: ${mode}`);
  return m;
}

// ─────────────────────────────────────────────────────────────────────────
// Seeded sessions — one per mode, 2–4 messages each
// ─────────────────────────────────────────────────────────────────────────

// Kept as helper for future seeding; currently unused.
const _mkMsg = (
  id: string,
  role: Message["role"],
  content: string,
  minAgo: number
): Message => ({
  id,
  role,
  content,
  createdAt: minutesAgo(minAgo),
});
void _mkMsg;

// Чистый старт — пустые сессии без сообщений. Каждая реально создаётся
// только при первой отправке юзером; здесь они — носитель метаданных
// (mode, level, id) для страницы чата.
export const SESSIONS: Record<EnglishMode, EnglishSession> = {
  native:     { id: "sess-native",     mode: "native",     level: "B1+", lastActivityAt: null, messages: [] },
  lesson:     { id: "sess-lesson",     mode: "lesson",     level: "B1+", lastActivityAt: null, messages: [] },
  translate:  { id: "sess-translate",  mode: "translate",  level: "B1+", lastActivityAt: null, messages: [] },
  flashcards: { id: "sess-flashcards", mode: "flashcards", level: "B1+", lastActivityAt: null, messages: [] },
  grammar:    { id: "sess-grammar",    mode: "grammar",    level: "B1+", lastActivityAt: null, messages: [] },
  quiz:       { id: "sess-quiz",       mode: "quiz",       level: "B1+", lastActivityAt: null, messages: [] },
};

export function getSession(mode: EnglishMode): EnglishSession {
  return SESSIONS[mode];
}

// ─────────────────────────────────────────────────────────────────────────
// Mistakes bank — mixed categories, 6 total
// ─────────────────────────────────────────────────────────────────────────

// Ошибок пока нет — копятся по мере реальных чатов. Mistake extractor
// будет включён флагом ENABLE_MISTAKE_TRACKING после Gateway-wiring.
export const MISTAKES: Mistake[] = [];

// ─────────────────────────────────────────────────────────────────────────
// Placement — 15 static questions, A1 → C1 ramp
// ─────────────────────────────────────────────────────────────────────────

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "p1",
    level: "A1",
    tag: "to-be",
    prompt: "She ___ a doctor.",
    options: [{ label: "are" }, { label: "is" }, { label: "am" }, { label: "be" }],
    correctIndex: 1,
  },
  {
    id: "p2",
    level: "A1",
    tag: "articles-basic",
    prompt: "I have ___ apple and ___ orange.",
    options: [
      { label: "a / a" },
      { label: "an / an" },
      { label: "an / a" },
      { label: "a / an" },
    ],
    correctIndex: 2,
  },
  {
    id: "p3",
    level: "A2",
    tag: "present-simple",
    prompt: "He ___ coffee every morning.",
    options: [
      { label: "drink" },
      { label: "drinks" },
      { label: "is drinking" },
      { label: "drank" },
    ],
    correctIndex: 1,
  },
  {
    id: "p4",
    level: "A2",
    tag: "past-simple",
    prompt: "Yesterday I ___ a new book.",
    options: [
      { label: "buyed" },
      { label: "bought" },
      { label: "have bought" },
      { label: "was buying" },
    ],
    correctIndex: 1,
  },
  {
    id: "p5",
    level: "A2",
    tag: "prepositions-time",
    prompt: "I was born ___ 1995.",
    options: [{ label: "on" }, { label: "at" }, { label: "in" }, { label: "by" }],
    correctIndex: 2,
  },
  {
    id: "p6",
    level: "B1",
    tag: "present-perfect",
    prompt: "I ___ to Japan three times.",
    options: [
      { label: "went" },
      { label: "have been" },
      { label: "am going" },
      { label: "had been" },
    ],
    correctIndex: 1,
  },
  {
    id: "p7",
    level: "B1",
    tag: "conditionals-0-1",
    prompt: "If it ___ tomorrow, we'll stay home.",
    options: [
      { label: "will rain" },
      { label: "rains" },
      { label: "rained" },
      { label: "is raining" },
    ],
    correctIndex: 1,
  },
  {
    id: "p8",
    level: "B1",
    tag: "word-choice",
    prompt: "She gave me some ___ advice about the job.",
    options: [
      { label: "usefuls" },
      { label: "useful" },
      { label: "usefully" },
      { label: "more useful" },
    ],
    correctIndex: 1,
  },
  {
    id: "p9",
    level: "B1+",
    tag: "past-perfect",
    prompt: "By the time the film started, we ___ our popcorn.",
    options: [
      { label: "already finished" },
      { label: "had already finished" },
      { label: "have already finished" },
      { label: "were already finishing" },
    ],
    correctIndex: 1,
  },
  {
    id: "p10",
    level: "B1+",
    tag: "phrasal-verbs",
    prompt: "Please ___ your shoes before entering.",
    options: [
      { label: "take off" },
      { label: "take out" },
      { label: "take away" },
      { label: "take in" },
    ],
    correctIndex: 0,
  },
  {
    id: "p11",
    level: "B2",
    tag: "false-friend",
    prompt: "This course is ___ for senior engineers.",
    options: [
      { label: "actual" },
      { label: "relevant" },
      { label: "sympathetic" },
      { label: "eventual" },
    ],
    correctIndex: 1,
  },
  {
    id: "p12",
    level: "B2",
    tag: "reported-speech",
    prompt: "She said she ___ the report by Friday.",
    options: [
      { label: "will finish" },
      { label: "would finish" },
      { label: "finishes" },
      { label: "finished" },
    ],
    correctIndex: 1,
  },
  {
    id: "p13",
    level: "B2",
    tag: "collocations",
    prompt: "We need to ___ a decision before Monday.",
    options: [
      { label: "do" },
      { label: "make" },
      { label: "take" },
      { label: "set" },
    ],
    correctIndex: 1,
  },
  {
    id: "p14",
    level: "C1",
    tag: "inversion",
    prompt: "Rarely ___ such a brilliant performance.",
    options: [
      { label: "I have seen" },
      { label: "have I seen" },
      { label: "I saw" },
      { label: "did I see" },
    ],
    correctIndex: 1,
  },
  {
    id: "p15",
    level: "C1",
    tag: "advanced-vocab",
    prompt: "The evidence was ___ to support the conclusion.",
    options: [
      { label: "scarcely" },
      { label: "hardly" },
      { label: "insufficient" },
      { label: "barely" },
    ],
    correctIndex: 2,
  },
];

/**
 * Canonical result for the seeded user. UI mirrors this on first
 * visit; PlacementFlow recalculates when the user completes live.
 */
export const PLACEMENT_RESULT_SEED: PlacementResult = {
  level: "B1+",
  confidence: 0.78,
  summary:
    "Уверенно держишь Present Perfect и Past Simple. Проседает Past Perfect, сложные коллокации и false friends.",
  correct: 11,
  total: 15,
};

// ─────────────────────────────────────────────────────────────────────────
// Small helpers used by server components
// ─────────────────────────────────────────────────────────────────────────

export function modeTitle(mode: EnglishMode): string {
  return getModeMeta(mode).title;
}

export function mistakesBySession(sessionId: string): Mistake[] {
  return MISTAKES.filter((m) => m.sessionId === sessionId);
}

/** Coarse "X min ago" in Russian — used in mode cards. */
export function minutesAgoLabel(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const mins = Math.max(1, Math.round(diffMs / 60_000));
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  return `${days} д назад`;
}

export { now };
