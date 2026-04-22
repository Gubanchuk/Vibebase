import Link from "next/link";
import {
  Play,
  TrendingUp,
  Layers3,
  Radar as RadarIcon,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  Clock,
  Flame,
} from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { requireAuth } from "@/lib/core/auth";
import { listRecent, sumCostToday, sumCostMonth } from "@/lib/core/usage-repo";
import { budgetStatus } from "@/lib/core/budget-guard";
import {
  getCurrentLevel,
  listPlacementHistory,
} from "@/lib/domains/english/placement-repo";
import { getStreak } from "@/lib/domains/streak/repo";
import { listUserSkills } from "@/lib/domains/skills/repo";
import { listTopicsWithUserState } from "@/lib/domains/learning/repo";
import { pickNextStep } from "@/lib/domains/learning/roadmap";
import { getSeedRadarItems } from "@/lib/domains/radar/fixtures";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();
  const [
    recent,
    today,
    month,
    status,
    level,
    placementHistory,
    streak,
    skills,
    englishTopics,
    vibecodingTopics,
  ] = await Promise.all([
    listRecent(user.userId, 6),
    sumCostToday(user.userId),
    sumCostMonth(user.userId),
    budgetStatus(user.userId),
    getCurrentLevel(user.userId),
    listPlacementHistory(user.userId, 2),
    getStreak(user.userId),
    listUserSkills(user.userId),
    listTopicsWithUserState(user.userId, "english"),
    listTopicsWithUserState(user.userId, "vibecoding"),
  ]);

  const streakMilestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = streakMilestones.find((m) => m > streak.current) ?? null;

  const prev = placementHistory[1]?.level;
  const current = placementHistory[0]?.level ?? level;
  const levelDisplay = !current
    ? "—"
    : prev && prev !== current
      ? `${prev} → ${current}`
      : current;
  const hasLevel = !!current;

  // Реальные счётчики вместо хардкода
  const activeSkills = skills.filter((s) => s.archivedAt === null);
  const allLessons = activeSkills.flatMap((s) => s.lessons);
  const allProgress = activeSkills.flatMap((s) => s.progress);
  const lessonsDone = allProgress.filter((p) => p.completedAt !== null).length;
  const lessonsTotal = allLessons.length;

  // Радар — пока seed fixtures; считаем «свежих» как последние 7 дней
  const radarItems = getSeedRadarItems();
  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  const freshRadar = radarItems.filter(
    (r) =>
      r.publishedAt &&
      Date.parse(r.publishedAt) > sevenDaysAgo
  ).length;
  const lastSyncAgo = radarItems[0]?.publishedAt
    ? relTime(Date.parse(radarItems[0].publishedAt))
    : "—";

  // Рекомендации следующего шага
  const nextEnglish = pickNextStep(englishTopics);
  const nextVibecoding = pickNextStep(vibecodingTopics);
  const primaryNext = nextEnglish ?? nextVibecoding;
  const primaryNextDomain = nextEnglish ? "english" : "vibecoding";

  const heroCta = primaryNext
    ? {
        href: `/learn/${primaryNextDomain}/${primaryNext.slug}`,
        label: "Продолжить урок",
        hint: primaryNext.title,
      }
    : hasLevel
      ? { href: "/english/lesson", label: "Открыть тьютор", hint: null }
      : {
          href: "/english/placement",
          label: "Пройти placement",
          hint: null,
        };

  const skillsHint =
    activeSkills.length === 0
      ? "создай первый навык"
      : lessonsTotal === 0
        ? `${activeSkills.length} активных · уроков пока нет`
        : `${lessonsDone}/${lessonsTotal} уроков · генерируй ещё`;

  return (
    <>
      <TopBar breadcrumb={[{ label: "Дашборд", active: true }]} />

      {/* HERO */}
      <section
        className="p-4 md:p-6 border-b"
        style={{ borderColor: "var(--border-2)" }}
      >
        <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
          <div>
            <div
              className="text-[11px] mono uppercase tracking-wider mb-2"
              style={{ color: "var(--subtle)" }}
            >
              // dashboard ·{" "}
              <span style={{ color: "var(--coral)" }}>week 4</span>
            </div>
            <h1 className="text-[22px] md:text-[30px] font-bold tracking-tight leading-tight break-words">
              С возвращением,{" "}
              <span
                className="serif-italic text-[26px] md:text-[34px]"
                style={{ color: "var(--amber)" }}
              >
                {user.displayName}
              </span>
              .
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {hasLevel ? (
                <>
                  Твой уровень —{" "}
                  <span className="gradient-text font-semibold">{current}</span>
                  . Продолжим там, где остановились.
                </>
              ) : (
                <>
                  Ещё не проходил{" "}
                  <Link
                    href="/english/placement"
                    className="gradient-text font-semibold underline underline-offset-2"
                  >
                    placement-тест
                  </Link>{" "}
                  — начни с него, чтобы уроки подстроились под уровень.
                </>
              )}
            </p>
          </div>
          <Link href={heroCta.href}>
            <Button variant="primary" size="lg">
              <Play size={14} fill="currentColor" />
              {heroCta.label}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            href={hasLevel ? "/skills" : "/english/placement"}
            label="Английский"
            accent="coral"
          >
            <div className="text-xl font-bold mono gradient-text">
              {levelDisplay}
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              {hasLevel
                ? `попыток placement: ${placementHistory.length}`
                : "пройди placement → получишь уровень"}
            </div>
          </StatCard>

          <StatCard
            href="/skills"
            label="Навыки"
            accent="violet"
            Icon={Layers3}
          >
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-bold">{activeSkills.length}</div>
              <div
                className="text-[11px] mono"
                style={{ color: "var(--subtle)" }}
              >
                активных
              </div>
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              {skillsHint}
            </div>
          </StatCard>

          <StatCard
            href="/radar"
            label="Радар"
            accent="amber"
            Icon={RadarIcon}
          >
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-bold">{radarItems.length}</div>
              {freshRadar > 0 ? (
                <Chip tone="success" mono>
                  +{freshRadar} за 7 дн
                </Chip>
              ) : null}
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              последний item {lastSyncAgo}
            </div>
          </StatCard>

          <StatCard
            href="/settings/usage"
            label="Бюджет AI"
            accent="custom"
            CustomIcon={
              <ProgressRing
                value={Math.min(1, status.monthRatio)}
                size={22}
                stroke={2.5}
              />
            }
          >
            <div className="text-xl font-bold mono">
              ${month.toFixed(2)}
              <span
                className="text-[12px] font-normal"
                style={{ color: "var(--subtle)" }}
              >
                /{status.monthlyCap.toFixed(0)}
              </span>
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              сегодня ${today.toFixed(2)} · лимит $
              {status.dailyCap.toFixed(0)}
            </div>
          </StatCard>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section
        className="p-4 md:p-6 border-b"
        style={{ borderColor: "var(--border-2)" }}
      >
        <div
          className="text-[11px] mono uppercase tracking-wider mb-3"
          style={{ color: "var(--subtle)" }}
        >
          // quick start
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nextEnglish ? (
            <QuickAction
              href={`/learn/english/${nextEnglish.slug}`}
              title={nextEnglish.title}
              subtitle={`English · следующий шаг${nextEnglish.mastery ? " · продолжить" : ""}`}
              hint="LEARN · next"
              Icon={Sparkles}
              primary
            />
          ) : (
            <QuickAction
              href="/english/lesson"
              title="Personal Lesson"
              subtitle="чат-тьютор, свободная практика"
              hint="ENGLISH · chat"
              Icon={Sparkles}
              primary
            />
          )}
          {nextVibecoding ? (
            <QuickAction
              href={`/learn/vibecoding/${nextVibecoding.slug}`}
              title={nextVibecoding.title}
              subtitle={`Vibecoding · следующий шаг${nextVibecoding.mastery ? " · продолжить" : ""}`}
              hint="LEARN · next"
              Icon={Flame}
            />
          ) : (
            <QuickAction
              href="/journal/new"
              title="Записать мысль"
              subtitle="Daily Reflection template"
              hint="JOURNAL"
              Icon={BookOpen}
            />
          )}
          <QuickAction
            href="/radar"
            title="Свежий радар"
            subtitle={
              freshRadar > 0
                ? `${freshRadar} новых на этой неделе`
                : `${radarItems.length} items всего`
            }
            hint={`RADAR · ${lastSyncAgo}`}
            Icon={RadarIcon}
          />
        </div>
      </section>

      {/* RECENT AI CALLS */}
      <section className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-[11px] mono uppercase tracking-wider"
            style={{ color: "var(--subtle)" }}
          >
            // recent ai activity
          </div>
          <Link
            href="/settings/usage"
            className="inline-flex items-center gap-1 text-[12px]"
            style={{ color: "var(--muted)" }}
          >
            все вызовы <ArrowUpRight size={11} strokeWidth={2} />
          </Link>
        </div>
        <Link
          href="/settings/usage"
          className="block"
          aria-label="Открыть историю использования"
        >
          <Card
            hover
            className="divide-y overflow-x-auto scrollbar-slim"
            style={{ borderColor: "var(--border-2)" }}
          >
            {recent.length === 0 ? (
              <div
                className="px-4 py-4 text-[12.5px]"
                style={{ color: "var(--subtle)" }}
              >
                Пока нет вызовов. Запусти урок или чат — появятся здесь.
              </div>
            ) : (
              recent.map((r) => (
                <div
                  key={r.id}
                  className="px-4 py-2.5 flex items-center gap-3 text-[12.5px] min-w-[520px]"
                  style={{ borderColor: "var(--border-2)" }}
                >
                  <Chip
                    tone={r.model.includes("haiku") ? "violet" : "coral"}
                    mono
                  >
                    {r.model.split("/").pop()?.replace("claude-", "")}
                  </Chip>
                  <span
                    className="mono truncate"
                    style={{ color: "var(--muted)" }}
                  >
                    {r.domain}
                  </span>
                  <span
                    className="ml-auto flex items-center gap-3 mono text-[11px] shrink-0"
                    style={{ color: "var(--subtle)" }}
                  >
                    <span>
                      {r.tokensIn}↑ {r.tokensOut}↓
                    </span>
                    <span style={{ color: "var(--content)" }}>
                      ${r.costUsd.toFixed(4)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />{" "}
                      {new Date(r.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                </div>
              ))
            )}
          </Card>
        </Link>

        <Link
          href="/learn"
          className="mt-6 inline-flex items-center gap-2 text-[11px] hover:text-[color:var(--content)] transition"
          style={{ color: "var(--subtle)" }}
        >
          <TrendingUp size={12} />
          <span className="mono">
            streak · <span style={{ color: "var(--coral)" }}>{streak.current}</span> дн.
            {streak.best > streak.current ? (
              <>
                {" · рекорд "}
                <span style={{ color: "var(--amber)" }}>{streak.best}</span>
              </>
            ) : null}
            {nextMilestone ? (
              <>
                {" · до "}
                <span style={{ color: "var(--amber)" }}>{nextMilestone}</span>
                {" осталось "}
                {nextMilestone - streak.current}
              </>
            ) : null}
            {streak.current > 0 && !streak.activeToday ? (
              <span style={{ color: "var(--coral)" }}>
                {" · сегодня ещё не активен"}
              </span>
            ) : null}
          </span>
        </Link>
      </section>
    </>
  );
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

function StatCard({
  href,
  label,
  accent,
  Icon,
  CustomIcon,
  children,
}: {
  href: string;
  label: string;
  accent: "coral" | "violet" | "amber" | "custom";
  Icon?: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: React.CSSProperties;
  }>;
  CustomIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const iconColor =
    accent === "coral"
      ? "var(--coral)"
      : accent === "violet"
        ? "var(--violet)"
        : accent === "amber"
          ? "var(--amber)"
          : undefined;

  return (
    <Link href={href} className="block group">
      <Card hover className="p-4 transition">
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-[10px] mono uppercase tracking-wider"
            style={{ color: "var(--subtle)" }}
          >
            {label}
          </div>
          {CustomIcon ? (
            CustomIcon
          ) : Icon ? (
            <Icon size={13} strokeWidth={1.8} style={{ color: iconColor }} />
          ) : (
            <ArrowUpRight
              size={13}
              strokeWidth={1.8}
              style={{ color: iconColor ?? "var(--coral)" }}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          )}
        </div>
        {children}
      </Card>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  subtitle,
  hint,
  Icon,
  primary,
}: {
  href: string;
  title: string;
  subtitle: string;
  hint: string;
  Icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: React.CSSProperties;
  }>;
  primary?: boolean;
}) {
  return (
    <Link href={href}>
      <Card
        hover
        glow={primary}
        className={`p-4 group transition ${primary ? "card-glow glow-ring" : ""}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{
              background: primary ? "var(--gradient-hot)" : "var(--surface-2)",
              border: primary ? "none" : "1px solid var(--border)",
            }}
          >
            <Icon
              size={16}
              strokeWidth={1.9}
              style={{ color: primary ? "white" : "var(--coral)" }}
            />
          </div>
          <span
            className="text-[10px] mono uppercase tracking-wider"
            style={{ color: "var(--subtle)" }}
          >
            {hint}
          </span>
        </div>
        <div className="text-[15px] font-semibold line-clamp-1">{title}</div>
        <div
          className="text-[12.5px] mt-1 line-clamp-1"
          style={{ color: "var(--muted)" }}
        >
          {subtitle}
        </div>
      </Card>
    </Link>
  );
}
