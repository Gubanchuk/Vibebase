/**
 * Seed localStorage with fixture entries on first mount.
 *
 * Intended for client-only usage. No-op on the server.
 */

import { getSeedEntries } from "./fixtures";
import { STORAGE_KEY_JOURNAL } from "./store";

export function seedJournalOnce(): void {
  if (typeof window === "undefined") return;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (existing && existing !== "[]") return;
    window.localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(getSeedEntries()));
  } catch {
    // storage unavailable — ignore
  }
}
