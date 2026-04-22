"use client";

import * as React from "react";
import Link from "next/link";
import { format, isToday, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Chip } from "@/components/ui/chip";
import type { JournalEntry } from "@/lib/domains/journal/types";

/** Strip markdown formatting for a terse 2-line preview. */
function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/m, "") // frontmatter
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+\[[ x]\]\s+/gim, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\n{2,}/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

export function EntryRow({ entry }: { entry: JournalEntry }) {
  const d = parseISO(entry.updatedAt);
  const timeLabel = isToday(d)
    ? format(d, "HH:mm", { locale: ru })
    : format(d, "d MMM · HH:mm", { locale: ru });

  const preview = stripMarkdown(entry.contentMd).slice(0, 220);
  const title = entry.title.trim() || "Без названия";

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="group block card card-hover px-4 py-3.5"
    >
      <div className="flex items-baseline gap-3 mb-1">
        <h3 className="text-[15px] font-semibold leading-snug truncate">{title}</h3>
        <span
          className="ml-auto shrink-0 mono text-[11px]"
          style={{ color: "var(--subtle)" }}
        >
          {timeLabel}
        </span>
      </div>
      {preview ? (
        <p
          className="text-[13px] leading-relaxed line-clamp-2"
          style={{ color: "var(--muted)" }}
        >
          {preview}
        </p>
      ) : (
        <p
          className="text-[13px] serif-italic"
          style={{ color: "var(--subtle)" }}
        >
          Пусто
        </p>
      )}
      {entry.backlinks.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {entry.backlinks.slice(0, 4).map((b) => (
            <Chip key={`${b.type}-${b.id}`} tone="violet" className="text-[11px]">
              {b.label}
            </Chip>
          ))}
          {entry.backlinks.length > 4 ? (
            <span
              className="mono text-[11px] self-center"
              style={{ color: "var(--subtle)" }}
            >
              +{entry.backlinks.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
