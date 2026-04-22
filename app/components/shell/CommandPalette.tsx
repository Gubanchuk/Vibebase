"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  MessagesSquare,
  Layers3,
  Radar,
  BookOpen,
  LineChart,
  LayoutDashboard,
  Plus,
  Sparkles,
} from "lucide-react";

type CtxValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};
const Ctx = React.createContext<CtxValue | null>(null);

export function useCommand() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useCommand must be used inside <CommandPaletteProvider>");
  return v;
}

const NAV_ACTIONS = [
  { label: "Дашборд", hint: "Overview", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Английский", hint: "6 режимов", href: "/english", Icon: MessagesSquare },
  { label: "Прокачка навыков", hint: "Skill trees", href: "/skills", Icon: Layers3 },
  { label: "Радар", hint: "Feed", href: "/radar", Icon: Radar },
  { label: "Дневник", hint: "Journal", href: "/journal", Icon: BookOpen },
  { label: "Использование", hint: "Cost dashboard", href: "/settings/usage", Icon: LineChart },
];

const QUICK = [
  { label: "Новая сессия · Personal Lesson", href: "/english/lesson", Icon: Plus, accent: "coral" as const },
  { label: "Новая запись в дневнике", href: "/journal/new", Icon: Plus, accent: "violet" as const },
  { label: "Сгенерировать урок", href: "/skills", Icon: Sparkles, accent: "coral" as const },
];

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  const router = useRouter();
  const open = React.useCallback(() => setOpen(true), []);
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Ctx.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <Command
            label="Command palette"
            className="relative w-full max-w-xl card p-0 overflow-hidden border border-[color:var(--border)]"
          >
            <Command.Input
              autoFocus
              placeholder="Что делаем? (перейти, создать, настроить…)"
              className="w-full px-4 py-3.5 text-[14px] bg-transparent border-b border-[color:var(--border-2)] outline-none text-[color:var(--content)] placeholder:text-[color:var(--subtle)]"
            />
            <Command.List className="max-h-[50vh] overflow-y-auto scrollbar-slim p-2">
              <Command.Empty className="px-3 py-6 text-center text-[12.5px] text-[color:var(--muted)]">
                Ничего не найдено.
              </Command.Empty>
              <Command.Group
                heading="Быстрые действия"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[color:var(--subtle)]"
              >
                {QUICK.map((a) => (
                  <Command.Item
                    key={a.href}
                    onSelect={() => go(a.href)}
                    className="px-3 py-2 rounded-md flex items-center gap-2.5 text-[13px] cursor-pointer data-[selected=true]:bg-[color:var(--surface-2)]"
                  >
                    <a.Icon size={14} strokeWidth={1.9} style={{ color: a.accent === "coral" ? "var(--coral)" : "var(--violet)" }} />
                    {a.label}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group
                heading="Навигация"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[color:var(--subtle)]"
              >
                {NAV_ACTIONS.map((a) => (
                  <Command.Item
                    key={a.href}
                    onSelect={() => go(a.href)}
                    className="px-3 py-2 rounded-md flex items-center gap-2.5 text-[13px] cursor-pointer data-[selected=true]:bg-[color:var(--surface-2)]"
                  >
                    <a.Icon size={14} strokeWidth={1.9} style={{ color: "var(--muted)" }} />
                    <span>{a.label}</span>
                    <span className="ml-auto text-[11px]" style={{ color: "var(--subtle)" }}>{a.hint}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div
              className="flex items-center gap-3 px-3 py-2 border-t text-[11px]"
              style={{ borderColor: "var(--border-2)", color: "var(--subtle)" }}
            >
              <span><span className="kbd">↑</span> <span className="kbd">↓</span> навигация</span>
              <span><span className="kbd">↵</span> выбрать</span>
              <span><span className="kbd">esc</span> закрыть</span>
            </div>
          </Command>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
