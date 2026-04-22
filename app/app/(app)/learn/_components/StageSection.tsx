import type {
  LearningDomain,
  Stage,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import { STAGE_META } from "@/lib/domains/learning/roadmap";
import { TopicCard } from "./TopicCard";

export function StageSection({
  stage,
  domain,
  topics,
  topicsBySlug,
  startIndex,
  defaultOpen = true,
}: {
  stage: Stage;
  domain: LearningDomain;
  topics: TopicWithUserState[];
  topicsBySlug: ReadonlyMap<string, TopicWithUserState>;
  startIndex: number;
  defaultOpen?: boolean;
}) {
  const meta = STAGE_META[stage];
  const masteredCount = topics.filter((t) => t.mastery?.masteredAt).length;

  if (topics.length === 0) return null;

  // Для optional-стейджа — <details>, остальное — всегда развёрнуто.
  const collapsible = stage === "optional";

  const HeaderRow = (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span
        className="text-[10px] mono uppercase tracking-wider"
        style={{
          color:
            meta.accent === "coral"
              ? "var(--coral)"
              : meta.accent === "amber"
                ? "var(--amber)"
                : meta.accent === "violet"
                  ? "#c084fc"
                  : "var(--subtle)",
        }}
      >
        //{" "}
        {stage === "foundation"
          ? "01"
          : stage === "core"
            ? "02"
            : stage === "advanced"
              ? "03"
              : "04"}{" "}
        · {meta.label}
      </span>
      <span
        className="text-[11px]"
        style={{ color: "var(--subtle)" }}
      >
        {meta.hint}
      </span>
      <span
        className="ml-auto text-[10.5px] mono"
        style={{ color: "var(--subtle)" }}
      >
        {masteredCount}/{topics.length}
      </span>
    </div>
  );

  const Grid = (
    <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mt-3">
      {topics.map((t, i) => (
        <TopicCard
          key={t.id}
          domain={domain}
          topic={t}
          index={startIndex + i}
          topicsBySlug={topicsBySlug}
          compact={stage === "optional"}
        />
      ))}
    </div>
  );

  if (collapsible) {
    return (
      <details
        open={defaultOpen}
        className="mt-5 group"
      >
        <summary className="cursor-pointer list-none">{HeaderRow}</summary>
        {Grid}
      </details>
    );
  }

  return (
    <div className="mt-5">
      {HeaderRow}
      {Grid}
    </div>
  );
}
