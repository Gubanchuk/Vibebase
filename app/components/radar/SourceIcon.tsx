import {
  BookOpen,
  Code2,
  Cpu,
  Feather,
  MessageCircle,
  Plug,
  Rss,
  Sparkles,
  Triangle,
  Zap,
  Newspaper,
  FileText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { sourceMetaOf, type SourceAccent } from "@/lib/domains/radar/types";

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Code2,
  Cpu,
  Feather,
  MessageCircle,
  Plug,
  Rss,
  Sparkles,
  Triangle,
  Zap,
  Newspaper,
  FileText,
  BarChart3,
};

const ACCENT_STYLE: Record<
  SourceAccent,
  { bg: string; color: string; border: string }
> = {
  coral: {
    bg: "var(--coral-soft)",
    color: "var(--coral)",
    border: "rgba(249, 112, 102, 0.3)",
  },
  violet: {
    bg: "var(--violet-soft)",
    color: "#c084fc",
    border: "rgba(168, 85, 247, 0.3)",
  },
  amber: {
    bg: "rgba(251, 191, 36, 0.12)",
    color: "var(--amber)",
    border: "rgba(251, 191, 36, 0.3)",
  },
  neutral: {
    bg: "var(--surface-2)",
    color: "var(--muted)",
    border: "var(--border)",
  },
};

/**
 * Small square tile with the source's lucide icon, tinted by the source's accent.
 */
export function SourceIcon({
  source,
  size = 22,
  className,
}: {
  source: string;
  /** Outer tile side in px. Default 22. */
  size?: number;
  className?: string;
}) {
  const meta = sourceMetaOf(source);
  const Icon = ICONS[meta.iconName] ?? Rss;
  const style = ACCENT_STYLE[meta.accent];
  const iconSize = Math.round(size * 0.55);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[5px] border shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
        background: style.bg,
        borderColor: style.border,
        color: style.color,
      }}
      aria-hidden
    >
      <Icon size={iconSize} strokeWidth={1.8} />
    </span>
  );
}
