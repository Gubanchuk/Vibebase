import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";
import type { PlacementResult } from "./types";

/**
 * Placement persistence — каждая попытка добавляется как новая строка в
 * `placement_results` (история), а `user_profiles.english_level` всегда
 * отражает последний результат. Пересдача ⇒ новая строка + обновлённый
 * уровень в профиле. История сохраняется — можно смотреть прогресс.
 */

export async function savePlacementAttempt(
  userId: UserId,
  result: PlacementResult
): Promise<void> {
  const db = getSupabaseAdmin();

  // 1. История попыток — новая строка, никогда не перезаписываем.
  const { error: historyErr } = await db.from("placement_results").insert({
    user_id: userId,
    level: result.level,
    confidence: result.confidence,
    raw_jsonb: {
      correct: result.correct,
      total: result.total,
      summary: result.summary,
    },
  });
  if (historyErr) {
    console.error("[placement] history insert failed:", historyErr);
    throw new Error("Не удалось сохранить результат. Проверь миграции.");
  }

  // 2. Последний уровень — в профиль. Upsert защищает от первой попытки.
  const { error: profileErr } = await db
    .from("user_profiles")
    .update({ english_level: result.level })
    .eq("user_id", userId);

  if (profileErr) {
    // Возможно профиль ещё не создан — пробуем upsert.
    const { error: upsertErr } = await db.from("user_profiles").upsert({
      user_id: userId,
      english_level: result.level,
    });
    if (upsertErr) {
      console.error("[placement] profile update failed:", upsertErr);
      throw new Error("Не удалось обновить уровень в профиле.");
    }
  }
}

export async function getCurrentLevel(userId: UserId): Promise<string | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("user_profiles")
      .select("english_level")
      .eq("user_id", userId)
      .maybeSingle();
    return (data?.english_level as string | null) ?? null;
  } catch {
    return null;
  }
}

export async function listPlacementHistory(
  userId: UserId,
  limit = 10
): Promise<Array<{ level: string; confidence: number; answeredAt: string }>> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("placement_results")
      .select("level, confidence, answered_at")
      .eq("user_id", userId)
      .order("answered_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => ({
      level: String(r.level),
      confidence: Number(r.confidence),
      answeredAt: String(r.answered_at),
    }));
  } catch {
    return [];
  }
}
