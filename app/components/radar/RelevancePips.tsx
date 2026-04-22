import { cn } from "@/lib/cn";
import type { Relevance } from "@/lib/domains/radar/schema";

/**
 * Three dots representing relevance. "strong" fills three coral pips with a glow;
 * "moderate" fills two amber pips; "weak" fills one muted pip.
 */
export function RelevancePips({
  relevance,
  className,
}: {
  relevance: Relevance;
  className?: string;
}) {
  const filled =
    relevance === "strong" ? 3 : relevance === "moderate" ? 2 : 1;

  const color =
    relevance === "strong"
      ? "var(--coral)"
      : relevance === "moderate"
        ? "var(--amber)"
        : "var(--muted)";

  const glow =
    relevance === "strong"
      ? "0 0 6px rgba(249, 112, 102, 0.55)"
      : relevance === "moderate"
        ? "0 0 5px rgba(251, 191, 36, 0.4)"
        : "none";

  return (
    <div
      className={cn("inline-flex items-center gap-[3px]", className)}
      aria-label={`relevance: ${relevance}`}
      title={`relevance: ${relevance}`}
    >
      {[0, 1, 2].map((i) => {
        const on = i < filled;
        return (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: on ? color : "var(--border)",
              boxShadow: on ? glow : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
