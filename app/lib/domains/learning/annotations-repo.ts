import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";
import type { TopicAnnotation } from "./types";

/**
 * Repo для topic_annotations — букмарки и персональные заметки.
 * Толерантно к отсутствию строки (возвращаем дефолт). Все записи идут
 * через upsert по PK (user_id, topic_id).
 */

function rowToAnnotation(r: Record<string, unknown>): TopicAnnotation {
  return {
    userId: String(r.user_id),
    topicId: String(r.topic_id),
    isBookmarked: Boolean(r.is_bookmarked),
    personalNotes: String(r.personal_notes ?? ""),
    updatedAt: String(r.updated_at),
  };
}

function emptyAnnotation(userId: UserId, topicId: string): TopicAnnotation {
  return {
    userId,
    topicId,
    isBookmarked: false,
    personalNotes: "",
    updatedAt: new Date().toISOString(),
  };
}

export async function getAnnotation(
  userId: UserId,
  topicId: string
): Promise<TopicAnnotation> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("topic_annotations")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .maybeSingle();
    return data ? rowToAnnotation(data) : emptyAnnotation(userId, topicId);
  } catch {
    return emptyAnnotation(userId, topicId);
  }
}

/**
 * Переключает is_bookmarked. Если строки нет — создаёт с нужным значением.
 * Возвращает финальное состояние.
 */
export async function toggleBookmark(
  userId: UserId,
  topicId: string
): Promise<TopicAnnotation> {
  const db = getSupabaseAdmin();
  const current = await getAnnotation(userId, topicId);
  const next = !current.isBookmarked;

  const { data, error } = await db
    .from("topic_annotations")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        is_bookmarked: next,
        personal_notes: current.personalNotes,
      },
      { onConflict: "user_id,topic_id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("[annotations-repo] toggleBookmark failed:", error);
    throw new Error(error?.message ?? "toggleBookmark failed");
  }
  return rowToAnnotation(data);
}

export async function saveNotes(
  userId: UserId,
  topicId: string,
  notes: string
): Promise<TopicAnnotation> {
  const db = getSupabaseAdmin();
  const current = await getAnnotation(userId, topicId);
  const trimmed = notes.slice(0, 5000); // защита от гигантского текста

  const { data, error } = await db
    .from("topic_annotations")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        is_bookmarked: current.isBookmarked,
        personal_notes: trimmed,
      },
      { onConflict: "user_id,topic_id" }
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("[annotations-repo] saveNotes failed:", error);
    throw new Error(error?.message ?? "saveNotes failed");
  }
  return rowToAnnotation(data);
}
