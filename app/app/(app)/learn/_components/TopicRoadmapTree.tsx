"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Sparkles,
  Lock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  LearningDomain,
  Stage,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import { masteryStateOf } from "@/lib/domains/learning/types";
import { STAGE_META, STAGE_ORDER } from "@/lib/domains/learning/roadmap";
import { BookmarkButton } from "./BookmarkButton";
import { NotesSheet } from "./NotesSheet";

/**
 * Компактный tree-view по стейджам (Foundation → Core → Advanced → Optional).
 * Визуально зеркалит RoadmapTree из /skills/[slug]: expand/collapse, чекбокс-индикатор,
 * inline status chips. Отличия: вместо skill_nodes/skill_lessons работает
 * с curriculum_topics (TopicWithUserState).
 */

export function TopicRoadmapTree({
  domain,
  topics,
  accent,
}: {
  domain: LearningDomain;
  topics: TopicWithUserState[];
  accent: "coral" | "violet";
}) {
  // Дефолт: открыты все стейджи кроме optional
  const [expanded, setExpanded] = React.useState<Set<Stage>>(() => {
    const s = new Set<Stage>();
    for (const stage of STAGE_ORDER) {
      if (stage !== "optional") s.add(stage);
    }
    return s;
  });

  const toggle = (stage: Stage) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  const byStage = React.useMemo(() => {
    const m = new Map<Stage, TopicWithUserState[]>();
    for (const stage of STAGE_ORDER) m.set(stage, []);
    for (const t of topics) m.get(t.stage)!.push(t);
    return m;
  }, [topics]);

  const totalMastered = topics.filter((t) => t.mastery?.masteredAt).length;

  return (
    <div className="card p-3 md:p-4">
      <div
        className="flex items-center gap-2 mb-3 pb-3 border-b"
        style={{ borderColor: "var(--border-2)" }}
      >
        <span
          className="text-[10px] mono uppercase tracking-wider"
          style={{
            color: accent === "coral" ? "var(--coral)" : "#c084fc",
          }}
        >
          //{" "}
          {domain === "english" ? "english" : "vibecoding"}
          {" "}— roadmap
        </span>
        <span className="flex-1" />
        <span
          className="text-[10.5px] mono"
          style={{ color: "var(--subtle)" }}
        >
          {totalMastered}/{topics.length} освоено
        </span>
      </div>

      <div className="space-y-1">
        {STAGE_ORDER.map((stage) => {
          const stageTopics = byStage.get(stage) ?? [];
          if (stageTopics.length === 0) return null;
          return (
            <StageRow
              key={stage}
              stage={stage}
              topics={stageTopics}
              isOpen={expanded.has(stage)}
              onToggle={() => toggle(stage)}
              domain={domain}
              accent={accent}
            />
          );
        })}
      </div>
    </div>
  );
}

