import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";
import type { PlacementResult, VibecodingLevel } from "./types";

/**
 * Placement persistence для vibecoding (зеркало english/placement-repo).
 * Каждая попытка → новая строка в placement_results с domain='vibecoding';
 * user_profiles.vibecoding_level держит последний уровень.
 */

export async function saveVibecodingAttempt(
  userId: UserId,
  result: PlacementResult
): Promise<void> {
  const db = getSupabaseAdmin();

  const { error: historyErr } = await db.from("placement_results").insert({
    user_id: userId,
    domain: "vibecoding",
    level: result.level,
    confidence: result.confidence,
    raw_jsonb: {
      correct: result.correct,
      total: result.total,
      summary: result.summary,
    },
  });
  if (historyErr) {
    console.error("[vc-placement] history insert failed:", historyErr);
    throw new Error("Не удалось сохранить результат — проверь миграцию 0003.");
  }

  const { error: profileErr } = await db
    .from("user_profiles")
    .update({ vibecoding_level: result.level })
    .eq("user_id", userId);
  if (profileErr) {
    const { error: upsertErr } = await db.from("user_profiles").upsert({
      user_id: userId,
      vibecoding_level: result.level,
    });
    if (upsertErr) {
      console.error("[vc-placement] profile update failed:", upsertErr);
      throw new Error("Не удалось обновить уровень в профиле.");
    }
  }
}

export async function getCurrentVibecodingLevel(
  userId: UserId
): Promise<VibecodingLevel | null> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("user_profiles")
      .select("vibecoding_level")
      .eq("user_id", userId)
      .maybeSingle();
    const level = data?.vibecoding_level as string | null | undefined;
    if (!level) return null;
    if (
      level === "newbie" ||
      level === "practitioner" ||
      level === "architect" ||
      level === "maintainer"
    ) {
      return level;
    }
    return null;
  } catch {
    return null;
  }
}

export async function listVibecodingHistory(
  userId: UserId,
  limit = 10
): Promise<Array<{ level: VibecodingLevel; confidence: number; answeredAt: string }>> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("placement_results")
      .select("level, confidence, answered_at")
      .eq("user_id", userId)
      .eq("domain", "vibecoding")
      .order("answered_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => ({
      level: r.level as VibecodingLevel,
      confidence: Number(r.confidence),
      answeredAt: String(r.answered_at),
    }));
  } catch {
    return [];
  }
}
