"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/core/auth";
import {
  toggleBookmark,
  saveNotes,
} from "@/lib/domains/learning/annotations-repo";
import type { TopicAnnotation } from "@/lib/domains/learning/types";

export async function toggleBookmarkAction(
  topicId: string
): Promise<
  | { ok: true; annotation: TopicAnnotation }
  | { ok: false; error: string }
> {
  try {
    const user = await requireAuth();
    const annotation = await toggleBookmark(user.userId, topicId);
    revalidatePath("/learn");
    return { ok: true, annotation };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "toggle упал",
    };
  }
}

export async function saveNotesAction(
  topicId: string,
  notes: string
): Promise<
  | { ok: true; annotation: TopicAnnotation }
  | { ok: false; error: string }
> {
  try {
    const user = await requireAuth();
    const annotation = await saveNotes(user.userId, topicId, notes);
    revalidatePath("/learn");
    return { ok: true, annotation };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "сохранение упало",
    };
  }
}
