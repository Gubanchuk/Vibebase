import { Chip } from "@/components/ui/chip";
import type {
  LearningDomain,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import { DomainTopicsBoard } from "./DomainTopicsBoard";

export function DomainRoadmap({
  domain,
  title,
  subtitle,
  Icon,
  accent,
  topics,
  userLevel,
}: {
  domain: LearningDomain;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  accent: "coral" | "violet";
  topics: TopicWithUserState[];
  userLevel: string | null;
}) {
  const mastered = topics.filter((t) => t.mastery?.masteredAt).length;
  const inProgress = topics.filter(
    (t) => t.mastery && !t.mastery.masteredAt
  ).length;
  const pct = topics.length > 0 ? Math.round((mastered / topics.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{
              background:
                accent === "coral" ? "var(--coral-soft)" : "var(--violet-soft)",
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
          <div className="flex items-center gap-2 flex-wrap">
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

      <DomainTopicsBoard
        domain={domain}
        accent={accent}
        topics={topics}
        userLevel={userLevel}
      />
    </div>
  );
}
