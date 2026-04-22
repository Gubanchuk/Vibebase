import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { sourceMetaOf, type RadarItemView } from "@/lib/domains/radar/types";
import { SourceIcon } from "./SourceIcon";
import { RelevancePips } from "./RelevancePips";

/**
 * Pure visual card for a single radar item. Server-safe — no hooks, no state.
 * Клик по карточке открывает internal detail page с полным русским саммари,
 * а не внешнюю ссылку. Источник указан в футере карточки для прозрачности.
 */
export function RadarItemCard({ item }: { item: RadarItemView }) {
  const meta = sourceMetaOf(item.source);
  const ago = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
    locale: ru,
  });
  const isStrong = item.relevance === "strong";
  const host = new URL(item.url).hostname.replace(/^www\./, "");

  return (
    <Link
      href={`/radar/${item.id}`}
      className={cn(
        "card card-hover group relative block p-4 no-underline h-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
        isStrong && "hover:card-glow"
      )}
      style={{ color: "var(--content)" }}
    >
      {/* Header: source icon + label + relevance pips */}
      <div className="flex items-center gap-2 mb-2">
        <SourceIcon source={item.source} size={22} />
        <span
          className="mono text-[11px] truncate"
          style={{ color: "var(--muted)" }}
        >
          {meta.label}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <RelevancePips relevance={item.relevance} />
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold leading-snug mb-1.5">
        {item.title}
      </h3>

      {/* TLDR — clamped to 3 lines */}
      <p
        className="text-[13px] leading-relaxed mb-3"
        style={{
          color: "var(--muted)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item.tldr}
      </p>

      {/* Tags + date */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {item.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="chip chip-violet mono">
            {tag}
          </span>
        ))}
        <span
          className="mono text-[11px] ml-auto shrink-0"
          style={{ color: "var(--subtle)" }}
        >
          {ago}
        </span>
      </div>

      {/* Footer — «читать саммари» с подсказкой, откуда взята инфа */}
      <div
        className="mt-3 pt-2.5 border-t flex items-center gap-1.5 text-[11px] mono"
        style={{ borderColor: "var(--border-2)" }}
      >
        <span style={{ color: "var(--subtle)" }}>по материалам</span>
        <span className="truncate" style={{ color: "var(--muted)" }}>
          {host}
        </span>
        <span
          className="ml-auto shrink-0 flex items-center gap-1 group-hover:gap-1.5 transition-all"
          style={{ color: "var(--coral)" }}
        >
          читать
          <ArrowRight size={12} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
