"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/core/auth";
import { getCurrentLevel } from "@/lib/domains/english/placement-repo";
import { getCurrentVibecodingLevel } from "@/lib/domains/vibecoding/placement-repo";
import {
  getLessonForUser,
  getTopicBySlug,
  listTopics,
  recordQuizAttempt,
  replaceTopics,
  saveLesson,
  setExercisePassed,
} from "@/lib/domains/learning/repo";
import type {
  LearningDomain,
  LessonContent,
  QuizItem,
} from "@/lib/domains/learning/types";
import { runCurator } from "@/lib/domains/learning/agents/curator";
import { runTeacher } from "@/lib/domains/learning/agents/teacher";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { insertUsageRow } from "@/lib/core/usage-repo";
import { costFor } from "@/lib/core/pricing";
import { env } from "@/lib/env";

async function userLevelFor(
  userId: string,
  domain: LearningDomain
): Promise<string | null> {
  if (domain === "english") return getCurrentLevel(userId as never);
  return getCurrentVibecodingLevel(userId as never);
}

/**
 * CURATOR-триггер. Читает vault, зовёт LLM, апсертит топики в БД.
 * Можно безопасно звать повторно — upsert по (domain, slug).
 */
export async function runCuratorAction(
  domain: LearningDomain
): Promise<
  | { ok: true; count: number; topics: Array<{ slug: string; title: string }> }
  | { ok: false; error: string }
> {
  try {
    await requireAuth();
    if (!env.OPENAI_API_KEY) {
      return { ok: false, error: "OPENAI_API_KEY не задан" };
    }

    const started = Date.now();
    const curated = await runCurator(domain);

    const topicsInput = curated.topics.map((t, i) => ({
      slug: t.slug,
      title: t.title,
      summary: t.summary,
      importance: t.importance,
      popularity: t.popularity,
      levelMin: t.levelMin,
      levelMax: t.levelMax,
      tags: t.tags,
      vaultRefs: t.vaultRefs,
      prerequisites: t.prerequisites,
      sortOrder: i,
    }));

    const count = await replaceTopics(domain, topicsInput);

    // Best-effort usage log.
    try {
      const user = await requireAuth();
      await insertUsageRow({
        userId: user.userId,
        domain: "skills.generate-lesson",
        model: "gpt-5.4",
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        latencyMs: Date.now() - started,
        status: "ok",
        finishReason: "stop",
      });
    } catch {
      /* ignore */
    }

    revalidatePath("/learn");
    revalidatePath(`/learn/${domain}`);

    return {
      ok: true,
      count,
      topics: curated.topics.map((t) => ({ slug: t.slug, title: t.title })),
    };
  } catch (err) {
    console.error("[curator] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Curator упал",
    };
  }
}

/**
 * TEACHER. Возвращает урок для текущего юзера по (domain, slug).
 * Если в БД уже есть — отдаёт кеш. Иначе — генерит и сохраняет.
 */
export async function getOrGenerateLessonAction(
  domain: LearningDomain,
  slug: string
): Promise<
  | { ok: true; lesson: LessonContent; topicId: string; freshGenerated: boolean }
  | { ok: false; error: string }
> {
  try {
    const user = await requireAuth();
    const topic = await getTopicBySlug(domain, slug);
    if (!topic) return { ok: false, error: "Топик не найден" };

    const cached = await getLessonForUser(user.userId, topic.id);
    if (cached) {
      return { ok: true, lesson: cached, topicId: topic.id, freshGenerated: false };
    }

    if (!env.OPENAI_API_KEY) {
      return { ok: false, error: "OPENAI_API_KEY не задан" };
    }

    const level = await userLevelFor(user.userId, domain);

    // Подтягиваем vault-excerpts под теcурс (если они есть в vault).
    const vaultDir =
      domain === "english"
        ? join(process.cwd(), "..", "autoresearch", "vault", "english-learning")
        : join(process.cwd(), "..", "autoresearch", "vault", "radar-items");
    const excerpts: Array<{ ref: string; excerpt: string }> = [];
    for (const ref of topic.vaultRefs.slice(0, 4)) {
      const full = join(vaultDir, ref);
      if (existsSync(full)) {
        try {
          excerpts.push({
            ref,
            excerpt: readFileSync(full, "utf-8"),
          });
        } catch {
          /* ignore */
        }
      }
    }

    const started = Date.now();
    const { lesson, usage } = await runTeacher({
      domain,
      topicTitle: topic.title,
      topicSummary: topic.summary,
      topicTags: topic.tags,
      vaultRefs: topic.vaultRefs,
      vaultExcerpts: excerpts,
      userLevel: level,
    });

    const cost = costFor("gpt-5.4", usage.inputTokens, usage.outputTokens);

    const saved = await saveLesson(user.userId, topic.id, {
      levelSnapshot: level,
      introMd: lesson.introMd,
      conceptMd: lesson.conceptMd,
      exampleMd: lesson.exampleMd,
      exerciseMd: lesson.exerciseMd,
      exerciseSolutionMd: lesson.exerciseSolutionMd,
      quiz: lesson.quiz,
      modelUsed: "gpt-5.4",
      tokensIn: usage.inputTokens,
      tokensOut: usage.outputTokens,
      costUsd: cost,
    });

    try {
      await insertUsageRow({
        userId: user.userId,
        domain: "skills.generate-lesson",
        model: "gpt-5.4",
        tokensIn: usage.inputTokens,
        tokensOut: usage.outputTokens,
        costUsd: cost,
        latencyMs: Date.now() - started,
        status: "ok",
        finishReason: "stop",
      });
    } catch {
      /* ignore */
    }

    revalidatePath(`/learn/${domain}/${slug}`);
    return { ok: true, lesson: saved, topicId: topic.id, freshGenerated: true };
  } catch (err) {
    console.error("[teacher] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Teacher упал",
    };
  }
}

