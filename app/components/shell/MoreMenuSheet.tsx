"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  MessagesSquare,
  Zap,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const MENU_ITEMS = [
  {
    href: "/journal",
    label: "Дневник",
    hint: "Свободные записи, рефлексия",
    Icon: BookOpen,
    accent: "coral" as const,
  },
  {
    href: "/english",
    label: "Английский · тьютор",
    hint: "Чат-практика, 6 режимов",
    Icon: MessagesSquare,
    accent: "coral" as const,
  },
  {
    href: "/vibecoding",
    label: "Vibecoding · тьютор",
    hint: "Чат про агент-паттерны",
    Icon: Zap,
    accent: "violet" as const,
  },
  {
    href: "/settings/usage",
    label: "Использование AI",
    hint: "Вызовы, токены, стоимость",
    Icon: LineChart,
    accent: "muted" as const,
  },
  {
    href: "/settings",
    label: "Настройки",
    hint: "Профиль, интеграции",
    Icon: Settings,
    accent: "muted" as const,
  },
];

/**
 * Bottom-sheet меню со вспомогательными разделами, которых нет в BottomTabs.
 * Использует Dialog side="right" который на мобиле превращается в bottom-sheet.
 */
export function MoreMenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" className="flex flex-col gap-0">
        <DialogTitle className="text-[18px]">Меню</DialogTitle>
        <DialogDescription>
          Всё, что не влезло в нижнюю панель
        </DialogDescription>

        <div className="mt-4 space-y-1">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 px-3 py-3 min-h-[52px] rounded-md transition",
                "hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-3)]"
              )}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background:
                    item.accent === "coral"
                      ? "var(--coral-soft)"
                      : item.accent === "violet"
                        ? "var(--violet-soft)"
                        : "var(--surface-2)",
                  color:
                    item.accent === "coral"
                      ? "var(--coral)"
                      : item.accent === "violet"
                        ? "#c084fc"
                        : "var(--muted)",
                }}
              >
                <item.Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate">
                  {item.label}
                </div>
                <div
                  className="text-[11.5px] truncate"
                  style={{ color: "var(--muted)" }}
                >
                  {item.hint}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div
          className="mt-4 pt-3 border-t"
          style={{ borderColor: "var(--border-2)" }}
        >
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 min-h-[52px] rounded-md transition",
                "text-left hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-3)]"
              )}
              onClick={close}
              style={{ color: "var(--muted)" }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "var(--surface-2)" }}
              >
                <LogOut size={17} strokeWidth={1.8} />
              </div>
              <span className="text-[14px] font-medium">Выйти</span>
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
