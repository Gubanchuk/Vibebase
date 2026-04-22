import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";
import type {
  CurriculumTopic,
  LearningDomain,
  LessonContent,
  LessonMastery,
  QuizItem,
  TopicAnnotation,
  TopicWithUserState,
  TopicWithMastery,
} from "./types";
import { annotateTopics } from "./roadmap";
import { touchActivity } from "@/lib/domains/streak/repo";

// ─── Row mappers ───────────────────────────────────────────────────────

function rowToTopic(r: Record<string, unknown>): CurriculumTopic {
  const imp = Number(r.importance ?? 3);
  const clamp = (n: number): 1 | 2 | 3 | 4 | 5 =>
    (Math.max(1, Math.min(5, n)) as 1 | 2 | 3 | 4 | 5);
  return {
    id: String(r.id),
    domain: r.domain as LearningDomain,
    slug: String(r.slug),
    title: String(r.title),
    summary: String(r.summary ?? ""),
    importance: clamp(imp),
    popularity: Number(r.popularity ?? 0),
    levelMin: (r.level_min as string | null) ?? null,
    levelMax: (r.level_max as string | null) ?? null,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    vaultRefs: Array.isArray(r.vault_refs) ? (r.vault_refs as string[]) : [],
    prerequisites: Array.isArray(r.prerequisites)
      ? (r.prerequisites as string[])
      : [],
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function rowToLesson(r: Record<string, unknown>): LessonContent {
  return {
    id: String(r.id),
    topicId: String(r.topic_id),
    userId: String(r.user_id),
    levelSnapshot: (r.level_snapshot as string | null) ?? null,
    introMd: String(r.intro_md ?? ""),
    conceptMd: String(r.concept_md ?? ""),
    exampleMd: String(r.example_md ?? ""),
    exerciseMd: String(r.exercise_md ?? ""),
    exerciseSolutionMd: String(r.exercise_solution_md ?? ""),
    quiz: Array.isArray(r.quiz_jsonb) ? (r.quiz_jsonb as QuizItem[]) : [],
    generatedAt: String(r.generated_at),
    modelUsed: (r.model_used as string | null) ?? null,
    tokensIn: (r.tokens_in as number | null) ?? null,
    tokensOut: (r.tokens_out as number | null) ?? null,
    costUsd: (r.cost_usd as number | null) ?? null,
  };
}

function rowToMastery(r: Record<string, unknown>): LessonMastery {
  return {
    userId: String(r.user_id),
    topicId: String(r.topic_id),
    attempts: Number(r.attempts ?? 0),
    quizBestScore: Number(r.quiz_best_score ?? 0),
    quizBestTotal: Number(r.quiz_best_total ?? 3),
    exercisePassed: Boolean(r.exercise_passed),
    masteredAt: (r.mastered_at as string | null) ?? null,
    lastAttemptAt: (r.last_attempt_at as string | null) ?? null,
    notes: (r.notes as string | null) ?? null,
  };
}

// ─── Topics ────────────────────────────────────────────────────────────

export async function listTopics(
  domain: LearningDomain
): Promise<CurriculumTopic[]> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("curriculum_topics")
      .select("*")
      .eq("domain", domain)
      .order("sort_order", { ascending: true })
      .order("importance", { ascending: false })
      .order("popularity", { ascending: false });
    return (data ?? []).map(rowToTopic);
  } catch (err) {
    console.warn("[learning-repo] listTopics failed:", err);
    return [];
  }
}

export async function listTopicsWithMastery(
  userId: UserId,
  domain: LearningDomain
): Promise<TopicWithMastery[]> {
  // Alias к listTopicsWithUserState — TopicWithMastery теперь type alias.
  return listTopicsWithUserState(userId, domain);
}

/**
 * Полный фетч: topic + mastery + annotation + derived (stage, isUnlocked).
 * Один раз вызывается на рендере /learn для каждого домена, дальше страница
 * фильтрует in-memory.
 *
 * Prerequisites в БД = uuid[], но в типе CurriculumTopic — string[] slugs
 * (так маппер делал всегда, хотя значения там uuid). Чтобы isUnlocked
 * работал корректно, конвертируем prerequisites-uuid → prerequisites-slug
 * через map topicId→slug, собранный из текущего фетча.
 */
