import Link from "next/link";
import { Flame, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type {
  LearningDomain,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import type { StreakState } from "@/lib/domains/streak/repo";

export function DailyFocus({
  streak,
  recommended,
}: {
  streak: StreakState;
  recommended: Array<{
    domain: LearningDomain;
    domainLabel: string;
    accent: "coral" | "violet";
    topic: TopicWithUserState | null;
  }>;
}) {
  const activeRecommendations = recommended.filter((r) => r.topic !== null);
  if (activeRecommendations.length === 0) return null;

  const daysLabel =
    streak.current === 0
      ? "Начни серию сегодня"
      : streak.activeToday
        ? `${streak.current} дн. подряд · сегодня уже активен`
        : `${streak.current} дн. подряд · сегодня ещё нужен один шаг`;

  return (
    <Card
      className="p-4 md:p-5 mb-6"
      style={{
        borderColor: "rgba(255, 107, 71, 0.35)",
        background:
          "linear-gradient(135deg, rgba(255, 107, 71, 0.07), transparent 60%)",
      }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Chip tone="coral" mono>
          <Flame size={10} strokeWidth={2} />
          {daysLabel}
        </Chip>
        {streak.best > streak.current ? (
          <Chip tone="amber" mono>
            рекорд: {streak.best}
          </Chip>
        ) : null}
        <Chip mono>
          <Sparkles size={10} strokeWidth={2} />
          фокус дня
        </Chip>
      </div>

      <div className="grid gap-2.5 grid-cols-1 md:grid-cols-2">
        {activeRecommendations.map((r) => {
          const t = r.topic!;
          return (
            <Link
              key={r.domain}
              href={`/learn/${r.domain}/${t.slug}`}
              className="block"
            >
              <Card
                hover
                className="p-3 h-full flex items-center gap-3"
                style={{
                  borderColor:
                    r.accent === "coral"
                      ? "rgba(255, 107, 71, 0.25)"
                      : "rgba(192, 132, 252, 0.25)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background:
                      r.accent === "coral"
                        ? "var(--coral-soft)"
                        : "var(--violet-soft)",
                    color:
                      r.accent === "coral" ? "var(--coral)" : "#c084fc",
                  }}
                >
                  <ArrowRight size={14} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] mono uppercase tracking-wider"
                    style={{
                      color:
                        r.accent === "coral" ? "var(--coral)" : "#c084fc",
                    }}
                  >
                    {r.domainLabel}
                  </div>
                  <div className="text-[13.5px] font-semibold truncate">
                    {t.title}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
