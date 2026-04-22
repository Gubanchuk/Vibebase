"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

const KEY_PREFIX = "skills:lesson-completed:";

function readInitial(lessonId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY_PREFIX + lessonId) === "1";
  } catch {
    return false;
  }
}

export function MarkCompleteButton({
  lessonId,
  initialComplete = false,
}: {
  lessonId: string;
  /** Fixture state, used as a fallback if localStorage is empty. */
  initialComplete?: boolean;
}) {
  const [hydrated, setHydrated] = React.useState(false);
  const [complete, setComplete] = React.useState(initialComplete);

  // Hydrate from localStorage on mount so SSR output stays stable.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(KEY_PREFIX + lessonId);
    if (stored === "1") setComplete(true);
    else if (stored === "0") setComplete(false);
    setHydrated(true);
  }, [lessonId]);

  const toggle = () => {
    setComplete((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(KEY_PREFIX + lessonId, next ? "1" : "0");
      } catch {
        /* quota — not fatal */
      }
      return next;
    });
  };

  return (
    <div className="sticky top-16 z-20 flex justify-end pointer-events-none">
      <button
        type="button"
        onClick={toggle}
        disabled={!hydrated}
        aria-pressed={complete}
        className={cn(
          "pointer-events-auto btn",
          complete ? "btn-primary" : "btn-secondary",
          "shadow-lg"
        )}
        style={
          complete
            ? undefined
            : {
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }
        }
      >
        {complete ? (
          <>
            <Check size={14} strokeWidth={2.4} />
            Completed
          </>
        ) : (
          <>
            <Circle size={14} strokeWidth={2} />
            Mark complete
          </>
        )}
      </button>
    </div>
  );
}
