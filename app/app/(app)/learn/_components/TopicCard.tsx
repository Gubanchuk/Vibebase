import Link from "next/link";
import { Lock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type {
  LearningDomain,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import { masteryStateOf } from "@/lib/domains/learning/types";
import { BookmarkButton } from "./BookmarkButton";
import { NotesSheet } from "./NotesSheet";

export function TopicCard({
  domain,
  topic,
  index,
  topicsBySlug,
  compact = false,
}: {
  domain: LearningDomain;
  topic: TopicWithUserState;
  index: number;
  topicsBySlug: ReadonlyMap<string, TopicWithUserState>;
  compact?: boolean;
}) {
  const state = masteryStateOf(topic.mastery);
  const locked = !topic.isUnlocked && state === "new";

  const haloColor =
    state === "mastered"
      ? "var(--success)"
      : state === "in-progress"
        ? "var(--amber)"
        : "var(--border)";

  const importanceWidth = `${topic.importance * 20}%`;

  const stripBg =
    topic.importance >= 4
      ? "var(--gradient-hot)"
      : topic.importance === 3
        ? "var(--amber)"
        : "var(--border)";

  const glow =
    topic.importance === 5
      ? { boxShadow: "0 0 22px -6px var(--coral-soft)" }
      : {};

  const prereqNames = topic.prerequisites
    .map((slug) => topicsBySlug.get(slug)?.title)
    .filter((s): s is string => Boolean(s));
  const prereqVisible = prereqNames.slice(0, 2);
  const prereqExtra = Math.max(0, prereqNames.length - prereqVisible.length);

  return (
    <Card
      hover
      className="p-3.5 md:p-4 h-full flex flex-col gap-2 relative transition"
      style={{
        borderColor:
          state === "mastered" ? "rgba(74, 222, 128, 0.45)" : undefined,
        opacity: locked ? 0.72 : compact ? 0.9 : 1,
        ...glow,
      }}
    >
      {/* Full-card link: кликабельна вся карточка, кроме интерактивных элементов выше z. */}
      <Link
        href={`/learn/${domain}/${topic.slug}`}
        aria-label={topic.title}
        className="absolute inset-0 rounded-[inherit] z-0"
      />

      {/* Importance strip слева (над Link'ом визуально, но не перехватывает клики) */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full pointer-events-none z-[1]"
        style={{ background: stripBg }}
      />

      <div className="flex items-center gap-2 mb-1 pl-1 relative z-[2]">
        <span
          className="mono text-[10px] pointer-events-none"
          style={{ color: "var(--subtle)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {topic.importance === 5 ? (
          <Chip tone="coral" mono>
            must
          </Chip>
        ) : topic.importance === 4 ? (
          <Chip tone="amber" mono>
            hot
          </Chip>
        ) : null}

        {state === "mastered" ? (
          <Chip tone="success" mono>
            ✓ освоено
          </Chip>
        ) : state === "in-progress" ? (
          <Chip tone="amber" mono>
            в процессе
          </Chip>
        ) : null}

        {locked ? (
          <span
            className="inline-flex items-center gap-1 text-[10px] mono"
            style={{ color: "var(--subtle)" }}
            title="Открывается после prerequisites"
          >
            <Lock size={10} strokeWidth={2} />
            locked
          </span>
        ) : null}

        <span
          className="ml-auto flex items-center gap-0.5 pointer-events-none"
          aria-hidden
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="inline-block w-1 h-1 rounded-full"
              style={{
                background:
                  i < topic.importance ? "var(--coral)" : "var(--border-2)",
              }}
            />
          ))}
        </span>

        <BookmarkButton
          topicId={topic.id}
          initial={topic.annotation?.isBookmarked ?? false}
          className="relative z-[3]"
        />
      </div>

      <h3 className="text-[14.5px] font-semibold leading-snug pl-1 pointer-events-none relative z-[1]">
        {topic.title}
      </h3>
      <p
        className="text-[12px] leading-relaxed pl-1 flex-1 pointer-events-none relative z-[1]"
        style={{
          color: "var(--muted)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {topic.summary}
      </p>

      <div className="flex items-center gap-1.5 flex-wrap pl-1 pt-1 relative z-[1] pointer-events-none">
        {topic.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="chip mono text-[9.5px]"
            style={{ padding: "1px 6px" }}
          >
            {tag}
          </span>
        ))}
        {topic.levelMin ? (
          <span
            className="chip chip-violet mono text-[9.5px]"
            style={{ padding: "1px 6px" }}
          >
            {topic.levelMin}
            {topic.levelMax && topic.levelMax !== topic.levelMin
              ? `–${topic.levelMax}`
              : ""}
          </span>
        ) : null}
        {topic.popularity > 0 ? (
          <span
            className="chip mono text-[9.5px] inline-flex items-center gap-0.5"
            style={{ padding: "1px 6px", color: "var(--amber)" }}
            title={`${topic.popularity} упоминаний в ресёрче`}
          >
            <Star size={9} strokeWidth={2} fill="currentColor" />
            {topic.popularity}
          </span>
        ) : null}
      </div>

      {prereqVisible.length > 0 ? (
        <div
          className="flex items-center gap-1.5 flex-wrap pl-1 text-[10.5px] relative z-[1] pointer-events-none"
          style={{ color: "var(--subtle)" }}
        >
          <span className="mono uppercase tracking-wider">после:</span>
          {prereqVisible.map((name) => (
            <span
              key={name}
              className="chip mono text-[9.5px]"
              style={{ padding: "1px 6px" }}
            >
              {name}
            </span>
          ))}
          {prereqExtra > 0 ? (
            <span
              className="mono text-[10px]"
              style={{ color: "var(--subtle)" }}
            >
              +{prereqExtra}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Footer с notes-триггером и progress halo */}
      <div className="flex items-center gap-2 mt-1 relative z-[2]">
        <NotesSheet
          topicId={topic.id}
          topicTitle={topic.title}
          initial={topic.annotation?.personalNotes ?? ""}
        />
        <div
          className="flex-1 h-[2px] rounded-full pointer-events-none"
          style={{
            background: haloColor,
            opacity: state === "new" ? 0.25 : 1,
            width: importanceWidth,
            maxWidth: importanceWidth,
          }}
          aria-hidden
        />
      </div>
    </Card>
  );
}
