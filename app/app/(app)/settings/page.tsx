import Link from "next/link";
import { TopBar } from "@/components/shell/TopBar";
import { Card } from "@/components/ui/card";
import { LineChart, Shield, Palette, Database, LogOut } from "lucide-react";

const SECTIONS = [
  { href: "/settings/usage", label: "Использование и бюджет", desc: "Cost dashboard, caps, per-call limits", Icon: LineChart, ready: true },
  { href: "#", label: "Профиль", desc: "Имя, язык, таймзона", Icon: Shield, ready: false },
  { href: "#", label: "Тема и оформление", desc: "Dark only в MVP. Светлая — v2.", Icon: Palette, ready: false },
  { href: "#", label: "Данные и экспорт", desc: "Backup дневника, журналов, сессий", Icon: Database, ready: false },
  { href: "#", label: "Выйти", desc: "Supabase magic-link подключится завтра", Icon: LogOut, ready: false },
];

export default function SettingsPage() {
  return (
    <>
      <TopBar breadcrumb={[{ label: "Настройки", active: true }]} />
      <section className="p-4 md:p-6 max-w-3xl">
        <h1 className="text-[26px] font-bold tracking-tight mb-1">
          <span className="serif-italic" style={{ color: "var(--amber)" }}>Настройки</span>
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          MVP — дневные/месячные лимиты уже живые. Остальное — завтра, когда прикрутим Supabase.
        </p>

        <div className="space-y-2">
          {SECTIONS.map(({ href, label, desc, Icon, ready }) => (
            <Link key={label} href={ready ? href : "#"} aria-disabled={!ready}>
              <Card
                hover={ready}
                className={`p-4 flex items-center gap-3 ${ready ? "" : "opacity-60 cursor-not-allowed"}`}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <Icon size={15} strokeWidth={1.8} style={{ color: "var(--muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold">{label}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: "var(--muted)" }}>
                    {desc}
                  </div>
                </div>
                {!ready && (
                  <span className="chip mono text-[10px]">v1.1</span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
