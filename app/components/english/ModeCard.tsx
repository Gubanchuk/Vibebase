import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Languages,
  Layers,
  ListChecks,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import type { ModeMeta } from "@/lib/domains/english/types";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  GraduationCap,
  Languages,
  Layers,
  ListChecks,
  MessagesSquare,
};

interface Props {
  meta: ModeMeta;
  /** Pre-formatted meta line like "8 мин назад · 4 сообщения". */
  lastSessionLabel?: string;
  variant?: "hero" | "compact";
}

export function ModeCard({ meta, lastSessionLabel, variant = "compact" }: Props) {
  const Icon = ICON_MAP[meta.Icon] ?? BookOpen;
  const isHero = variant === "hero";
  const href = `/english/${meta.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "group block focus-visible:outline-none",
        isHero ? "md:col-span-2 md:row-span-2" : ""
      )}
    >
      <Card
        hover
        glow={isHero}
        className={cn(
          "h-full flex flex-col transition",
          isHero ? "p-5 md:p-8" : "p-4 md:p-5",
          isHero && "glow-ring"
        )}
      >
        <header className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-md flex items-center justify-center shrink-0",
              isHero ? "w-11 h-11" : "w-9 h-9"
            )}
            style={{
              background: isHero
                ? "var(--gradient-hot)"
                : "var(--surface-2)",
              border: isHero ? "none" : "1px solid var(--border)",
              boxShadow: isHero
                ? "0 4px 16px -4px rgba(249, 112, 102, 0.55)"
                : undefined,
            }}
          >
            <Icon
              size={isHero ? 20 : 16}
              strokeWidth={1.8}
              color={isHero ? "white" : "var(--muted)"}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "font-semibold tracking-tight",
                  isHero
                    ? "text-[22px] md:text-[26px] gradient-text"
                    : "text-[14px]"
                )}
              >
                {meta.title}
              </h3>
              {isHero ? (
                <Chip tone="coral" className="mono">
                  Recommended
                </Chip>
              ) : meta.accent !== "neutral" ? (
                <Chip tone={meta.accent}>{meta.accent}</Chip>
              ) : null}
            </div>
            <p
              className={cn(
                "mt-0.5",
                isHero ? "text-[14px]" : "text-[12.5px]"
              )}
              style={{ color: "var(--muted)" }}
            >
              {meta.subtitle}
            </p>
          </div>
        </header>

        {isHero ? (
          <p
            className="mt-5 text-[14px] leading-relaxed max-w-prose"
            style={{ color: "var(--muted)" }}
          >
            {meta.description}
          </p>
        ) : (
          <p
            className="mt-3 text-[12px] leading-relaxed line-clamp-2"
            style={{ color: "var(--subtle)" }}
          >
            {meta.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          {lastSessionLabel ? (
            <span
              className="text-[10px] mono"
              style={{ color: "var(--subtle)" }}
            >
              {lastSessionLabel}
            </span>
          ) : (
            <span className="text-[10px] mono" style={{ color: "var(--subtle)" }}>
              новый режим
            </span>
          )}

          <span
            className={cn(
              "btn",
              isHero ? "btn-primary btn-lg" : "btn-ghost btn-sm"
            )}
          >
            {isHero ? "Continue" : "Start"}
            <ArrowRight size={isHero ? 15 : 12} strokeWidth={1.9} />
          </span>
        </div>
      </Card>
    </Link>
  );
}
