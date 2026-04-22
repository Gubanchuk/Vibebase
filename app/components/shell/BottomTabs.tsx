"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Layers3,
  Radar,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MoreMenuSheet } from "./MoreMenuSheet";

const TABS = [
  {
    href: "/dashboard",
    label: "Дашборд",
    Icon: LayoutDashboard,
    matchPaths: ["/dashboard"],
  },
  {
    href: "/learn",
    label: "Учёба",
    Icon: GraduationCap,
    matchPaths: ["/learn"],
  },
  {
    href: "/skills",
    label: "Навыки",
    Icon: Layers3,
    matchPaths: ["/skills"],
  },
  {
    href: "/radar",
    label: "Радар",
    Icon: Radar,
    matchPaths: ["/radar"],
  },
] as const;

/**
 * Mobile bottom navigation. 5-й слот — «Меню» — открывает bottom-sheet
 * со всеми прочими разделами. Прячется когда на мобиле открыта виртуальная
 * клавиатура (visualViewport shrinks). Tap targets 44×44 (Apple HIG).
 */
export function BottomTabs() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);

  // Детекция виртуальной клавиатуры на мобиле через visualViewport API.
  // Когда высота сжимается больше чем на 150px — считаем, что клава поднялась.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;

    const baseHeight = window.innerHeight;
    const handler = () => {
      const diff = baseHeight - vv.height;
      setKeyboardOpen(diff > 150);
    };
    vv.addEventListener("resize", handler);
    return () => vv.removeEventListener("resize", handler);
  }, []);

  const menuActive =
    menuOpen ||
    ["/journal", "/english", "/vibecoding", "/settings"].some((p) =>
      pathname.startsWith(p)
    );

  return (
    <>
      <nav
        aria-label="Нижняя навигация"
        className={cn(
          "md:hidden fixed bottom-0 inset-x-0 z-40 border-t flex justify-around",
          "pt-1 pb-[env(safe-area-inset-bottom)] transition-[opacity,transform] duration-150",
          keyboardOpen &&
            "opacity-0 pointer-events-none translate-y-4"
        )}
        style={{
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(14px)",
          borderColor: "var(--border-2)",
        }}
      >
        {TABS.map(({ href, label, Icon, matchPaths }) => {
          const active = matchPaths.some((p) => pathname.startsWith(p));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                // 44px min tap target: py-2.5 + icon 20 + text 10.5 + gap 4 ≈ 52px
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0",
                "py-2.5 min-h-[52px] relative",
                active
                  ? "text-[color:var(--content)]"
                  : "text-[color:var(--muted)]"
              )}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span className="text-[10.5px] font-medium leading-none">
                {label}
              </span>
              {active ? (
                <span
                  className="absolute top-0 h-[2px] w-8 rounded-full"
                  style={{ background: "var(--gradient-hot)" }}
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0",
            "py-2.5 min-h-[52px] relative",
            menuActive
              ? "text-[color:var(--content)]"
              : "text-[color:var(--muted)]"
          )}
        >
          <MoreHorizontal size={20} strokeWidth={1.9} />
          <span className="text-[10.5px] font-medium leading-none">Меню</span>
          {menuActive ? (
            <span
              className="absolute top-0 h-[2px] w-8 rounded-full"
              style={{ background: "var(--gradient-hot)" }}
              aria-hidden
            />
          ) : null}
        </button>
      </nav>

      <MoreMenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
