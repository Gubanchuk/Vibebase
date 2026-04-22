/**
 * Journal domain — shared types.
 *
 * Dependency-free so client, server, and fixture modules can share.
 * `createdAt` / `updatedAt` are ISO strings to stay JSON-serialisable.
 */

export type BacklinkType = "skill" | "lesson" | "radar";

export interface Backlink {
  type: BacklinkType;
  id: string;
  label: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  contentMd: string;
  templatesUsed: string[];
  backlinks: Backlink[];
  /** ISO string. */
  createdAt: string;
  /** ISO string. */
  updatedAt: string;
}

export interface JournalGroup {
  label: string;
  entries: JournalEntry[];
}