function StageRow({
  stage,
  topics,
  isOpen,
  onToggle,
  domain,
  accent,
}: {
  stage: Stage;
  topics: TopicWithUserState[];
  isOpen: boolean;
  onToggle: () => void;
  domain: LearningDomain;
  accent: "coral" | "violet";
}) {
  const meta = STAGE_META[stage];
  const masteredCount = topics.filter((t) => t.mastery?.masteredAt).length;
  const isComplete = masteredCount === topics.length;
  const ratio = topics.length > 0 ? masteredCount / topics.length : 0;

  const stageColor =
    meta.accent === "coral"
      ? "var(--coral)"
      : meta.accent === "amber"
        ? "var(--amber)"
        : meta.accent === "violet"
          ? "#c084fc"
          : "var(--subtle)";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full group flex items-center gap-2 py-2 pl-1 pr-2 rounded-md",
          "transition hover:bg-[color:var(--surface-2)] text-left"
        )}
      >
        <ChevronRight
          size={13}
          strokeWidth={2}
          className={cn(
            "shrink-0 transition-transform",
            isOpen && "rotate-90"
          )}
          style={{ color: "var(--muted)" }}
        />

        <span
          className="w-4 h-4 rounded flex items-center justify-center shrink-0 border"
          style={{
            background: isComplete
              ? "var(--success)"
              : ratio > 0
                ? "var(--surface-2)"
                : "transparent",
            borderColor: isComplete ? "transparent" : "var(--border)",
          }}
          aria-hidden
        >
          {isComplete ? (
            <Check size={10} strokeWidth={3} color="#0a0a0a" />
          ) : ratio > 0 ? (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: stageColor,
                boxShadow: `0 0 6px ${stageColor}`,
              }}
            />
          ) : null}
        </span>

        <span
          className="text-[13.5px] font-semibold"
          style={{ color: stageColor }}
        >
          {meta.label}
        </span>
        <span
          className="hidden sm:inline text-[11px]"
          style={{ color: "var(--subtle)" }}
        >
          · {meta.hint}
        </span>

        <span className="flex-1" />

        <DotProgress total={topics.length} done={masteredCount} />
        <span
          className="mono text-[11px]"
          style={{
            color: isComplete
              ? "var(--success)"
              : ratio > 0
                ? stageColor
                : "var(--subtle)",
          }}
        >
          {masteredCount}/{topics.length}
        </span>
      </button>

      {isOpen ? (
        <div className="relative pl-4 ml-2">
          <div
            className="absolute left-0 top-0 bottom-2 w-px"
            style={{ background: "var(--border-2)" }}
          />
          {topics.map((t) => (
            <TopicLeafRow
              key={t.id}
              topic={t}
              domain={domain}
              accent={accent}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TopicLeafRow({
  topic,
  domain,
  accent,
}: {
  topic: TopicWithUserState;
  domain: LearningDomain;
  accent: "coral" | "violet";
}) {
  const state = masteryStateOf(topic.mastery);
  const locked = !topic.isUnlocked && state === "new";
  const isBookmarked = topic.annotation?.isBookmarked ?? false;
  const hasNotes = (topic.annotation?.personalNotes ?? "").length > 0;
  const accentColor = accent === "coral" ? "var(--coral)" : "#c084fc";

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 py-1.5 pl-2 pr-1 rounded-md",
        "transition hover:bg-[color:var(--surface-2)]"
      )}
      style={{ opacity: locked ? 0.68 : 1 }}
    >
      {/* tree-branch connector */}
      <span
        className="absolute left-0 top-1/2 w-3 h-px"
        style={{ background: "var(--border-2)" }}
        aria-hidden
      />

      {/* Status indicator */}
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
        style={{
          background:
            state === "mastered"
              ? "var(--success)"
              : state === "in-progress"
                ? "var(--amber-soft, rgba(251, 191, 36, 0.15))"
                : "transparent",
          border:
            state === "new"
              ? "1px solid var(--border)"
              : state === "in-progress"
                ? `1px solid var(--amber)`
                : "none",
        }}
        aria-hidden
      >
        {state === "mastered" ? (
          <Check size={9} strokeWidth={3} color="#0a0a0a" />
        ) : state === "in-progress" ? (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--amber)" }}
          />
        ) : locked ? (
          <Lock size={9} strokeWidth={2} style={{ color: "var(--subtle)" }} />
        ) : null}
      </span>

      {/* Title (wrapped in Link) */}
      <Link
        href={`/learn/${domain}/${topic.slug}`}
        className="flex-1 min-w-0 flex items-center gap-2 py-0.5"
      >
        <span
          className="text-[13px] truncate"
          style={{
            color:
              state === "mastered" || state === "in-progress"
                ? "var(--content)"
                : "var(--muted)",
          }}
        >
          {topic.title}
        </span>

        {topic.importance === 5 ? (
          <span
            className="hidden md:inline chip chip-coral mono text-[9px]"
            style={{ padding: "0px 5px" }}
            title="Must-have"
          >
            must
          </span>
        ) : topic.importance === 4 ? (
          <span
            className="hidden md:inline chip chip-amber mono text-[9px]"
            style={{ padding: "0px 5px" }}
            title="Hot"
          >
            hot
          </span>
        ) : null}

        {topic.levelMin ? (
          <span
            className="hidden sm:inline chip chip-violet mono text-[9px]"
            style={{ padding: "0px 5px" }}
          >
            {topic.levelMin}
            {topic.levelMax && topic.levelMax !== topic.levelMin
              ? `–${topic.levelMax}`
              : ""}
          </span>
        ) : null}

        {topic.popularity > 0 ? (
          <span
            className="hidden lg:inline-flex items-center gap-0.5 text-[10px] mono"
            style={{ color: "var(--subtle)" }}
            title={`${topic.popularity} упоминаний`}
          >
            <Star size={9} strokeWidth={2} style={{ color: "var(--amber)" }} />
            {topic.popularity}
          </span>
        ) : null}
      </Link>

      {/* Trailing status chip */}
      {state === "mastered" ? (
        <span
          className="hidden sm:inline text-[10px] mono"
          style={{ color: "var(--success)" }}
        >
          ✓ done
        </span>
      ) : state === "in-progress" ? (
        <Link
          href={`/learn/${domain}/${topic.slug}`}
          className="chip chip-amber mono text-[10px]"
          style={{ padding: "1px 6px" }}
        >
          continue
        </Link>
      ) : locked ? (
        <span
          className="hidden sm:inline text-[10px] mono"
          style={{ color: "var(--subtle)" }}
        >
          locked
        </span>
      ) : (
        <Link
          href={`/learn/${domain}/${topic.slug}`}
          className={cn(
            "chip mono text-[10px] flex items-center gap-1",
            accent === "coral" ? "chip-coral" : "chip-violet"
          )}
          style={{ padding: "1px 6px" }}
        >
          <Sparkles size={9} strokeWidth={2} />
          generate
        </Link>
      )}

      {/* Annotation buttons — visible on hover for desktop, always on mobile */}
      <div
        className={cn(
          "flex items-center gap-0.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition",
          (isBookmarked || hasNotes) && "md:opacity-100"
        )}
      >
        <BookmarkButton
          topicId={topic.id}
          initial={isBookmarked}
        />
        <NotesSheet
          topicId={topic.id}
          topicTitle={topic.title}
          initial={topic.annotation?.personalNotes ?? ""}
        />
      </div>

      {/* accent-indicator дотс */}
      {state === "new" && !locked ? (
        <span
          className="hidden xl:inline-block w-1 h-1 rounded-full"
          style={{
            background: accentColor,
            opacity: topic.importance / 5,
          }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function DotProgress({ total, done }: { total: number; done: number }) {
  const dots = 5;
  const filled = total === 0 ? 0 : Math.round((done / total) * dots);
  return (
    <span
      className="hidden sm:flex items-center gap-[3px]"
      aria-label={`${done} of ${total} done`}
    >
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{
            background: i < filled ? "var(--coral)" : "var(--border-2)",
          }}
        />
      ))}
    </span>
  );
}
