"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  Layers3,
  Radar,
  BookOpen,
  LineChart,
  Settings,
  ChevronDown,
  Zap,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import type { AuthContext } from "@/lib/core/types";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  section: "nav" | "tutor" | "sys";
  badge?: { label: string; tone: "coral" | "success" | "violet"; mono?: boolean };
  trailing?: string;
};

function buildNav(
  englishLevel: string | null,
  vibecodingLevel: string | null
): NavItem[] {
  return [
    // ── Основная обучающая часть ────────────────────────────────────────
    { href: "/dashboard", label: "Дашборд", Icon: LayoutDashboard, section: "nav" },
    { href: "/learn", label: "Учёба", Icon: GraduationCap, section: "nav" },
    { href: "/skills", label: "Свои навыки", Icon: Layers3, section: "nav" },
    { href: "/radar", label: "Радар", Icon: Radar, section: "nav" },
    { href: "/journal", label: "Дневник", Icon: BookOpen, section: "nav" },

    // ── Тьютор в режиме свободного чата (дополнение к /learn) ──────────
    {
      href: "/english",
      label: "Английский",
      Icon: MessagesSquare,
      section: "tutor",
      ...(englishLevel
        ? { badge: { label: englishLevel, tone: "coral" as const } }
        : {}),
    },
    {
      href: "/vibecoding",
      label: "Vibecoding",
      Icon: Zap,
      section: "tutor",
      ...(vibecodingLevel
        ? { badge: { label: vibecodingLevel, tone: "violet" as const, mono: true } }
        : {}),
    },

    // ── Система ─────────────────────────────────────────────────────────
    { href: "/settings/usage", label: "Использование", Icon: LineChart, section: "sys" },
    { href: "/settings", label: "Настройки", Icon: Settings, section: "sys" },
  ];
}

function Badge({ label, tone, mono }: { label: string; tone: "coral" | "success" | "violet"; mono?: boolean }) {
  return (
    <span
      className={cn(
        "chip ml-auto",
        tone === "coral" && "chip-coral",
        tone === "success" && "chip-success",
        tone === "violet" && "chip-violet",
        mono && "mono"
      )}
    >
      {label}
    </span>
  );
}

export function Sidebar({
  user,
  englishLevel,
  vibecodingLevel,
}: {
  user: AuthContext;
  englishLevel: string | null;
  vibecodingLevel: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const NAV = buildNav(englishLevel, vibecodingLevel);

  return (
    <aside
      className="hidden md:flex w-60 shrink-0 border-r flex-col sticky top-0 h-dvh"
      style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}
    >
      <div
        className="px-4 py-4 flex items-center gap-2 border-b"
        style={{ borderColor: "var(--border-2)" }}
      >
        <Logo />
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-tight">Прокачка</div>
        </div>
        <div className="ml-auto kbd">⌘K</div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-slim">
        <div
          className="px-2 pt-2 pb-1 text-[10px] mono uppercase tracking-wider"
          style={{ color: "var(--subtle)" }}
        >
          Навигация
        </div>
        {NAV.filter((n) => n.section === "nav").map(({ href, label, Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn("nav-item", isActive(href) && "active")}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
            {badge ? <Badge {...badge} /> : null}
          </Link>
        ))}

        <div
          className="px-2 pt-4 pb-1 text-[10px] mono uppercase tracking-wider"
          style={{ color: "var(--subtle)" }}
        >
          Тьютор (чат)
        </div>
        {NAV.filter((n) => n.section === "tutor").map(({ href, label, Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn("nav-item", isActive(href) && "active")}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
            {badge ? <Badge {...badge} /> : null}
          </Link>
        ))}

        <div
          className="px-2 pt-4 pb-1 text-[10px] mono uppercase tracking-wider"
          style={{ color: "var(--subtle)" }}
        >
          Система
        </div>
        {NAV.filter((n) => n.section === "sys").map(({ href, label, Icon, trailing }) => (
          <Link
            key={href}
            href={href}
            className={cn("nav-item", isActive(href) && "active")}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
            {trailing ? (
              <span className="ml-auto mono text-[10px]" style={{ color: "var(--muted)" }}>
                {trailing}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3" style={{ borderColor: "var(--border-2)" }}>
        <div className="card p-2.5 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-semibold"
            style={{ background: "var(--gradient-hot)", color: "white" }}
          >
            {initials(user.displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium truncate">{user.displayName}</div>
            <div
              className="text-[10px] mono flex items-center gap-1"
              style={{ color: "var(--coral)" }}
            >
              🔥 streak · 7 дней
            </div>
          </div>
          <ChevronDown size={14} style={{ color: "var(--subtle)" }} />
        </div>
      </div>
    </aside>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
