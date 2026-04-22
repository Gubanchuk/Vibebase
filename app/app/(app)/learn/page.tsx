import Link from "next/link";
import { GraduationCap, Sparkles, Zap, Languages } from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { requireAuth } from "@/lib/core/auth";
import { listTopicsWithMastery } from "@/lib/domains/learning/repo";
import { CuratorRunner } from "./curator-runner";
import type {
  LearningDomain,
  TopicWithMastery,
} from "@/lib/domains/learning/types";
import { masteryStateOf } from "@/lib/domains/learning/types";

export const dynamic = "force-dynamic";

export default async function LearnIndexPage() {
  const user = await requireAuth();
  const [english, vibecoding] = await Promise.all([
    listTopicsWithMastery(user.userId, "english"),
    listTopicsWithMastery(user.userId, "vibecoding"),
  ]);

  return (
    <>
      <TopBar breadcrumb={[{ label: "Учёба", active: true }]} />

      <section className="px-4 md:px-6 py-6">
        <div
          className="text-[11px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // learn · <span style={{ color: "var(--coral)" }}>structured course</span>
        </div>
        <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight leading-tight mb-1">
          Твой{" "}
          <span
            className="serif-italic text-[28px] md:text-[32px]"
            style={{ color: "var(--amber)" }}
          >
            курс
          </span>
        </h1>
        <p
          className="text-sm mb-8 max-w-2xl"
          style={{ color: "var(--muted)" }}
        >
          Темы собраны из autoresearch-vault, проранжированы по важности и популярности,
          отсортированы в порядке обучения. Каждая тема — 15-минутный урок: идея,
          пример, упражнение, квиз. Прошёл квиз ≥2/3 + упражнение → тема освоена.
        </p>

        <div className="space-y-10">
          <DomainSection
            domain="english"
            title="Английский"
            subtitle="CEFR-прогрессия + Russian-L1 акценты"
            Icon={Languages}
            accent="coral"
            topics={english}
          />
          <DomainSection
            domain="vibecoding"
            title="Vibecoding"
            subtitle="Claude Code · AI SDK · MCP · агент-паттерны"
            Icon={Zap}
            accent="violet"
            topics={vibecoding}
          />
        </div>
      </section>
    </>
  );
}

function DomainSection({
  domain,
  title,
  subtitle,
  Icon,
  accent,
  topics,
}: {
  domain: LearningDomain;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  accent: "coral" | "violet";
  topics: TopicWithMastery[];
}) {
  const mastered = topics.filter((t) => t.mastery?.masteredAt).length;
  const inProgress = topics.filter(
    (t) => t.mastery && !t.mastery.masteredAt
  ).length;
  const pct = topics.length > 0 ? Math.round((mastered / topics.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: accent === "coral" ? "var(--coral-soft)" : "var(--violet-soft)",
              color: accent === "coral" ? "var(--coral)" : "#c084fc",
            }}
          >
            <Icon size={18} strokeWidth={1.9} />
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
            <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          </div>
        </div>

        {topics.length > 0 && (
          <div className="flex items-center gap-2">
            <Chip tone={accent === "coral" ? "coral" : "violet"} mono>
              {pct}% освоено
            </Chip>
            <Chip mono>
              {mastered}/{topics.length}
            </Chip>
            {inProgress > 0 ? (
              <Chip tone="amber" mono>
                {inProgress} в процессе
              </Chip>
            ) : null}
          </div>
        )}
      </div>

      {topics.length === 0 ? (
        <EmptyDomain domain={domain} />
      ) : (
        <TopicsGrid domain={domain} topics={topics} />
      )}
    </div>
  );
}

function TopicsGrid({
  domain,
  topics,
}: {
  domain: LearningDomain;
  topics: TopicWithMastery[];
}) {
  return (
    <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {topics.map((t, i) => (
        <TopicCard key={t.id} domain={domain} topic={t} index={i} />
      ))}
    </div>
  );
}

function TopicCard({
  domain,
  topic,
  index,
}: {
  domain: LearningDomain;
  topic: TopicWithMastery;
  index: number;
}) {
  const state = masteryStateOf(topic.mastery);

  const haloColor =
    state === "mastered"
      ? "var(--success)"
      : state === "in-progress"
        ? "var(--amber)"
        : "var(--border)";

  const importanceWidth = `${topic.importance * 20}%`;

  return (
    <Link href={`/learn/${domain}/${topic.slug}`}>
      <Card
        hover
        className="p-4 h-full flex flex-col gap-2 relative transition"
        style={{
          borderColor:
            state === "mastered"
              ? "rgba(74, 222, 128, 0.45)"
              : undefined,
        }}
      >
        {/* Importance strip на левой кромке */}
        <div
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
          style={{
            background:
              topic.importance >= 4
                ? "var(--gradient-hot)"
                : topic.importance === 3
                  ? "var(--amber)"
                  : "var(--border)",
          }}
        />

        <div className="flex items-center gap-2 mb-1 pl-1">
          <span
            className="mono text-[10px]"
            style={{ color: "var(--subtle)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {state === "mastered" ? (
            <Chip tone="success" mono>
              ✓ освоено
            </Chip>
          ) : state === "in-progress" ? (
            <Chip tone="amber" mono>
              в процессе
            </Chip>
          ) : null}
          <span className="ml-auto flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="inline-block w-1 h-1 rounded-full"
                style={{
                  background:
                    i < topic.importance ? "var(--coral)" : "var(--border-2)",
                }}
                aria-hidden
              />
            ))}
          </span>
        </div>

        <h3 className="text-[14.5px] font-semibold leading-snug pl-1">
          {topic.title}
        </h3>
        <p
          className="text-[12px] leading-relaxed pl-1 flex-1"
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

        <div className="flex items-center gap-1.5 flex-wrap pl-1 pt-1">
          {topic.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="chip mono text-[9.5px]"
              style={{
                padding: "1px 6px",
              }}
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
        </div>

        {/* Progress halo на bottom */}
        <div
          className="h-[2px] rounded-full mt-1"
          style={{
            background: haloColor,
            opacity: state === "new" ? 0.25 : 1,
            width: importanceWidth,
          }}
          aria-hidden
        />
      </Card>
    </Link>
  );
}

function EmptyDomain({ domain }: { domain: LearningDomain }) {
  return (
    <Card className="p-6 border-dashed">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: "var(--surface-2)",
            color: "var(--coral)",
          }}
        >
          <GraduationCap size={22} strokeWidth={1.9} />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold mb-1">
            План курса ещё не собран
          </div>
          <p
            className="text-[12.5px] leading-relaxed mb-4"
            style={{ color: "var(--muted)" }}
          >
            Curator-агент прочитает autoresearch-vault, кластеризует темы,
            проранжирует их по важности и popularity. Занимает ~30-60 секунд.
          </p>
          <CuratorRunner domain={domain} />
        </div>
      </div>
    </Card>
  );
}
