"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/core/auth";
import { updateBudget } from "@/lib/core/budget-guard";

export async function patchBudgetAction(patch: {
  dailyCostCapUsd?: number;
  monthlyCostCapUsd?: number;
  perCallMaxTokensOut?: number;
}) {
  const user = await requireAuth();
  await updateBudget(user.userId, patch);
  revalidatePath("/settings/usage");
  revalidatePath("/dashboard");
}
