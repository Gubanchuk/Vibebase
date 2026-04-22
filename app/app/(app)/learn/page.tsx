import { GraduationCap, Zap, Languages } from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { Card } from "@/components/ui/card";
import { requireAuth } from "@/lib/core/auth";
import { listTopicsWithUserState } from "@/lib/domains/learning/repo";
import { pickNextStep } from "@/lib/domains/learning/roadmap";
import { getCurrentLevel as getEnglishLevel } from "@/lib/domains/english/placement-repo";
import { getCurrentVibecodingLevel } from "@/lib/domains/vibecoding/placement-repo";
import { getStreak } from "@/lib/domains/streak/repo";
import { CuratorRunner } from "./curator-runner";
import { DomainRoadmap } from "./_components/DomainRoadmap";
import { DailyFocus } from "./_components/DailyFocus";
import type { LearningDomain } from "@/lib/domains/learning/types";

export const dynamic = "force-dynamic";

export default async function LearnIndexPage() {
  const user = await requireAuth();
  const [english, vibecoding, englishLevel, vibecodingLevel, streak] =
    await Promise.all([
      listTopicsWithUserState(user.userId, "english"),
      listTopicsWithUserState(user.userId, "vibecoding"),
      getEnglishLevel(user.userId),
      getCurrentVibecodingLevel(user.userId),
      getStreak(user.userId),
    ]);

  const dailyRecommended = [
    {
      domain: "english" as LearningDomain,
      domainLabel: "English",
      accent: "coral" as const,
      topic: pickNextStep(english),
    },
    {
      domain: "vibecoding" as LearningDomain,
      domainLabel: "Vibecoding",
      accent: "violet" as const,
      topic: pickNextStep(vibecoding),
    },
  ];

  return (
    <>
      <TopBar breadcrumb={[{ label: "Учёба", active: true }]} />

      <section className="px-4 md:px-6 md:px-8 py-5 md:py-6">
        <div
          className="text-[11px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // learn ·{" "}
          <span style={{ color: "var(--coral)" }}>roadmap</span>
        </div>
        <h1 className="text-[22px] md:text-[30px] font-bold tracking-tight leading-tight mb-1">
          Твой{" "}
          <span
            className="serif-italic text-[24px] md:text-[32px]"
            style={{ color: "var(--amber)" }}
          >
            курс
          </span>
        </h1>
        <p
          className="text-sm mb-6 max-w-2xl"
          style={{ color: "var(--muted)" }}
        >
          Темы разложены по стейджам — Фундамент, Ядро, Продвинутое — и отранжированы
          по важности. Сверху каждого домена — «следующий шаг»: конкретная тема,
          с которой стоит продолжить прямо сейчас.
        </p>

        <DailyFocus streak={streak} recommended={dailyRecommended} />

        <div className="space-y-10">
          {english.length === 0 ? (
            <EmptyDomain domain="english" />
          ) : (
            <DomainRoadmap
              domain="english"
              title="Английский"
              subtitle="CEFR-прогрессия + Russian-L1 акценты"
              Icon={Languages}
              accent="coral"
              topics={english}
              userLevel={englishLevel}
            />
          )}
          {vibecoding.length === 0 ? (
            <EmptyDomain domain="vibecoding" />
          ) : (
            <DomainRoadmap
              domain="vibecoding"
              title="Vibecoding"
              subtitle="Claude Code · AI SDK · MCP · агент-паттерны"
              Icon={Zap}
              accent="violet"
              topics={vibecoding}
              userLevel={vibecodingLevel}
            />
          )}
        </div>
      </section>
    </>
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
