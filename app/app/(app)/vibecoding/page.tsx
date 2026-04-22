import Link from "next/link";
import {
  BookOpen,
  MessagesSquare,
  ScrollText,
  ChefHat,
  Radar as RadarIcon,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/core/auth";
import {
  getCurrentVibecodingLevel,
  listVibecodingHistory,
} from "@/lib/domains/vibecoding/placement-repo";
import { MODES } from "@/lib/domains/vibecoding/fixtures";
import { LEVEL_LABEL, LEVEL_HINT, type VibecodingMode } from "@/lib/domains/vibecoding/types";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  BookOpen,
  MessagesSquare,
  ScrollText,
  ChefHat,
  Radar: RadarIcon,
  Target,
};

export default async function VibecodingPage() {
  const user = await requireAuth();
  const [level, history] = await Promise.all([
    getCurrentVibecodingLevel(user.userId),
    listVibecodingHistory(user.userId, 1),
  ]);

  if (!level) {
    return (
      <>
        <TopBar breadcrumb={[{ label: "Вайбкодинг", active: true }]} />
        <NoLevelState />
      </>
    );
  }

  const lastAttempt = history[0];

  return (
    <>
      <TopBar breadcrumb={[{ label: "Вайбкодинг", active: true }]} />

      <section className="px-4 md:px-6 py-6">
        <div
          className="text-[11px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // vibecoding · <span style={{ color: "var(--coral)" }}>{LEVEL_LABEL[level]}</span>
        </div>

        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight leading-tight">
            Вайбкодинг{" "}
            <span
              className="serif-italic text-[28px] md:text-[32px]"
              style={{ color: "var(--amber)" }}
            >
              ежедневно
            </span>
          </h1>
          <Link href="/vibecoding/placement">
            <Button variant="ghost" size="sm">
              Пересдать placement
            </Button>
          </Link>
        </div>

        <p className="text-sm mb-6 max-w-2xl" style={{ color: "var(--muted)" }}>
          Шесть режимов под твой уровень{" "}
          <span style={{ color: "var(--content)" }}>{LEVEL_LABEL[level]}</span>
          {lastAttempt ? (
            <>
              {" "}
              <span className="mono" style={{ color: "var(--subtle)" }}>
                (confidence {Math.round(lastAttempt.confidence * 100)}%)
              </span>
            </>
          ) : null}
          . Тьютор подстраивается под {LEVEL_HINT[level]}.
        </p>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {MODES.map((mode) => (
            <ModeCard key={mode.id} mode={mode.id} />
          ))}
        </div>
      </section>
    </>
  );
}

function ModeCard({ mode }: { mode: VibecodingMode }) {
  const meta = MODES.find((m) => m.id === mode)!;
  const Icon = ICONS[meta.Icon] ?? BookOpen;
  const accentBg =
    meta.accent === "coral"
      ? "var(--coral-soft)"
      : meta.accent === "violet"
        ? "var(--violet-soft)"
        : meta.accent === "amber"
          ? "rgba(251, 191, 36, 0.12)"
          : "var(--surface-2)";
  const accentColor =
    meta.accent === "coral"
      ? "var(--coral)"
      : meta.accent === "violet"
        ? "#c084fc"
        : meta.accent === "amber"
          ? "var(--amber)"
          : "var(--muted)";

  return (
    <Link href={`/vibecoding/${mode}`}>
      <Card
        hover
        glow={meta.hero}
        className={cn(
          "p-5 h-full flex flex-col gap-3 group transition",
          meta.hero && "glow-ring"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: meta.hero ? "var(--gradient-hot)" : accentBg,
              color: meta.hero ? "white" : accentColor,
            }}
          >
            <Icon size={18} strokeWidth={1.9} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[15px] font-semibold">{meta.title}</div>
              {meta.hero ? (
                <Chip tone="coral" mono>
                  recommended
                </Chip>
              ) : meta.accent !== "neutral" ? (
                <Chip
                  tone={
                    meta.accent === "coral"
                      ? "coral"
                      : meta.accent === "violet"
                        ? "violet"
                        : "amber"
                  }
                  mono
                >
                  {meta.accent}
                </Chip>
              ) : null}
            </div>
            <div
              className="text-[12.5px] mt-0.5"
              style={{ color: "var(--muted)" }}
            >
              {meta.subtitle}
            </div>
          </div>
        </div>

        <p className="text-[12.5px] flex-1" style={{ color: "var(--muted)" }}>
          {meta.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span
            className="text-[11px] mono"
            style={{ color: "var(--subtle)" }}
          >
            ещё не открывал
          </span>
          <span
            className="flex items-center gap-1 text-[12px] font-medium transition group-hover:gap-1.5"
            style={{ color: "var(--coral)" }}
          >
            открыть
            <ArrowRight size={12} strokeWidth={2} />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function NoLevelState() {
  return (
    <section className="px-4 md:px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div
          className="text-[11px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // vibecoding · <span style={{ color: "var(--coral)" }}>first-run</span>
        </div>
        <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight leading-tight mb-2">
          Определи{" "}
          <span
            className="serif-italic text-[28px] md:text-[32px]"
            style={{ color: "var(--amber)" }}
          >
            уровень
          </span>
          {" "}и поехали
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          Тьютор работает по шкале newbie / practitioner / architect /
          maintainer и подстраивает глубину ответов, сложность квестов и
          уровень критики. Сначала — placement, потом 6 режимов и авто-roadmap
          в разделе «Прокачка навыков».
        </p>

        <Link href="/vibecoding/placement">
          <Card
            glow
            className="card-glow glow-ring p-6 cursor-pointer flex items-start gap-4 transition hover:scale-[1.01]"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "var(--gradient-hot)",
                boxShadow: "0 4px 20px -6px rgba(249,112,102,0.5)",
              }}
            >
              <Sparkles size={26} strokeWidth={2} color="white" />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold mb-1">
                Пройти vibecoding placement
              </div>
              <p
                className="text-[12.5px] leading-relaxed mb-3"
                style={{ color: "var(--muted)" }}
              >
                15 вопросов про Claude Code, AI SDK, MCP и агент-паттерны.
                Выдаст уровень, confidence и сразу создаст skill tree под него.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip mono>15 items</Chip>
                <Chip mono>~7 min</Chip>
                <Chip tone="coral" mono>
                  auto skill tree
                </Chip>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
}