/**
 * Ответы на квиз → оцениваем строго по correctIndex. Засчитываем mastery
 * если ≥ 2/3 и упражнение отмечено passed.
 */
export async function submitQuizAction(input: {
  domain: LearningDomain;
  slug: string;
  answers: number[]; // indices chosen, same length as quiz
}): Promise<
  | {
      ok: true;
      score: number;
      total: number;
      perQuestion: Array<{ correct: boolean; correctIndex: number; explanation: string }>;
      mastered: boolean;
    }
  | { ok: false; error: string }
> {
  try {
    const user = await requireAuth();
    const topic = await getTopicBySlug(input.domain, input.slug);
    if (!topic) return { ok: false, error: "Топик не найден" };
    const lesson = await getLessonForUser(user.userId, topic.id);
    if (!lesson) return { ok: false, error: "Урок не сгенерирован" };

    const quiz: QuizItem[] = lesson.quiz;
    if (input.answers.length !== quiz.length) {
      return { ok: false, error: "Количество ответов не совпадает с квизом" };
    }

    let score = 0;
    const perQuestion = quiz.map((q, i) => {
      const correct = input.answers[i] === q.correctIndex;
      if (correct) score += 1;
      return {
        correct,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const mastery = await recordQuizAttempt(
      user.userId,
      topic.id,
      score,
      quiz.length,
      false
    );

    revalidatePath("/learn");
    revalidatePath(`/learn/${input.domain}`);
    revalidatePath(`/learn/${input.domain}/${input.slug}`);

    return {
      ok: true,
      score,
      total: quiz.length,
      perQuestion,
      mastered: Boolean(mastery.masteredAt),
    };
  } catch (err) {
    console.error("[submitQuiz] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Quiz submit упал",
    };
  }
}

/**
 * Пометка upражнения как выполненного (самооценка).
 */
export async function markExerciseDoneAction(input: {
  domain: LearningDomain;
  slug: string;
  passed: boolean;
}): Promise<{ ok: true; mastered: boolean } | { ok: false; error: string }> {
  try {
    const user = await requireAuth();
    const topic = await getTopicBySlug(input.domain, input.slug);
    if (!topic) return { ok: false, error: "Топик не найден" };

    await setExercisePassed(user.userId, topic.id, input.passed);

    // Если уже проходил квиз на ≥67% и теперь упражнение — пересчитываем mastery.
    const mastery = await recordQuizAttempt(
      user.userId,
      topic.id,
      0, // не меняем score — recordQuizAttempt берёт max с existing
      3,
      input.passed
    );

    revalidatePath("/learn");
    revalidatePath(`/learn/${input.domain}`);
    revalidatePath(`/learn/${input.domain}/${input.slug}`);

    return { ok: true, mastered: Boolean(mastery.masteredAt) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Mark exercise failed",
    };
  }
}

/**
 * Повторная генерация урока — стирает кеш, перегенерирует.
 */
export async function regenerateLessonAction(input: {
  domain: LearningDomain;
  slug: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireAuth();
    const topic = await getTopicBySlug(input.domain, input.slug);
    if (!topic) return { ok: false, error: "Топик не найден" };

    const { getSupabaseAdmin } = await import(
      "@/lib/infra/supabase/admin"
    );
    const db = getSupabaseAdmin();
    await db
      .from("lesson_content")
      .delete()
      .eq("user_id", user.userId)
      .eq("topic_id", topic.id);

    revalidatePath(`/learn/${input.domain}/${input.slug}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Regenerate failed",
    };
  }
}

export { listTopics };
