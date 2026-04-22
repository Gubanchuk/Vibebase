import { TopBar } from "@/components/shell/TopBar";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ProgressRing } from "@/components/ui/progress-ring";
import { requireAuth } from "@/lib/core/auth";
import { listRecent, sumCostToday, sumCostMonth, costByDomain } from "@/lib/core/usage-repo";
import { budgetStatus, getBudget } from "@/lib/core/budget-guard";
import { BudgetEditor } from "./budget-editor";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const user = await requireAuth();
  const [recent, today, month, status, domains, budget] = await Promise.all([
    listRecent(user.userId, 50),
    sumCostToday(user.userId),
    sumCostMonth(user.userId),
    budgetStatus(user.userId),
    costByDomain(user.userId),
    getBudget(user.userId),
  ]);

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Настройки" },
          { label: "Использование", active: true },
        ]}
      />

      <section className="p-4 md:p-6 border-b" style={{ borderColor: "var(--border-2)" }}>
        <div
          className="text-[11px] mono uppercase tracking-wider mb-2"
          style={{ color: "var(--subtle)" }}
        >
          // cost dashboard · <span style={{ color: "var(--coral)" }}>live</span>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight mb-1">
          Куда утекают <span className="serif-italic" style={{ color: "var(--amber)" }}>токены</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Данные обновляются на каждый вызов. Ниже — сегодня, месяц, по доменам и последние 50 обращений.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <KpiCard
            label="Сегодня"
            value={`$${today.toFixed(4)}`}
            meta={`лимит $${status.dailyCap.toFixed(2)}`}
            ratio={status.todayRatio}
          />
          <KpiCard
            label="В этом месяце"
            value={`$${month.toFixed(4)}`}
            meta={`лимит $${status.monthlyCap.toFixed(2)}`}
            ratio={status.monthRatio}
          />
          <Card className="p-4">
            <div className="text-[10px] mono uppercase tracking-wider mb-2" style={{ color: "var(--subtle)" }}>
              Вызовов в месяце
            </div>
            <div className="text-[24px] font-bold mono">{recent.length}</div>
            <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              в т.ч. сегодня — {recent.filter((r) => new Date(r.createdAt) > new Date(Date.now() - 24*60*60*1000)).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] mono uppercase tracking-wider mb-2" style={{ color: "var(--subtle)" }}>
              Статус
            </div>
            {status.blocked ? (
              <Chip tone="danger">Заблокировано</Chip>
            ) : status.softWarning ? (
              <Chip tone="amber">Warning &gt;80%</Chip>
            ) : (
              <Chip tone="success">В норме</Chip>
            )}
            <div className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>
              per-call tokens: <span className="mono" style={{ color: "var(--content)" }}>{budget.perCallMaxTokensOut}</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="p-4 md:p-6 border-b" style={{ borderColor: "var(--border-2)" }}>
        <div
          className="text-[11px] mono uppercase tracking-wider mb-3"
          style={{ color: "var(--subtle)" }}
        >
          // by domain
        </div>
        <Card className="divide-y" style={{ borderColor: "var(--border-2)" }}>
          {domains.map((d) => {
            const max = Math.max(...domains.map((x) => x.cost));
            const pct = max > 0 ? (d.cost / max) * 100 : 0;
            return (
              <div
                key={d.domain}
                className="px-4 py-3 flex items-center gap-4"
                style={{ borderColor: "var(--border-2)" }}
              >
                <div className="w-44 text-[13px] mono">{d.domain}</div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full transition-all"
                    style={{ width: `${pct}%`, background: "var(--gradient-hot)" }}
                  />
                </div>
                <div className="w-20 text-right mono text-[12px]" style={{ color: "var(--content)" }}>
                  ${d.cost.toFixed(4)}
                </div>
                <div className="w-20 text-right mono text-[11px]" style={{ color: "var(--subtle)" }}>
                  {d.calls} calls
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      <section className="p-4 md:p-6 border-b" style={{ borderColor: "var(--border-2)" }}>
        <div className="text-[11px] mono uppercase tracking-wider mb-3" style={{ color: "var(--subtle)" }}>
          // caps (editable)
        </div>
        <BudgetEditor initial={budget} />
      </section>

      <section className="p-4 md:p-6">
        <div
          className="text-[11px] mono uppercase tracking-wider mb-3"
          style={{ color: "var(--subtle)" }}
        >
          // recent calls (50)
        </div>
        <Card className="overflow-x-auto scrollbar-slim">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left mono text-[10px] uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
                <th className="px-4 py-2.5 font-normal">Время</th>
                <th className="px-4 py-2.5 font-normal">Домен</th>
                <th className="px-4 py-2.5 font-normal">Модель</th>
                <th className="px-4 py-2.5 font-normal text-right">In/Out</th>
                <th className="px-4 py-2.5 font-normal text-right">Latency</th>
                <th className="px-4 py-2.5 font-normal text-right">Cost</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr
                  key={r.id}
                  className="border-t"
                  style={{ borderColor: "var(--border-2)" }}
                >
                  <td className="px-4 py-2 mono text-[11px]" style={{ color: "var(--muted)" }}>
                    {new Date(r.createdAt).toLocaleTimeString("ru-RU")}
                  </td>
                  <td className="px-4 py-2 mono">{r.domain}</td>
                  <td className="px-4 py-2 mono text-[11px]" style={{ color: "var(--muted)" }}>
                    {r.model.split("/").pop()}
                  </td>
                  <td className="px-4 py-2 text-right mono">{r.tokensIn}/{r.tokensOut}</td>
                  <td className="px-4 py-2 text-right mono">{r.latencyMs}ms</td>
                  <td className="px-4 py-2 text-right mono" style={{ color: "var(--content)" }}>
                    ${r.costUsd.toFixed(6)}
                  </td>
                  <td className="px-4 py-2">
                    <Chip tone={r.status === "ok" ? "success" : "danger"} mono>
                      {r.status}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </>
  );
}

function KpiCard({ label, value, meta, ratio }: { label: string; value: string; meta: string; ratio: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "var(--subtle)" }}>
          {label}
        </div>
        <ProgressRing value={Math.min(1, ratio)} size={26} stroke={2.8} />
      </div>
      <div className="text-[22px] font-bold mono">{value}</div>
      <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
        {meta}
      </div>
    </Card>
  );
}
