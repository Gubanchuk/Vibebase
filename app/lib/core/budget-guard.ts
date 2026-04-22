import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { BudgetConfig, UserId } from "./types";
import { sumCostToday, sumCostMonth } from "./usage-repo";

const DEFAULT = {
  dailyCostCapUsd: 2.0,
  monthlyCostCapUsd: 30.0,
  perCallMaxTokensOut: 2048,
};

export async function getBudget(userId: UserId): Promise<BudgetConfig> {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("budget_config")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      return {
        userId,
        dailyCostCapUsd: Number(data.daily_cost_cap_usd ?? DEFAULT.dailyCostCapUsd),
        monthlyCostCapUsd: Number(data.monthly_cost_cap_usd ?? DEFAULT.monthlyCostCapUsd),
        perCallMaxTokensOut: Number(data.per_call_max_tokens_out ?? DEFAULT.perCallMaxTokensOut),
      };
    }

    // Seed default on first access.
    await db.from("budget_config").upsert({
      user_id: userId,
      daily_cost_cap_usd: DEFAULT.dailyCostCapUsd,
      monthly_cost_cap_usd: DEFAULT.monthlyCostCapUsd,
      per_call_max_tokens_out: DEFAULT.perCallMaxTokensOut,
    });

    return { userId, ...DEFAULT };
  } catch {
    return { userId, ...DEFAULT };
  }
}

export async function updateBudget(
  userId: UserId,
  patch: Partial<Omit<BudgetConfig, "userId">>
): Promise<BudgetConfig> {
  const current = await getBudget(userId);
  const next = { ...current, ...patch };
  try {
    const db = getSupabaseAdmin();
    await db.from("budget_config").upsert({
      user_id: userId,
      daily_cost_cap_usd: next.dailyCostCapUsd,
      monthly_cost_cap_usd: next.monthlyCostCapUsd,
      per_call_max_tokens_out: next.perCallMaxTokensOut,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[budget-guard] update failed:", err);
  }
  return next;
}

export interface BudgetStatus {
  todaySpent: number;
  monthSpent: number;
  dailyCap: number;
  monthlyCap: number;
  todayRatio: number;
  monthRatio: number;
  blocked: boolean;
  softWarning: string | null;
}

export async function budgetStatus(userId: UserId): Promise<BudgetStatus> {
  const cfg = await getBudget(userId);
  const [today, month] = await Promise.all([sumCostToday(userId), sumCostMonth(userId)]);
  const todayRatio = today / cfg.dailyCostCapUsd;
  const monthRatio = month / cfg.monthlyCostCapUsd;
  const blocked = todayRatio >= 1 || monthRatio >= 1;
  const over80 = todayRatio >= 0.8 || monthRatio >= 0.8;
  return {
    todaySpent: today,
    monthSpent: month,
    dailyCap: cfg.dailyCostCapUsd,
    monthlyCap: cfg.monthlyCostCapUsd,
    todayRatio,
    monthRatio,
    blocked,
    softWarning: blocked
      ? "Daily or monthly cap reached — AI calls paused."
      : over80
        ? "You've used 80%+ of your budget window."
        : null,
  };
}
