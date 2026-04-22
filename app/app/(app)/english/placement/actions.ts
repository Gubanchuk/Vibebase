"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/core/auth";
import { savePlacementAttempt } from "@/lib/domains/english/placement-repo";
import type { PlacementResult } from "@/lib/domains/english/types";

/**
 * Finish placement — пишет новую строку в history и обновляет уровень в
 * профиле. Следующая пересдача создаст ещё одну строку, а профиль
 * всегда держит последний результат.
 */
export async function finishPlacementAction(
  result: PlacementResult
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireAuth();
    await savePlacementAttempt(user.userId, result);
    revalidatePath("/dashboard");
    revalidatePath("/english");
    revalidatePath("/settings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Save failed",
    };
  }
}
