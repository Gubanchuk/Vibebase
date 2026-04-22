"use client";

import { Search } from "lucide-react";
import { useCommand } from "./CommandPalette";
import { Button } from "@/components/ui/button";

export function TopBar({
  breadcrumb,
  streaming,
}: {
  breadcrumb: Array<{ label: string; active?: boolean }>;
  streaming?: { label: string };
}) {
  const { open } = useCommand();
  return (
    <header
      className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3 border-b"
      style={{
        background: "rgba(10,10,10,0.82)",
        backdropFilter: "blur(14px)",
        borderColor: "var(--border-2)",
      }}
    >
      {/* flex-1 min-w-0 lets the breadcrumb row actually shrink; without min-w-0 long labels push the row wider than the viewport */}
      <div
        className="flex-1 min-w-0 flex items-center gap-1.5 text-[12px] overflow-hidden"
        style={{ color: "var(--muted)" }}
      >
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 ? <span className="shrink-0" style={{ color: "var(--subtle)" }}>/</span> : null}
            <span
              className="truncate"
              style={{ color: b.active ? "var(--content)" : undefined }}
            >
              {b.label}
            </span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {streaming ? (
          <span className="chip chip-coral mono max-w-[40vw] md:max-w-none truncate">
            <span className="stream-dot shrink-0" />
            <span className="truncate">{streaming.label}</span>
          </span>
        ) : null}
        <Button variant="ghost" onClick={open} className="hidden md:inline-flex">
          <Search size={14} strokeWidth={1.9} />
          Поиск
          <span className="kbd ml-1">⌘K</span>
        </Button>
        {/* Mobile: icon-only button, enforce 44×44 tap target */}
        <Button
          variant="ghost"
          onClick={open}
          className="md:hidden min-w-11 min-h-11 justify-center"
          aria-label="Open command palette"
        >
          <Search size={16} strokeWidth={1.9} />
        </Button>
      </div>
    </header>
  );
}
