import Link from "next/link";
import { ArrowUpRight, Award, RotateCw, Sparkles, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type HistoryPoint = { level: string; answeredAt: string; confidence?: number };

/**
 * Карточка достижения по домену с плейсментом. Рендерит
 * ступенчатый прогресс по всем уровням шкалы — даже при одной попытке
 * выглядит наглядно (в отличие от sparkline с 1 точкой).
 */
export function LanguageProficiencyCard({
  title,
  subtitle,
  emoji,
  accent,
  currentLevel,
  history,
  retakeHref,
  retakeLabel,
  levelScale,
  roadmapHref,
  roadmapLabel,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  accent: "coral" | "violet";
  currentLevel: string | null;
  history: HistoryPoint[];
  retakeHref: string;
  retakeLabel: string;
  levelScale: string[];
  /** Куда ведёт основной CTA «открыть курс» (roadmap по домену). */
  roadmapHref?: string;
  roadmapLabel?: string;
}) {
  const accentColor = accent === "coral" ? "var(--coral)" : "#c084fc";
  const accentSoft =
    accent === "coral" ? "var(--coral-soft)" : "var(--violet-soft)";

  // ── Пустое состояние — ещё не прошёл плейсмент ──────────────────────
  if (!currentLevel) {
    return (
      <Card
        hover
        className="p-4 md:p-5 relative overflow-hidden"
        style={{
          borderStyle: "dashed",
          borderColor:
            accent === "coral"
              ? "rgba(255, 107, 71, 0.35)"
              : "rgba(192, 132, 252, 0.35)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center text-[26px] shrink-0"
            style={{ background: "var(--surface-2)" }}
          >
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[14px] font-semibold">{title}</span>
              <Chip mono>нет уровня</Chip>
            </div>
            <div
              className="text-[12px] leading-relaxed mb-3"
              style={{ color: "var(--muted)" }}
            >
              Пройди адаптивный плейсмент — 10 минут, уровень определится
              автоматически.
            </div>
            <Link href={retakeHref}>
              <Button variant="primary" size="sm">
                <Sparkles size={12} strokeWidth={2} />
                {retakeLabel}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // ── Карта уровня: ordinal + best-ever + latest ──────────────────────
  const ordMap = new Map(levelScale.map((lv, i) => [lv.toLowerCase(), i]));
  const ordOf = (lv: string) =>
    ordMap.get(lv.toLowerCase()) ?? Math.floor(levelScale.length / 2);

  const currentOrd = ordOf(currentLevel);
  const bestOrd = history.reduce((m, h) => Math.max(m, ordOf(h.level)), currentOrd);
  const totalSteps = levelScale.length;
  const progressPct = Math.round(((currentOrd + 1) / totalSteps) * 100);
  const latestConfidence = history[0]?.confidence;
  const attemptsCount = history.length;
  const prevAttemptLevel = history[1]?.level ?? null;
  const progressed =
    prevAttemptLevel && ordOf(prevAttemptLevel) < currentOrd;
  const regressed =
    prevAttemptLevel && ordOf(prevAttemptLevel) > currentOrd;

  const nextLevel =
    currentOrd < totalSteps - 1 ? levelScale[currentOrd + 1] : null;

  return (
    <Card
      className="p-4 md:p-5 relative overflow-hidden"
      style={{
        borderColor:
          accent === "coral"
            ? "rgba(255, 107, 71, 0.35)"
            : "rgba(192, 132, 252, 0.35)",
        background: `linear-gradient(135deg, ${accentSoft} 0%, transparent 55%)`,
      }}
    >
      {/* Header: emoji + title + current level */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center text-[26px] shrink-0"
          style={{
            background: accentSoft,
            boxShadow: `0 0 24px -8px ${accentColor}`,
          }}
        >
          {emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[15px] font-semibold">{title}</span>
            <Chip tone={accent === "coral" ? "coral" : "violet"} mono>
              <Award size={10} strokeWidth={2} />
              {currentLevel}
            </Chip>
            {progressed ? (
              <Chip tone="success" mono>
                ↑ {prevAttemptLevel} → {currentLevel}
              </Chip>
            ) : regressed ? (
              <Chip tone="amber" mono>
                ↓ {prevAttemptLevel} → {currentLevel}
              </Chip>
            ) : null}
          </div>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* Step ladder — горизонтальный прогресс по всем уровням шкалы */}
      <div className="mb-3">
        <div className="flex items-center gap-1 flex-wrap">
          {levelScale.map((lv, i) => {
            const isCurrent = i === currentOrd;
            const isPassed = i < currentOrd;
            const isBest = i === bestOrd && bestOrd > currentOrd;

            return (
              <StepPill
                key={lv}
                label={lv}
                state={
                  isCurrent
                    ? "current"
                    : isPassed
                      ? "passed"
                      : isBest
                        ? "best"
                        : "future"
                }
                accent={accent}
              />
            );
          })}
        </div>
      </div>

      {/* Meta row — ступень / confidence / next */}
      <div
        className="flex items-center gap-3 flex-wrap text-[11px]"
        style={{ color: "var(--subtle)" }}
      >
        <span className="mono">
          ступень{" "}
          <span style={{ color: accentColor }}>{currentOrd + 1}</span>
          <span style={{ color: "var(--subtle)" }}>/{totalSteps}</span>
          {" · "}
          <span style={{ color: "var(--muted)" }}>{progressPct}%</span>
        </span>
        {typeof latestConfidence === "number" && latestConfidence > 0 ? (
          <span className="mono">
            conf{" "}
            <span style={{ color: "var(--muted)" }}>
              {Math.round(latestConfidence * 100)}%
            </span>
          </span>
        ) : null}
        {attemptsCount > 0 ? (
          <span className="mono">
            {attemptsCount} поп.
            {bestOrd > currentOrd ? (
              <span style={{ color: "var(--amber)" }}>
                {" · пик "}
                {levelScale[bestOrd]}
              </span>
            ) : null}
          </span>
        ) : null}
        {nextLevel ? (
          <span className="mono ml-auto">
            дальше → <span style={{ color: accentColor }}>{nextLevel}</span>
          </span>
        ) : (
          <span className="mono ml-auto" style={{ color: "var(--amber)" }}>
            🏆 топ достигнут
          </span>
        )}
      </div>

      {/* CTA */}
      <div
        className="mt-4 pt-3 border-t flex items-center gap-2 flex-wrap"
        style={{ borderColor: "var(--border-2)" }}
      >
        {roadmapHref ? (
          <Link href={roadmapHref}>
            <Button variant="primary" size="sm">
              <BookOpen size={12} strokeWidth={2} />
              {roadmapLabel ?? "открыть курс"}
            </Button>
          </Link>
        ) : null}
        <Link
          href={retakeHref}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] transition hover:bg-[color:var(--surface-2)]"
          style={{ color: "var(--muted)" }}
        >
          <RotateCw size={12} strokeWidth={2} />
          {retakeLabel}
          <ArrowUpRight
            size={11}
            strokeWidth={2}
            style={{ color: "var(--subtle)" }}
          />
        </Link>
      </div>
    </Card>
  );
}

function StepPill({
  label,
  state,
  accent,
}: {
  label: string;
  state: "current" | "passed" | "best" | "future";
  accent: "coral" | "violet";
}) {
  const accentColor = accent === "coral" ? "var(--coral)" : "#c084fc";
  const accentSoft =
    accent === "coral" ? "var(--coral-soft)" : "var(--violet-soft)";

  let style: React.CSSProperties = {};
  if (state === "current") {
    style = {
      background:
        accent === "coral"
          ? "var(--gradient-hot)"
          : "linear-gradient(135deg, #c084fc, #a855f7)",
      color: "white",
      fontWeight: 600,
      boxShadow: `0 0 14px -3px ${accentColor}`,
    };
  } else if (state === "passed") {
    style = {
      background: accentSoft,
      color: accentColor,
      borderColor: "transparent",
    };
  } else if (state === "best") {
    style = {
      background: "transparent",
      color: "var(--amber)",
      borderColor: "var(--amber)",
    };
  } else {
    style = {
      background: "transparent",
      color: "var(--subtle)",
      borderColor: "var(--border-2)",
    };
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 h-6 min-w-[32px] rounded mono text-[10.5px] border transition"
      )}
      style={style}
      title={
        state === "current"
          ? `Текущий уровень: ${label}`
          : state === "passed"
            ? `Пройдено: ${label}`
            : state === "best"
              ? `Был пик: ${label}`
              : `Не достигнут: ${label}`
      }
    >
      {label}
    </span>
  );
}

export const ENGLISH_LEVEL_SCALE = [
  "A1",
  "A2",
  "B1",
  "B1+",
  "B2",
  "C1",
  "C2",
];

export const VIBECODING_LEVEL_SCALE = [
  "newbie",
  "practitioner",
  "architect",
  "maintainer",
];
