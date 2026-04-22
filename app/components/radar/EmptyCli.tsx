"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const CMD = 'claude "/autoresearch autoresearch/prompts/weekly-radar.md"';

/**
 * Empty-state card shown when filters exclude every item.
 * Invites the user to run the local autoresearch loop.
 */
export function EmptyCli() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — silently ignore; the user can select the text manually.
    }
  }

  return (
    <div className="card p-6 md:p-8 max-w-xl mx-auto text-center">
      <div
        className="inline-flex items-center justify-center mb-3 rounded-md border"
        style={{
          width: 40,
          height: 40,
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--muted)",
        }}
        aria-hidden
      >
        <Terminal size={18} strokeWidth={1.8} />
      </div>
      <h3 className="text-[17px] font-semibold mb-1">
        Ничего не найдено
      </h3>
      <p
        className="text-[13px] mb-4"
        style={{ color: "var(--muted)" }}
      >
        Попробуй ослабить фильтры или запусти ресёрч:
      </p>

      <div
        className="flex items-center gap-2 rounded-md border p-3 text-left"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border-2)",
        }}
      >
        <span
          className="mono text-[11px] shrink-0"
          style={{ color: "var(--coral)" }}
        >
          $
        </span>
        <code
          className="mono text-[12px] flex-1 overflow-x-auto scrollbar-slim whitespace-nowrap"
          style={{ color: "var(--content)" }}
        >
          {CMD}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          aria-label="Copy command"
          className="shrink-0"
        >
          {copied ? (
            <>
              <Check size={13} strokeWidth={2} />
              скопировано
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={1.8} />
              копировать
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
