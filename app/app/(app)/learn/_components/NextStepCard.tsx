import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type {
  LearningDomain,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import { STAGE_META } from "@/lib/domains/learning/roadmap";

export function NextStepCard({
  domain,
  topic,
  accent,
}: {
  domain: LearningDomain;
  topic: TopicWithUserState;
  accent: "coral" | "violet";
}) {
  const stageMeta = STAGE_META[topic.stage];
  const inProgress = topic.mastery && !topic.mastery.masteredAt;

  return (
    <Link href={`/learn/${domain}/${topic.slug}`} className="block mb-4">
      <Card
        hover
        className="p-4 md:p-5 relative overflow-hidden"
        style={{
          borderColor:
            accent === "coral"
              ? "rgba(255, 107, 71, 0.4)"
              : "rgba(192, 132, 252, 0.4)",
          background:
            accent === "coral"
              ? "linear-gradient(135deg, rgba(255, 107, 71, 0.08), transparent 55%)"
              : "linear-gradient(135deg, rgba(192, 132, 252, 0.08), transparent 55%)",
        }}
      >
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Chip tone={accent === "coral" ? "coral" : "violet"} mono>
            <Sparkles size={10} strokeWidth={2} />
            следующий шаг
          </Chip>
          <Chip mono>{stageMeta.label.toLowerCase()}</Chip>
          {inProgress ? (
            <Chip tone="amber" mono>
              продолжить
            </Chip>
          ) : null}
          {topic.importance === 5 ? (
            <Chip tone="coral" mono>
              must
            </Chip>
          ) : topic.importance === 4 ? (
            <Chip tone="amber" mono>
              hot
            </Chip>
          ) : null}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] md:text-[20px] font-bold tracking-tight leading-tight mb-1">
              {topic.title}
            </h3>
            <p
              className="text-[13px] leading-relaxed"
              style={{
                color: "var(--muted)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {topic.summary}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              {topic.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="chip mono text-[10px]"
                  style={{ padding: "1px 7px" }}
                >
                  {tag}
                </span>
              ))}
              {topic.levelMin ? (
                <span
                  className="chip chip-violet mono text-[10px]"
                  style={{ padding: "1px 7px" }}
                >
                  {topic.levelMin}
                  {topic.levelMax && topic.levelMax !== topic.levelMin
                    ? `–${topic.levelMax}`
                    : ""}
                </span>
              ) : null}
            </div>
          </div>
          <div
            className="shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
            style={{
              background:
                accent === "coral" ? "var(--coral-soft)" : "var(--violet-soft)",
              color: accent === "coral" ? "var(--coral)" : "#c084fc",
            }}
          >
            <ArrowRight size={18} strokeWidth={2} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
