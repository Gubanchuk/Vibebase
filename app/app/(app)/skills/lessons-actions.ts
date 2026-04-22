"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/core/auth";
import { saveSkillLesson } from "@/lib/domains/skills/repo";
import type { SkillLesson } from "@/lib/domains/skills/types";

/**
 * Сохраняет сгенерированный AI-урок в skill_lessons. Если для этого узла
 * уже есть активный урок — апдейтим контент в нём же (чтобы existing
 * lesson_progress не сиротел). Иначе — новая строка.
 */
export async function saveSkillLessonAction(input: {
  skillSlug: string;
  nodeId: string;
  title: string;
  contentMd: string;
}): Promise<
  | { ok: true; lesson: SkillLesson }
  | { ok: false; error: string }
> {
  try {
    const user = await requireAuth();
    const lesson = await saveSkillLesson(user.userId, input.nodeId, {
      title: input.title.trim().slice(0, 160),
      contentMd: input.contentMd,
      generatedByAi: true,
    });
    revalidatePath(`/skills/${input.skillSlug}`);
    revalidatePath(`/skills/${input.skillSlug}/lessons/${lesson.id}`);
    return { ok: true, lesson };
  } catch (err) {
    console.error("[lessons-actions] save failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Сохранение упало",
    };
  }
}
