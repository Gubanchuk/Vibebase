"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import type { CEFRLevel, EnglishMode, ModeMeta } from "@/lib/domains/english/types";

interface Props {
  current: EnglishMode;
  level: CEFRLevel;
  modes: ModeMeta[];
}

/**
 * Thin bar that sits between the TopBar and the ChatSurface. Offers a
 * mode-switcher popover, a level chip, and a "new session" button.
 * Renders above the ChatSurface without affecting its internal scrolling.
 */
export function ChatHeader({ current, level, modes }: Props) {
  const currentMeta = modes.find((m) => m.id === current);
  return (
    <div
      className="px-4 md:px-8 py-2.5 flex items-center gap-2 border-b"
      style={{ borderColor: "var(--border-2)" }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "btn btn-ghost btn-sm",
              "inline-flex items-center gap-1.5"
            )}
            aria-label="Switch mode"
          >
            {currentMeta?.title ?? current}
            <ChevronsUpDown size={12} strokeWidth={1.9} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="min-w-56 p-1">
          <ul className="flex flex-col">
            {modes.map((m) => {
              const active = m.id === current;
              return (
                <li key={m.id}>
                  <Link
                    href={`/english/${m.id}`}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded text-[13px]",
                      active
                        ? "bg-[color:var(--surface-2)] text-[color:var(--content)]"
                        : "text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--content)]"
                    )}
                  >
                    <span className="flex-1">{m.title}</span>
                    {active ? (
                      <Check size={12} strokeWidth={2} color="var(--coral)" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <Chip tone="coral" className="mono">
        {level}
      </Chip>

      <div className="ml-auto">
        <Button variant="ghost" size="sm" aria-label="Start new session">
          <Plus size={12} strokeWidth={1.9} />
          Новая сессия
        </Button>
      </div>
    </div>
  );
}
