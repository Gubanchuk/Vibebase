"use client";

import { ChevronDown, Clock, Filter, Flame, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { sourceMetaOf } from "@/lib/domains/radar/types";

export type SortMode = "recent" | "relevance";

export function FilterBar({
  allTags,
  allSources,
  activeTags,
  activeSources,
  sort,
  onToggleTag,
  onToggleSource,
  onSort,
  onReset,
  counts,
}: {
  allTags: string[];
  allSources: string[];
  activeTags: Set<string>;
  activeSources: Set<string>;
  sort: SortMode;
  onToggleTag: (tag: string) => void;
  onToggleSource: (source: string) => void;
  onSort: (sort: SortMode) => void;
  onReset: () => void;
  counts: {
    total: number;
    filtered: number;
    byTag: Record<string, number>;
    bySource: Record<string, number>;
  };
}) {
  const hasActiveFilters = activeTags.size > 0 || activeSources.size > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Tag chip row */}
      <div className="flex items-start gap-2 flex-wrap">
        <span
          className="mono text-[11px] mt-1 shrink-0"
          style={{ color: "var(--subtle)" }}
        >
          # теги
        </span>
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {allTags.map((tag) => {
            const isActive = activeTags.has(tag);
            const count = counts.byTag[tag] ?? 0;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "chip mono transition-colors",
                  isActive ? "chip-violet" : "hover:text-[var(--content)]"
                )}
                aria-pressed={isActive}
              >
                {tag}
                <span
                  className="ml-0.5 opacity-60"
                  style={{ fontSize: "0.85em" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary row: source popover + sort + reset */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Filter size={13} strokeWidth={1.8} />
              источники
              {activeSources.size > 0 ? (
                <span className="chip chip-violet mono ml-1">
                  {activeSources.size}
                </span>
              ) : null}
              <ChevronDown size={12} strokeWidth={1.8} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="min-w-60 p-2">
            <div
              className="mono text-[10px] uppercase px-2 py-1 mb-1"
              style={{ color: "var(--subtle)" }}
            >
              // source filter
            </div>
            <div className="flex flex-col">
              {allSources.map((slug) => {
                const isActive = activeSources.has(slug);
                const meta = sourceMetaOf(slug);
                const count = counts.bySource[slug] ?? 0;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => onToggleSource(slug)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-left transition-colors",
                      isActive
                        ? "bg-[var(--surface-2)] text-[var(--content)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--content)]"
                    )}
                    aria-pressed={isActive}
                  >
                    <span
                      className="w-3 h-3 rounded-sm border shrink-0 inline-flex items-center justify-center"
                      style={{
                        borderColor: isActive
                          ? "var(--coral)"
                          : "var(--border)",
                        background: isActive
                          ? "var(--coral-soft)"
                          : "transparent",
                      }}
                    >
                      {isActive ? (
                        <span
                          className="w-1.5 h-1.5 rounded-[1px]"
                          style={{ background: "var(--coral)" }}
                        />
                      ) : null}
                    </span>
                    <span className="flex-1 truncate">{meta.label}</span>
                    <span
                      className="mono text-[10px] shrink-0"
                      style={{ color: "var(--subtle)" }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort toggle */}
        <div
          className="inline-flex rounded-md border p-0.5"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
          role="tablist"
          aria-label="sort mode"
        >
          <SortButton
            active={sort === "recent"}
            onClick={() => onSort("recent")}
            icon={<Clock size={12} strokeWidth={1.8} />}
            label="recent"
          />
          <SortButton
            active={sort === "relevance"}
            onClick={() => onSort("relevance")}
            icon={<Flame size={12} strokeWidth={1.8} />}
            label="relevance"
          />
        </div>

        <div className="flex-1" />

        <span
          className="mono text-[11px]"
          style={{ color: "var(--subtle)" }}
        >
          {counts.filtered}/{counts.total}
        </span>

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X size={12} strokeWidth={1.8} />
            сбросить
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "mono text-[11px] px-2 py-1 rounded-[4px] inline-flex items-center gap-1 transition-colors",
        active
          ? "bg-[var(--surface-3)] text-[var(--content)]"
          : "text-[var(--muted)] hover:text-[var(--content)]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
