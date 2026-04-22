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
      className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center gap-3 border-b"
      style={{
        background: "rgba(10,10,10,0.82)",
        backdropFilter: "blur(14px)",
        borderColor: "var(--border-2)",
      }}
    >
      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--muted)" }}>
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 ? <span style={{ color: "var(--subtle)" }}>/</span> : null}
            <span style={{ color: b.active ? "var(--content)" : undefined }}>{b.label}</span>
          </span>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {streaming ? (
          <span className="chip chip-coral mono">
            <span className="stream-dot" />
            {streaming.label}
          </span>
        ) : null}
        <Button variant="ghost" onClick={open} className="hidden md:inline-flex">
          <Search size={14} strokeWidth={1.9} />
          Поиск
          <span className="kbd ml-1">⌘K</span>
        </Button>
        <Button variant="ghost" onClick={open} className="md:hidden" aria-label="Open command palette">
          <Search size={15} strokeWidth={1.9} />
        </Button>
      </div>
    </header>
  );
}