export async function listTopicsWithUserState(
  userId: UserId,
  domain: LearningDomain
): Promise<TopicWithUserState[]> {
  const [rawTopics, masteryList, annotations] = await Promise.all([
    listTopics(domain),
    listUserMastery(userId),
    listUserAnnotations(userId),
  ]);

  // uuid → slug, чтобы нормализовать prerequisites.
  const idToSlug = new Map<string, string>();
  for (const t of rawTopics) idToSlug.set(t.id, t.slug);

  const topics: CurriculumTopic[] = rawTopics.map((t) => ({
    ...t,
    prerequisites: t.prerequisites
      .map((p) => idToSlug.get(p) ?? p) // uuid → slug; если уже slug — оставляем
      .filter(Boolean),
  }));

  const masteryById = new Map(masteryList.map((m) => [m.topicId, m]));
  const annotationById = new Map(annotations.map((a) => [a.topicId, a]));

  const annotated = annotateTopics(topics, masteryById);
  return annotated.map((t) => ({
    ...t,
    annotation: annotationById.get(t.id) ?? null,
  }));
}

export async function getTopicBySlug(
  domain: LearningDomain,
  slug: string
): Promise<CurriculumTopic | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("curriculum_topics")
      .select("*")
      .eq("domain", domain)
      .eq("slug", slug)
      .maybeSingle();
    return data ? rowToTopic(data) : null;
  } catch {
    return null;
  }
}

export async function replaceTopics(
  domain: LearningDomain,
  topics: Array<{
    slug: string;
    title: string;
    summary: string;
    importance: number;
    popularity: number;
    levelMin: string | null;
    levelMax: string | null;
    tags: string[];
    vaultRefs: string[];
    prerequisites: string[];
    sortOrder: number;
  }>
): Promise<number> {
  const db = getSupabaseAdmin();

  // Upsert each topic by (domain, slug). Преreqs (slug → uuid) мапим после
  // первого прохода, когда знаем id'шники новых топиков.
  const firstPassRows = topics.map((t) => ({
    domain,
    slug: t.slug,
    title: t.title,
    summary: t.summary,
    importance: t.importance,
    popularity: t.popularity,
    level_min: t.levelMin,
    level_max: t.levelMax,
    tags: t.tags,
    vault_refs: t.vaultRefs,
    prerequisites: [],
    sort_order: t.sortOrder,
  }));

  const { data: inserted, error } = await db
    .from("curriculum_topics")
    .upsert(firstPassRows, { onConflict: "domain,slug" })
    .select("id, slug");

  if (error || !inserted) {
    console.error("[learning-repo] upsert topics failed:", error);
    throw new Error(error?.message ?? "topics upsert failed");
  }

  // Второй проход: привязываем prerequisites по slug → id.
  const slugToId = new Map<string, string>();
  for (const row of inserted) {
    slugToId.set(String(row.slug), String(row.id));
  }

  for (const t of topics) {
    if (t.prerequisites.length === 0) continue;
    const prereqIds = t.prerequisites
      .map((s) => slugToId.get(s))
      .filter((x): x is string => Boolean(x));
    if (prereqIds.length === 0) continue;
    const id = slugToId.get(t.slug);
    if (!id) continue;
    await db
      .from("curriculum_topics")
      .update({ prerequisites: prereqIds })
      .eq("id", id);
  }

  return inserted.length;
}

// ─── Lessons ───────────────────────────────────────────────────────────

export async function getLessonForUser(
  userId: UserId,
  topicId: string
): Promise<LessonContent | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("lesson_content")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .maybeSingle();
    return data ? rowToLesson(data) : null;
  } catch {
    return null;
  }
}

