import type { Relevance } from "./schema";

export type SourceAccent = "coral" | "violet" | "amber" | "neutral";

export type RadarItemView = {
  id: string;
  url: string;
  source: string;
  title: string;
  /** Короткий тизер для карточки (2–4 предложения). */
  tldr: string;
  /**
   * Полный русский саммари для internal detail page (`/radar/[id]`).
   * Markdown, обычно 200–400 слов: контекст, ключевые детали, как
   * применимо к нашему проекту. В конце компонент сам добавляет
   * ссылку на источник.
   */
  summaryMd: string;
  tags: string[];
  /** ISO string — safe to pass from Server to Client Components. */
  publishedAt: string;
  relevance: Relevance;
  relatedSkill?: string;
};

export type SourceMeta = {
  slug: string;
  label: string;
  /** Lucide icon name. Rendered via dynamic lookup in SourceIcon.tsx. */
  iconName: string;
  accent: SourceAccent;
};

const SOURCE_REGISTRY: Record<string, SourceMeta> = {
  "anthropic-blog": {
    slug: "anthropic-blog",
    label: "anthropic.com",
    iconName: "Sparkles",
    accent: "coral",
  },
  "claude-docs": {
    slug: "claude-docs",
    label: "docs.claude.com",
    iconName: "BookOpen",
    accent: "coral",
  },
  "vercel-changelog": {
    slug: "vercel-changelog",
    label: "vercel.com/changelog",
    iconName: "Triangle",
    accent: "neutral",
  },
  "ai-sdk-docs": {
    slug: "ai-sdk-docs",
    label: "sdk.vercel.ai",
    iconName: "Cpu",
    accent: "violet",
  },
  github: {
    slug: "github",
    label: "github.com",
    iconName: "Code2",
    accent: "neutral",
  },
  "reddit-claudeai": {
    slug: "reddit-claudeai",
    label: "r/ClaudeAI",
    iconName: "MessageCircle",
    accent: "amber",
  },
  simonw: {
    slug: "simonw",
    label: "simonwillison.net",
    iconName: "Feather",
    accent: "violet",
  },
  "mcp-docs": {
    slug: "mcp-docs",
    label: "modelcontextprotocol.io",
    iconName: "Plug",
    accent: "violet",
  },
  "openai-blog": {
    slug: "openai-blog",
    label: "openai.com",
    iconName: "Zap",
    accent: "amber",
  },
  thenewstack: {
    slug: "thenewstack",
    label: "thenewstack.io",
    iconName: "Newspaper",
    accent: "neutral",
  },
  "github-changelog": {
    slug: "github-changelog",
    label: "github.blog",
    iconName: "Code2",
    accent: "neutral",
  },
  "vellum-blog": {
    slug: "vellum-blog",
    label: "vellum.ai",
    iconName: "BarChart3",
    accent: "violet",
  },
  "community-blog": {
    slug: "community-blog",
    label: "community blog",
    iconName: "FileText",
    accent: "neutral",
  },
  "claude-code-changelog": {
    slug: "claude-code-changelog",
    label: "docs.claude.com",
    iconName: "BookOpen",
    accent: "coral",
  },
  "mcp-blog": {
    slug: "mcp-blog",
    label: "blog.modelcontextprotocol.io",
    iconName: "Plug",
    accent: "violet",
  },
  "harvard-gazette": {
    slug: "harvard-gazette",
    label: "news.harvard.edu",
    iconName: "Newspaper",
    accent: "neutral",
  },
  "community-tool": {
    slug: "community-tool",
    label: "releasebot.io",
    iconName: "Rss",
    accent: "neutral",
  },
};

export function sourceMetaOf(slug: string): SourceMeta {
  return (
    SOURCE_REGISTRY[slug] ?? {
      slug,
      label: slug,
      iconName: "Rss",
      accent: "neutral",
    }
  );
}

export function allKnownSources(): SourceMeta[] {
  return Object.values(SOURCE_REGISTRY);
}
