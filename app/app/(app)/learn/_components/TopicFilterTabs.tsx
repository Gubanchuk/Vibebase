"use client";

import { Bookmark, Star, StickyNote, Archive, Layers } from "lucide-react";
import { cn } from "@/lib/cn";

export type TabKey =
  | "all"
  | "bookmarked"
  | "notes"
  | "level"
  | "mastered";

export type TabCount = Record<TabKey, number>;

export function TopicFilterTabs({
  active,
  onChange,
  counts,
  userLevel,
  showLevelTab,
  className,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  counts: TabCount;
  userLevel: string | null;
  /** Если у юзера нет уровня — не показываем level-таб. */
  showLevelTab: boolean;
  className?: string;
}) {
  const tabs: Array<{
    key: TabKey;
    label: string;
    Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    visible: boolean;
  }> = [
    { key: "all", label: "Все", Icon: Layers, visible: true },
    {
      key: "bookmarked",
      label: "Избранное",
      Icon: Bookmark,
      visible: true,
    },
    { key: "notes", label: "С заметками", Icon: StickyNote, visible: true },
    {
      key: "level",
      label: userLevel ? `Мой уровень · ${userLevel}` : "Мой уровень",
      Icon: Star,
      visible: showLevelTab,
    },
    {
      key: "mastered",
      label: "Архив",
      Icon: Archive,
      visible: true,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Фильтр тем"
      className={cn(
        "flex items-center gap-1.5 flex-wrap overflow-x-auto scrollbar-slim",
        className
      )}
    >
      {tabs
        .filter((t) => t.visible)
        .map((t) => {
          const isActive = active === t.key;
          const count = counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 h-8 min-h-[32px] rounded-md text-[12px] transition shrink-0",
                isActive
                  ? "bg-[color:var(--surface-3)] text-[color:var(--content)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--content)] hover:bg-[color:var(--surface-2)]"
              )}
            >
              <t.Icon size={12} strokeWidth={2} />
              <span>{t.label}</span>
              {count > 0 && t.key !== "all" ? (
                <span
                  className="mono text-[10px]"
                  style={{
                    color: isActive ? "var(--coral)" : "var(--subtle)",
                  }}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
    </div>
  );
}
