import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";

import { TopBar } from "@/components/shell/TopBar";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { SourceIcon } from "@/components/radar/SourceIcon";
import { RelevancePips } from "@/components/radar/RelevancePips";
import { getRadarItemById } from "@/lib/domains/radar/fixtures";
import { sourceMetaOf } from "@/lib/domains/radar/types";

export default async function RadarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getRadarItemById(id);
  if (!item) notFound();

  const meta = sourceMetaOf(item.source);
  const ago = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
    locale: ru,
  });
  const pubDate = format(new Date(item.publishedAt), "d MMMM yyyy", { locale: ru });
  const host = new URL(item.url).hostname.replace(/^www\./, "");

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Радар" },
          { label: item.title, active: true },
        ]}
      />

      <article className="px-4 md:px-6 py-6 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/radar"
          className="inline-flex items-center gap-1.5 text-[12px] transition mb-5"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={12} strokeWidth={2} />
          Назад к радару
        </Link>

        {/* Source + relevance row */}
        <div className="flex items-center gap-3 mb-4">
          <SourceIcon source={item.source} size={28} />
          <div className="flex-1 min-w-0">
            <div
              className="text-[11px] mono uppercase tracking-wider"
              style={{ color: "var(--subtle)" }}
            >
              {meta.label}
            </div>
            <div className="text-[12px] mono" style={{ color: "var(--muted)" }}>
              {pubDate} · {ago}
            </div>
          </div>
          <RelevancePips relevance={item.relevance} />
          <Chip
            tone={
              item.relevance === "strong"
                ? "coral"
                : item.relevance === "moderate"
                  ? "amber"
                  : "neutral"
            }
            mono
          >
            {item.relevance}
          </Chip>
        </div>

        {/* Title */}
        <h1 className="text-[22px] md:text-[32px] font-bold tracking-tight leading-tight mb-3 break-words">
          {item.title}
        </h1>

        {/* TL;DR blockquote */}
        <div
          className="mb-6 p-4 rounded-lg border-l-2"
          style={{
            borderLeftColor: "var(--coral)",
            background: "var(--surface-2)",
          }}
        >
          <div
            className="text-[10px] mono uppercase tracking-wider mb-1.5"
            style={{ color: "var(--coral)" }}
          >
            TL;DR
          </div>
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: "var(--content)" }}
          >
            {item.tldr}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {item.tags.map((tag) => (
            <Link key={tag} href={`/radar?tags=${encodeURIComponent(tag)}`}>
              <span className="chip chip-violet mono cursor-pointer hover:opacity-80">
                {tag}
              </span>
            </Link>
          ))}
        </div>

        {/* Full summary (Russian) */}
        <div className="prose-md break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {item.summaryMd}
          </ReactMarkdown>
        </div>

        {/* Debrief CTA — уводит в vibecoding chat с prefilled контекстом */}
        <Card
          className="mt-8 p-4 flex items-center gap-3"
          style={{
            background: "var(--violet-soft)",
            borderColor: "rgba(168, 85, 247, 0.3)",
          }}
        >
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--surface-2)", color: "#c084fc" }}
          >
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold">
              Обсудить с тьютором
            </div>
            <div
              className="text-[11.5px]"
              style={{ color: "var(--muted)" }}
            >
              Vibecoding debrief: переведём прочитанное в 2-4 действия на неделю
            </div>
          </div>
          <Link href={`/vibecoding/debrief?radar=${item.id}`}>
            <span className="btn btn-secondary btn-sm shrink-0">
              Разобрать
              <ArrowUpRight size={12} strokeWidth={2} />
            </span>
          </Link>
        </Card>

        {/* Source link footer — "хочешь подробнее — вот источник" */}
        <Card className="mt-10 p-5 flex items-start gap-4">
          <SourceIcon source={item.source} size={32} />
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] mono uppercase tracking-wider mb-1"
              style={{ color: "var(--subtle)" }}
            >
              // источник
            </div>
            <div className="text-[14px] font-semibold mb-1">
              Хочешь подробнее — читай оригинал
            </div>
            <div
              className="text-[12px] mono mb-3 truncate"
              style={{ color: "var(--muted)" }}
            >
              {host}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <ExternalLink size={13} strokeWidth={2} />
              Открыть источник
              <ArrowUpRight size={13} strokeWidth={2} />
            </a>
          </div>
        </Card>
      </article>
    </>
  );
}
