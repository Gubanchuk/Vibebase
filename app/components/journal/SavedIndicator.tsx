"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved";

export function SavedIndicator({
  status,
  savedAt,
  className,
}: {
  status: SaveStatus;
  savedAt?: string | null;
  className?: string;
}) {
  const [, forceTick] = React.useReducer((n: number) => n + 1, 0);

  // Re-render once per ~15s so "saved 14s ago" stays roughly fresh.
  React.useEffect(() => {
    if (status !== "saved") return;
    const id = window.setInterval(forceTick, 15_000);
    return () => window.clearInterval(id);
  }, [status]);

  let label = "";
  let dotColor = "var(--subtle)";

  if (status === "dirty") {
    label = "● draft";
    dotColor = "var(--amber)";
  } else if (status === "saving") {
    label = "● saving…";
    dotColor = "var(--coral)";
  } else if (status === "saved" && savedAt) {
    label = `✓ saved ${formatAgo(savedAt)}`;
    dotColor = "var(--success)";
  } else if (status === "saved") {
    label = "✓ saved";
    dotColor = "var(--success)";
  }

  if (!label) return null;

  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1.5 text-[11.5px] px-2 py-1 rounded-md",
        className
      )}
      style={{
        color: "var(--muted)",
        background: "var(--surface-2)",
        border: "1px solid var(--border-2)",
      }}
    >
      <span
        style={{ color: dotColor, fontSize: 10, lineHeight: 1 }}
        aria-hidden
      >
        {label.startsWith("●") || label.startsWith("✓") ? "" : ""}
      </span>
      {label}
    </span>
  );
}

function formatAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
