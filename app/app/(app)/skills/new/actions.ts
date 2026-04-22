"use server";

import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { requireAuth } from "@/lib/core/auth";
import { env } from "@/lib/env";
import { RoadmapSchema, type Roadmap } from "@/lib/domains/skills/roadmap-schema";
import { createSkillWithTree } from "@/lib/domains/skills/repo";
import type { SkillTargetLevel } from "@/lib/domains/skills/types";
import { insertUsageRow } from "@/lib/core/usage-repo";
import { costFor } from "@/lib/core/pricing";

const LEVEL_HINT: Record<SkillTargetLevel, string> = {
  beginner: "человек стартует с нуля, не знает базы",
  intermediate: "уже знает основы, хочет дойти до уверенного рабочего уровня",
  advanced: "опытный, хочет expert-level нюансы и редкие паттерны",
};

/**
 * Фаза 1 — AI собирает roadmap, ничего не сохраняет. Возвращает превью
 * для UI, дальше юзер подтверждает и мы зовём `commitSkillAction`.
 */
export async function generateRoadmapAction(input: {
  name: string;
  goal: string;
  targetLevel: SkillTargetLevel;
}): Promise<
  | { ok: true; roadmap: Roadmap }
  | { ok: false; error: string }
> {
  try {
    const user = await requireAuth();

    if (!env.OPENAI_API_KEY) {
      return {
        ok: false,
        error: "OPENAI_API_KEY не задан — генерация недоступна.",
      };
    }

    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    const model = env.OPENAI_MODEL_DEFAULT;

    const started = Date.now();
    const system =
      "Ты — планировщик обучающих roadmap'ов. По названию навыка и цели " +
      "пользователя ты составляешь структурированное дерево на русском языке: " +
      "3–8 корневых тем, у 2–3 из них могут быть подтемы (до 6 детей). " +
      "Заголовки — короткие, существительные или существительное+глагол. " +
      "Описания — одна фраза, что именно в этой теме изучаем. " +
      "Выбираешь один emoji, отражающий суть навыка. " +
      "В summary — короткая мотивация и схема прохождения дерева. " +
      "НЕ используй маркеры списков в description, только связный текст.";

    const prompt = [
      `Навык: ${input.name}`,
      `Цель пользователя: ${input.goal}`,
      `Уровень: ${input.targetLevel} (${LEVEL_HINT[input.targetLevel]})`,
      "",
      "Собери roadmap под это. 3–8 корневых тем, у ключевых 2–3 темы сделай подтемы.",
    ].join("\n");

    const result = await generateObject({
      model: openai(model),
      schema: RoadmapSchema,
      system,
      prompt,
    });

    // Log usage — best-effort, не блокируем на ошибке.
    try {
      const tokensIn = result.usage?.inputTokens ?? 0;
      const tokensOut = result.usage?.outputTokens ?? 0;
      await insertUsageRow({
        userId: user.userId,
        domain: "skills.generate-lesson",
        model: "gpt-5.4",
        tokensIn,
        tokensOut,
        costUsd: costFor("gpt-5.4", tokensIn, tokensOut),
        latencyMs: Date.now() - started,
        status: "ok",
        finishReason: "stop",
      });
    } catch (err) {
      console.warn("[generateRoadmap] usage log skipped:", err);
    }

    return { ok: true, roadmap: result.object };
  } catch (err) {
    console.error("[generateRoadmap] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Генерация упала",
    };
  }
}

/**
 * Фаза 2 — подтверждённый roadmap сохраняется в Supabase и возвращается slug
 * для редиректа.
 */
export async function commitSkillAction(input: {
  name: string;
  description: string;
  targetLevel: SkillTargetLevel;
  emoji: string;
  roadmap: Roadmap;
}): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  try {
    const user = await requireAuth();
    const { slug } = await createSkillWithTree(user.userId, {
      name: input.name.trim(),
      description: input.description.trim(),
      targetLevel: input.targetLevel,
      emoji: input.emoji,
      nodes: input.roadmap.nodes.map((n) => ({
        title: n.title,
        description: n.description,
        children: n.children?.map((c) => ({
          title: c.title,
          description: c.description,
        })),
      })),
    });
    revalidatePath("/skills");
    revalidatePath("/dashboard");
    return { ok: true, slug };
  } catch (err) {
    console.error("[commitSkill] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Сохранение упало",
    };
  }
}
