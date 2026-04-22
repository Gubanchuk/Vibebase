import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";

/**
 * Streak — считается по «день активности» в UTC. Вчера был активен → +1.
 * Сегодня уже был → noop. Разрыв больше 1 дня → reset до 1.
 *
 * Все вызовы из user-actions идут через {@link touchActivity} и обёрнуты
 * в try/catch на стороне caller — стрик никогда не роняет родительскую операцию.
 */

export interface StreakState {
  current: number;
  best: number;
  lastActivityAt: string | null;
  activeToday: boolean;
}

function utcDayStr(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD в UTC
}

function daysBetween(a: string, b: string): number {
  const ad = Date.parse(a + "T00:00:00Z");
  const bd = Date.parse(b + "T00:00:00Z");
  return Math.round((bd - ad) / 86_400_000);
}

/**
 * Регистрирует активность юзера. Upsert в activity_days + пересчёт стрика
 * в user_profiles. Возвращает новое состояние (или null при ошибке).
 */
export async function touchActivity(
  userId: UserId
): Promise<StreakState | null> {
  try {
    const db = getSupabaseAdmin();
    const today = utcDayStr(new Date());

    // 1. Upsert activity_days: инкрементируем events, если строка есть.
    //    Двумя запросами для простоты — один RPC был бы изящнее, но Supabase
    //    не хотим усложнять миграциями. Гонка в пределах одного юзера неопасна.
    const { data: existing } = await db
      .from("activity_days")
      .select("events")
      .eq("user_id", userId)
      .eq("day", today)
      .maybeSingle();

    if (existing) {
      await db
        .from("activity_days")
        .update({ events: (existing.events as number) + 1 })
        .eq("user_id", userId)
        .eq("day", today);
    } else {
      await db.from("activity_days").insert({
        user_id: userId,
        day: today,
        events: 1,
      });
    }

    // 2. Читаем текущий профиль и пересчитываем стрик.
    const { data: profile } = await db
      .from("user_profiles")
      .select("last_activity_at, streak_days, streak_best")
      .eq("user_id", userId)
      .maybeSingle();

    const prevLastAt =
      (profile?.last_activity_at as string | null | undefined) ?? null;
    const prevStreak = Number(profile?.streak_days ?? 0);
    const prevBest = Number(profile?.streak_best ?? 0);

    const prevDay = prevLastAt ? utcDayStr(new Date(prevLastAt)) : null;
    const gap = prevDay ? daysBetween(prevDay, today) : null;

    let nextStreak: number;
    if (gap === 0) {
      nextStreak = prevStreak > 0 ? prevStreak : 1;
    } else if (gap === 1) {
      nextStreak = prevStreak + 1;
    } else {
      nextStreak = 1;
    }
    const nextBest = Math.max(prevBest, nextStreak);

    const nowIso = new Date().toISOString();

    const updateRow = {
      last_activity_at: nowIso,
      streak_days: nextStreak,
      streak_best: nextBest,
    };

    const { error: updErr } = await db
      .from("user_profiles")
      .update(updateRow)
      .eq("user_id", userId);

    if (updErr) {
      // Возможно профиля ещё нет — пробуем upsert.
      await db.from("user_profiles").upsert({
        user_id: userId,
        ...updateRow,
      });
    }

    return {
      current: nextStreak,
      best: nextBest,
      lastActivityAt: nowIso,
      activeToday: true,
    };
  } catch (err) {
    console.warn("[streak-repo] touchActivity failed (non-fatal):", err);
    return null;
  }
}

export async function getStreak(userId: UserId): Promise<StreakState> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("user_profiles")
      .select("last_activity_at, streak_days, streak_best")
      .eq("user_id", userId)
      .maybeSingle();

    const lastAt =
      (data?.last_activity_at as string | null | undefined) ?? null;
    const current = Number(data?.streak_days ?? 0);
    const best = Number(data?.streak_best ?? 0);

    const today = utcDayStr(new Date());
    const lastDay = lastAt ? utcDayStr(new Date(lastAt)) : null;
    const activeToday = lastDay === today;
    const gap = lastDay ? daysBetween(lastDay, today) : null;

    // Если разрыв больше дня — UI должен показывать что стрик под угрозой
    // или сброшен. Здесь мы НЕ меняем запись в БД, только отчитываемся честно.
    const effectiveCurrent = gap !== null && gap > 1 ? 0 : current;

    return {
      current: effectiveCurrent,
      best,
      lastActivityAt: lastAt,
      activeToday,
    };
  } catch {
    return { current: 0, best: 0, lastActivityAt: null, activeToday: false };
  }
}
