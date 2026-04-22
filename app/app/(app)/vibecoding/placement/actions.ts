"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/core/auth";
import { saveVibecodingAttempt } from "@/lib/domains/vibecoding/placement-repo";
import type { PlacementResult } from "@/lib/domains/vibecoding/types";
import { seedVibecodingSkillForLevel } from "@/lib/domains/vibecoding/skill-seeder";

export async function finishVibecodingPlacementAction(
  result: PlacementResult
): Promise<{ ok: true; skillSlug: string | null } | { ok: false; error: string }> {
  try {
    const user = await requireAuth();
    await saveVibecodingAttempt(user.userId, result);
    // Авто-сид skill tree под уровень. Если уже существует — обновит archivedAt.
    const skillSlug = await seedVibecodingSkillForLevel(user.userId, result.level);
    revalidatePath("/dashboard");
    revalidatePath("/vibecoding");
    revalidatePath("/skills");
    revalidatePath("/settings");
    return { ok: true, skillSlug };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Save failed",
    };
  }
}
