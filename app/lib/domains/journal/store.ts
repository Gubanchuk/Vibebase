/**
 * Journal store — localStorage-backed CRUD.
 *
 * Designed to be swapped for a Supabase adapter later. All functions guard
 * against `window` being undefined so they are safe to import in server
 * components (they simply become no-ops / empty reads on the server).
 */

import {
  isToday,
  isYesterday,
  isThisWeek,
  format,
  parseISO,
  compareDesc,
} from "date-fns";
import { ru } from "date-fns/locale";
import type { JournalEntry, JournalGroup } from "./types";

// Versioned key — bumping сбрасывает устаревшие фикстуры из прежних прогонов.
const STORAGE_KEY = "journal:entries:v2";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): JournalEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as JournalEntry[];
  } catch {
    return [];
  }
}

function writeAll(entries: JournalEntry[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota / serialization — swallow silently for now
  }
}

export function listEntries(): JournalEntry[] {
  const all = readAll();
  return [...all].sort((a, b) => compareDesc(parseISO(a.updatedAt), parseISO(b.updatedAt)));
}

export function getEntry(id: string): JournalEntry | null {
  const all = readAll();
  return all.find((e) => e.id === id) ?? null;
}

export function upsertEntry(entry: JournalEntry): void {
  const all = readAll();
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  writeAll(all);
}

export function removeEntry(id: string): void {
  const all = readAll();
  writeAll(all.filter((e) => e.id !== id));
}

export function searchEntries(q: string): JournalEntry[] {
  const needle = q.trim().toLowerCase();
  const list = listEntries();
  if (!needle) return list;
  return list.filter(
    (e) =>
      e.title.toLowerCase().includes(needle) ||
      e.contentMd.toLowerCase().includes(needle)
  );
}

/**
 * Group entries into "Сегодня" / "Вчера" / "На этой неделе" / "MMMM yyyy"
 * buckets. Input list is assumed to be the full list; sorting is applied
 * inside to keep groups independent.
 */
export function groupEntries(list: JournalEntry[]): JournalGroup[] {
  const sorted = [...list].sort((a, b) =>
    compareDesc(parseISO(a.updatedAt), parseISO(b.updatedAt))
  );

  const today: JournalEntry[] = [];
  const yesterday: JournalEntry[] = [];
  const thisWeek: JournalEntry[] = [];
  const byMonth = new Map<string, JournalEntry[]>();

  for (const entry of sorted) {
    const d = parseISO(entry.updatedAt);
    if (isToday(d)) {
      today.push(entry);
    } else if (isYesterday(d)) {
      yesterday.push(entry);
    } else if (isThisWeek(d, { weekStartsOn: 1, locale: ru })) {
      thisWeek.push(entry);
    } else {
      const key = format(d, "LLLL yyyy", { locale: ru });
      const bucket = byMonth.get(key);
      if (bucket) {
        bucket.push(entry);
      } else {
        byMonth.set(key, [entry]);
      }
    }
  }

  const groups: JournalGroup[] = [];
  if (today.length) groups.push({ label: "Сегодня", entries: today });
  if (yesterday.length) groups.push({ label: "Вчера", entries: yesterday });
  if (thisWeek.length) groups.push({ label: "На этой неделе", entries: thisWeek });
  for (const [label, entries] of byMonth) {
    groups.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      entries,
    });
  }
  return groups;
}

export const STORAGE_KEY_JOURNAL = STORAGE_KEY;