export async function saveLesson(
  userId: UserId,
  topicId: string,
  payload: {
    levelSnapshot: string | null;
    introMd: string;
    conceptMd: string;
    exampleMd: string;
    exerciseMd: string;
    exerciseSolutionMd: string;
    quiz: QuizItem[];
    modelUsed: string;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  }
): Promise<LessonContent> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("lesson_content")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        level_snapshot: payload.levelSnapshot,
        intro_md: payload.introMd,
        concept_md: payload.conceptMd,
        example_md: payload.exampleMd,
        exercise_md: payload.exerciseMd,
        exercise_solution_md: payload.exerciseSolutionMd,
        quiz_jsonb: payload.quiz,
        model_used: payload.modelUsed,
        tokens_in: payload.tokensIn,
        tokens_out: payload.tokensOut,
        cost_usd: payload.costUsd,
      },
      { onConflict: "topic_id,user_id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("[learning-repo] saveLesson failed:", error);
    throw new Error(error?.message ?? "saveLesson failed");
  }
  return rowToLesson(data);
}

// ─── Annotations (bookmarks + personal notes) ──────────────────────────

function rowToAnnotation(r: Record<string, unknown>): TopicAnnotation {
  return {
    userId: String(r.user_id),
    topicId: String(r.topic_id),
    isBookmarked: Boolean(r.is_bookmarked),
    personalNotes: String(r.personal_notes ?? ""),
    updatedAt: String(r.updated_at),
  };
}

/**
 * Возвращает все аннотации юзера. Толерантно: если миграция 0005 ещё не
 * применена — вернёт [], не уронит фетч страницы.
 */
export async function listUserAnnotations(
  userId: UserId
): Promise<TopicAnnotation[]> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("topic_annotations")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.warn("[learning-repo] listUserAnnotations:", error.message);
      return [];
    }
    return (data ?? []).map(rowToAnnotation);
  } catch (err) {
    console.warn("[learning-repo] listUserAnnotations failed:", err);
    return [];
  }
}

// ─── Mastery ───────────────────────────────────────────────────────────

export async function listUserMastery(
  userId: UserId
): Promise<LessonMastery[]> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("lesson_mastery")
      .select("*")
      .eq("user_id", userId);
    return (data ?? []).map(rowToMastery);
  } catch {
    return [];
  }
}

export async function getMastery(
  userId: UserId,
  topicId: string
): Promise<LessonMastery | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("lesson_mastery")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .maybeSingle();
    return data ? rowToMastery(data) : null;
  } catch {
    return null;
  }
}

export async function recordQuizAttempt(
  userId: UserId,
  topicId: string,
  score: number,
  total: number,
  exercisePassed: boolean
): Promise<LessonMastery> {
  const db = getSupabaseAdmin();
  const existing = await getMastery(userId, topicId);

  const bestScore = Math.max(existing?.quizBestScore ?? 0, score);
  const passedThreshold = bestScore >= Math.ceil(total * 0.67);
  const mastered =
    passedThreshold && (exercisePassed || existing?.exercisePassed === true);
  const masteredAt = mastered
    ? (existing?.masteredAt ?? new Date().toISOString())
    : null;

  const { data, error } = await db
    .from("lesson_mastery")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        attempts: (existing?.attempts ?? 0) + 1,
        quiz_best_score: bestScore,
        quiz_best_total: total,
        exercise_passed: exercisePassed || existing?.exercisePassed === true,
        mastered_at: masteredAt,
        last_attempt_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("[learning-repo] recordQuizAttempt failed:", error);
    throw new Error(error?.message ?? "recordQuizAttempt failed");
  }
  // Стрик — best-effort, не блокируем.
  void touchActivity(userId);
  return rowToMastery(data);
}

export async function setExercisePassed(
  userId: UserId,
  topicId: string,
  passed: boolean
): Promise<void> {
  const db = getSupabaseAdmin();
  const existing = await getMastery(userId, topicId);
  await db.from("lesson_mastery").upsert(
    {
      user_id: userId,
      topic_id: topicId,
      attempts: existing?.attempts ?? 0,
      quiz_best_score: existing?.quizBestScore ?? 0,
      quiz_best_total: existing?.quizBestTotal ?? 3,
      exercise_passed: passed,
      mastered_at: existing?.masteredAt ?? null,
      last_attempt_at: new Date().toISOString(),
    },
    { onConflict: "user_id,topic_id" }
  );
  if (passed) void touchActivity(userId);
}
