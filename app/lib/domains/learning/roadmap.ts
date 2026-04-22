/**
 * Roadmap — чистая логика бакетинга топиков по стейджам, выбора «следующего шага»
 * и фильтрации по уровню пользователя. Без БД, без Supabase — легко покрывается
 * unit-тестами.
 */

import type {
  CurriculumTopic,
  LearningDomain,
  LessonMastery,
  Stage,
  TopicWithUserState,
} from "./types";

// ─── Stage bucketing ───────────────────────────────────────────────────

const FOUNDATION_LEVELS = new Set(["a1", "a2", "newbie", "starter"]);
const ADVANCED_LEVELS = new Set([
  "c1",
  "c2",
  "architect",
  "maintainer",
  "expert",
]);

export function bucketStage(t: CurriculumTopic): Stage {
  if (t.importance <= 2) return "optional";
  const lvl = (t.levelMin ?? "").toLowerCase();
  if (FOUNDATION_LEVELS.has(lvl)) return "foundation";
  if (ADVANCED_LEVELS.has(lvl)) return "advanced";
  if (t.importance === 5 && !lvl) return "foundation";
  return "core";
}

export const STAGE_ORDER: Stage[] = [
  "foundation",
  "core",
  "advanced",
  "optional",
];

export const STAGE_META: Record<
  Stage,
  { label: string; hint: string; accent: "coral" | "amber" | "violet" | "muted" }
> = {
  foundation: {
    label: "Фундамент",
    hint: "База — с этого начинаешь",
    accent: "coral",
  },
  core: {
    label: "Ядро",
    hint: "Основной массив, самое работающее",
    accent: "amber",
  },
  advanced: {
    label: "Продвинутое",
    hint: "Нюансы и expert-level",
    accent: "violet",
  },
  optional: {
    label: "Опционально",
    hint: "Можно пропустить, если время жмёт",
    accent: "muted",
  },
};

// ─── Unlock / prerequisites ────────────────────────────────────────────

/**
 * prerequisites в типе приходят как slugs (это решение мапинга в repo). Чтобы
 * судить «разблокирована ли тема», принимаем mastered-Set slug'ов.
 */
export function isUnlocked(
  t: CurriculumTopic,
  masteredSlugs: ReadonlySet<string>
): boolean {
  if (t.prerequisites.length === 0) return true;
  return t.prerequisites.every((p) => masteredSlugs.has(p));
}

// ─── Next-step picker ──────────────────────────────────────────────────

/**
 * Рейтинг для сортировки кандидатов на «следующий шаг»:
 *   in-progress > new
 *   higher importance
 *   higher popularity
 *   lower sortOrder
 */
function byRank(a: TopicWithUserState, b: TopicWithUserState): number {
  const ap = a.mastery && !a.mastery.masteredAt ? 1 : 0;
  const bp = b.mastery && !b.mastery.masteredAt ? 1 : 0;
  if (ap !== bp) return bp - ap;
  if (a.importance !== b.importance) return b.importance - a.importance;
  if (a.popularity !== b.popularity) return b.popularity - a.popularity;
  return a.sortOrder - b.sortOrder;
}

export function pickNextStep(
  topics: TopicWithUserState[]
): TopicWithUserState | null {
  const notMastered = topics.filter((t) => !t.mastery?.masteredAt);
  if (notMastered.length === 0) return null;

  const candidates = notMastered.filter(
    (t) => t.stage !== "optional" && t.isUnlocked
  );
  const pool = candidates.length > 0 ? candidates : notMastered;
  return [...pool].sort(byRank)[0] ?? null;
}

// ─── Level matching ────────────────────────────────────────────────────

const ENGLISH_ORDINAL: Record<string, number> = {
  a1: 1,
  a2: 2,
  b1: 3,
  "b1+": 3.5,
  b2: 4,
  c1: 5,
  c2: 6,
};

const VIBECODING_ORDINAL: Record<string, number> = {
  newbie: 1,
  starter: 1,
  practitioner: 2,
  architect: 3,
  maintainer: 4,
  expert: 4,
};

function ordinal(level: string | null, domain: LearningDomain): number | null {
  if (!level) return null;
  const k = level.toLowerCase().trim();
  const table = domain === "english" ? ENGLISH_ORDINAL : VIBECODING_ORDINAL;
  return table[k] ?? null;
}

/**
 * Тема считается «подходящей под уровень», если уровень пользователя ∈
 * [levelMin, levelMax ?? levelMin]. Если уровень топика не задан — матчим.
 */
export function matchesLevel(
  t: CurriculumTopic,
  userLevel: string | null,
  domain: LearningDomain
): boolean {
  if (!userLevel) return true;
  const user = ordinal(userLevel, domain);
  if (user == null) return true;

  const min = ordinal(t.levelMin, domain);
  const max = ordinal(t.levelMax ?? t.levelMin, domain);
  if (min == null && max == null) return true;
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;
  return user >= lo && user <= hi;
}

// ─── Public helper: annotate topics ────────────────────────────────────

/**
 * Вешает на topic + mastery derived-поля stage и isUnlocked. Не мутирует.
 */
export function annotateTopics(
  topics: CurriculumTopic[],
  masteryById: ReadonlyMap<string, LessonMastery>
): Array<CurriculumTopic & { stage: Stage; isUnlocked: boolean; mastery: LessonMastery | null }> {
  const masteredSlugs = new Set<string>();
  for (const t of topics) {
    if (masteryById.get(t.id)?.masteredAt) masteredSlugs.add(t.slug);
  }
  return topics.map((t) => ({
    ...t,
    mastery: masteryById.get(t.id) ?? null,
    stage: bucketStage(t),
    isUnlocked: isUnlocked(t, masteredSlugs),
  }));
}
