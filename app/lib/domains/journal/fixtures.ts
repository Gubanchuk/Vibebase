/**
 * Journal fixtures — пусто. Записи появляются, когда юзер их пишет.
 * Для empty state на `/journal` этого достаточно.
 */

import type { JournalEntry } from "./types";

export function getSeedEntries(): JournalEntry[] {
  return [];
}
