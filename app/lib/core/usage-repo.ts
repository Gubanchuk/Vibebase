import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { Domain, ModelId, UserId, UsageRow } from "./types";

/**
 * Supabase-backed usage log. If DB is unreachable (schema not applied yet,
 * no auth, etc.) functions fail gracefully with empty results / no-op
 * inserts, so the UI keeps rendering.
 */

function toRow(r: Record<string, unknown>): UsageRow {
  return {
    id: String(r.id),
    userId: r.user_id as UserId,
    domain: r.domain as Domain,
    model: r.model as ModelId,
    tokensIn: Number(r.tokens_in ?? 0),
    tokensOut: Number(r.tokens_out ?? 0),
    costUsd: Number(r.cost_usd ?? 0),
    latencyMs: Number(r.latency_ms ?? 0),
    status: (r.status as UsageRow["status"]) ?? "ok",
    finishReason: String(r.finish_reason ?? ""),
    createdAt: String(r.created_at),
  };
}

export async function insertUsageRow(
  row: Omit<UsageRow, "id" | "createdAt"> & { createdAt?: string }
): Promise<void> {
  try {
    const db = getSupabaseAdmin();
    await db.from("ai_usage_log").insert({
      user_id: row.userId,
      domain: row.domain,
      model: row.model,
      tokens_in: row.tokensIn,
      tokens_out: row.tokensOut,
      cost_usd: row.costUsd,
      latency_ms: row.latencyMs,
      status: row.status,
      finish_reason: row.finishReason,
    });
  } catch (err) {
    console.warn("[usage-repo] insert failed:", err);
  }
}

export async function listRecent(userId: UserId, limit = 50): Promise<UsageRow[]> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("ai_usage_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toRow);
  } catch (err) {
    console.warn("[usage-repo] listRecent failed:", err);
    return [];
  }
}

function startOfDayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function sumCostToday(userId: UserId): Promise<number> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("ai_usage_log")
      .select("cost_usd")
      .eq("user_id", userId)
      .gte("created_at", startOfDayISO());
    return (data ?? []).reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
  } catch {
    return 0;
  }
}

export async function sumCostMonth(userId: UserId): Promise<number> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("ai_usage_log")
      .select("cost_usd")
      .eq("user_id", userId)
      .gte("created_at", startOfMonthISO());
    return (data ?? []).reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
  } catch {
    return 0;
  }
}

export async function costByDomain(
  userId: UserId
): Promise<Array<{ domain: Domain; cost: number; calls: number }>> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("ai_usage_log")
      .select("domain, cost_usd")
      .eq("user_id", userId);
    const map = new Map<Domain, { cost: number; calls: number }>();
    for (const r of data ?? []) {
      const d = r.domain as Domain;
      const bucket = map.get(d) ?? { cost: 0, calls: 0 };
      bucket.cost += Number(r.cost_usd ?? 0);
      bucket.calls += 1;
      map.set(d, bucket);
    }
    return Array.from(map.entries())
      .map(([domain, v]) => ({ domain, ...v }))
      .sort((a, b) => b.cost - a.cost);
  } catch {
    return [];
  }
}
