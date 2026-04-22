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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();
  const [recent, today, month, status, level, placementHistory] =
    await Promise.all([
      listRecent(user.userId, 6),
      sumCostToday(user.userId),
      sumCostMonth(user.userId),
      budgetStatus(user.userId),
      getCurrentLevel(user.userId),
      listPlacementHistory(user.userId, 2),
    ]);

  // Если есть 2+ попытки, покажем переход "B1 → B1+". Иначе один уровень или "—".
  const prev = placementHistory[1]?.level;
  const current = placementHistory[0]?.level ?? level;
  const levelDisplay = !current
    ? "—"
    : prev && prev !== current
      ? `${prev} → ${current}`
      : current;
  const hasLevel = !!current;

  return (
    <>
      <TopBar breadcrumb={[{ label: "Дашборд", active: true }]} />

      {/* HERO */}
      <section className="p-4 md:p-6 border-b" style={{ borderColor: "var(--border-2)" }}>
        <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
          <div>
            <div
              className="text-[11px] mono uppercase tracking-wider mb-2"
              style={{ color: "var(--subtle)" }}
            >
              // dashboard · <span style={{ color: "var(--coral)" }}>week 4</span>
            </div>
            <h1 className="text-[22px] md:text-[30px] font-bold tracking-tight leading-tight break-words">
              С возвращением,{" "}
              <span className="serif-italic text-[26px] md:text-[34px]" style={{ color: "var(--amber)" }}>
                {user.displayName}
              </span>
              .
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {hasLevel ? (
                <>
                  Твой уровень —{" "}
                  <span className="gradient-text font-semibold">{current}</span>.
                  Продолжим там, где остановились.
                </>
              ) : (
                <>
                  Ещё не проходил{" "}
                  <Link
                    href="/english/placement"
                    className="gradient-text font-semibold underline underline-offset-2"
                  >
                    placement-тест
                  </Link>
                  {" "}— начни с него, чтобы уроки подстроились под уровень.
                </>
              )}
            </p>
          </div>
          <Link href={hasLevel ? "/english/lesson" : "/english/placement"}>
            <Button variant="primary" size="lg">
              <Play size={14} fill="currentColor" />
              {hasLevel ? "Продолжить урок" : "Пройти placement"}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
                Английский
              </div>
              <ArrowUpRight size={13} style={{ color: "var(--coral)" }} strokeWidth={1.8} />
            </div>
            <div className="text-xl font-bold mono gradient-text">{levelDisplay}</div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              {hasLevel
                ? `попыток placement: ${placementHistory.length}`
                : "пройди placement чтобы определить"}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
                Навыки
              </div>
              <Layers3 size={13} style={{ color: "var(--violet)" }} strokeWidth={1.8} />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-bold">2</div>
              <div className="text-[11px] mono" style={{ color: "var(--subtle)" }}>активных</div>
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              7 уроков завершено · 22 ждут
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
                Радар
              </div>
              <RadarIcon size={13} style={{ color: "var(--amber)" }} strokeWidth={1.8} />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-bold">+14</div>
              <Chip tone="success" mono>свежее</Chip>
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              последний sync 2 ч назад
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
                Бюджет AI
              </div>
              <ProgressRing value={Math.min(1, status.monthRatio)} size={22} stroke={2.5} />
            </div>
            <div className="text-xl font-bold mono">
              ${month.toFixed(2)}
              <span className="text-[12px] font-normal" style={{ color: "var(--subtle)" }}>
                /{" "}
                {status.monthlyCap.toFixed(0)}
              </span>
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
              сегодня ${today.toFixed(2)} · лимит ${status.dailyCap.toFixed(0)}
            </div>
          </Card>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="p-4 md:p-6 border-b" style={{ borderColor: "var(--border-2)" }}>
        <div className="text-[11px] mono uppercase tracking-wider mb-3" style={{ color: "var(--subtle)" }}>
          // quick start
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickAction
            href="/english/lesson"
            title="Personal Lesson"
            subtitle="Past Perfect — 15 минут"
            hint="MODE 2 · hero"
            Icon={Sparkles}
            primary
          />
          <QuickAction
            href="/journal/new"
            title="Записать мысль"
            subtitle="Daily Reflection template"
            hint="JOURNAL"
            Icon={BookOpen}
          />
          <QuickAction
            href="/radar"
            title="Свежий радар"
            subtitle="14 новых на этой неделе"
            hint="RADAR · sync 2h ago"
            Icon={RadarIcon}
          />
        </div>
      </section>

      {/* RECENT AI CALLS */}
      <section className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] mono uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
            // recent ai activity
          </div>
          <Link href="/settings/usage" className="text-[12px]" style={{ color: "var(--muted)" }}>
            все вызовы →
          </Link>
        </div>
        <Card className="divide-y overflow-x-auto scrollbar-slim" style={{ borderColor: "var(--border-2)" }}>
          {recent.map((r) => (
            <div
              key={r.id}
              className="px-4 py-2.5 flex items-center gap-3 text-[12.5px] min-w-[520px]"
              style={{ borderColor: "var(--border-2)" }}
            >
              <Chip tone={r.model.includes("haiku") ? "violet" : "coral"} mono>
                {r.model.split("/").pop()?.replace("claude-", "")}
              </Chip>
              <span className="mono truncate" style={{ color: "var(--muted)" }}>
                {r.domain}
              </span>
              <span className="ml-auto flex items-center gap-3 mono text-[11px] shrink-0" style={{ color: "var(--subtle)" }}>
                <span>
                  {r.tokensIn}↑ {r.tokensOut}↓
                </span>
                <span style={{ color: "var(--content)" }}>${r.costUsd.toFixed(4)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} /> {new Date(r.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
            </div>
          ))}
        </Card>

        <div className="mt-6 flex items-center gap-2 text-[11px]" style={{ color: "var(--subtle)" }}>
          <TrendingUp size={12} />
          <span className="mono">
            streak · 7 days · next milestone at 10 days (<span style={{ color: "var(--amber)" }}>+badge</span>)
          </span>
        </div>
      </section>
    </>
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
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  primary?: boolean;
}) {
  return (
    <Link href={href}>
      <Card hover glow={primary} className={`p-4 group transition ${primary ? "card-glow glow-ring" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{
              background: primary ? "var(--gradient-hot)" : "var(--surface-2)",
              border: primary ? "none" : "1px solid var(--border)",
            }}
          >
            <Icon size={16} strokeWidth={1.9} style={{ color: primary ? "white" : "var(--coral)" }} />
          </div>
          <span
            className="text-[10px] mono uppercase tracking-wider"
            style={{ color: "var(--subtle)" }}
          >
            {hint}
          </span>
        </div>
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12.5px] mt-1" style={{ color: "var(--muted)" }}>
          {subtitle}
        </div>
      </Card>
    </Link>
  );
}
