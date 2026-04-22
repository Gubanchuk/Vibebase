"use client";

import * as React from "react";
import {
  Sunrise,
  BookOpen,
  Lightbulb,
  CalendarRange,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { TEMPLATES, type JournalTemplate } from "@/lib/domains/journal/templates";

const ICONS: Record<string, LucideIcon> = {
  Sunrise,
  BookOpen,
  Lightbulb,
  CalendarRange,
};

export function TemplatePicker({ onPick }: { onPick: (t: JournalTemplate) => void }) {
  return (
    <div className="flex flex-col gap-1 min-w-[280px]">
      <div
        className="text-[11px] uppercase tracking-wider px-2 pt-1 pb-2 mono"
        style={{ color: "var(--subtle)" }}
      >
        Шаблоны
      </div>
      {TEMPLATES.map((t) => {
        const Icon = ICONS[t.icon] ?? FileText;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            className="flex items-start gap-3 px-2 py-2 rounded-md text-left transition hover:bg-[color:var(--surface-2)]"
          >
            <span
              className="mt-0.5 shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-2)",
                color: "var(--violet)",
              }}
            >
              <Icon size={14} strokeWidth={1.9} />
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] font-medium leading-tight">{t.label}</span>
              <span
                className="text-[12px] leading-snug"
                style={{ color: "var(--muted)" }}
              >
                {t.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
