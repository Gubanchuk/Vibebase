import { getSupabaseAdmin } from "@/lib/infra/supabase/admin";
import type { UserId } from "@/lib/core/types";
import { createSkillWithTree } from "@/lib/domains/skills/repo";
import type { RoadmapNodeInput } from "@/lib/domains/skills/repo";
import type { VibecodingLevel } from "./types";

/**
 * Seed skill tree по результату placement'a.
 * Идемпотентно: если у юзера уже есть skill с slug='vibecoding' — ничего не
 * создаёт (дерево юзер мог редактировать). Возвращает slug существующего
 * или вновь созданного навыка.
 */

export async function seedVibecodingSkillForLevel(
  userId: UserId,
  level: VibecodingLevel
): Promise<string | null> {
  const db = getSupabaseAdmin();

  const { data: existing } = await db
    .from("skills")
    .select("slug")
    .eq("user_id", userId)
    .eq("slug", "vibecoding")
    .maybeSingle();

  if (existing?.slug) {
    return String(existing.slug);
  }

  const plan = getSeedPlan(level);
  try {
    const { slug } = await createSkillWithTree(userId, {
      name: "Vibecoding",
      description: plan.description,
      targetLevel:
        level === "newbie"
          ? "beginner"
          : level === "maintainer"
            ? "advanced"
            : "intermediate",
      emoji: "⚡",
      nodes: plan.nodes,
    });
    return slug;
  } catch (err) {
    console.error("[vc-seeder] create failed:", err);
    return null;
  }
}

interface SeedPlan {
  description: string;
  nodes: RoadmapNodeInput[];
}

function getSeedPlan(level: VibecodingLevel): SeedPlan {
  const foundations: RoadmapNodeInput = {
    title: "Foundations",
    description: "База Claude Code + промптинг. Без неё остальное повиснет.",
    children: [
      {
        title: "Claude Code CLI",
        description: "Локальный агент в терминале — сессии, память, tool use.",
      },
      {
        title: "CLAUDE.md и память",
        description: "Global / project / session tier'ы — что куда класть.",
      },
      {
        title: "Первый скилл",
        description: ".claude/skills/*.md — frontmatter, trigger, protocol.",
      },
      {
        title: "Hooks",
        description: "PreToolUse / PostToolUse / Stop / SubagentStop — детерминированная автоматика.",
      },
    ],
  };

  const agents: RoadmapNodeInput = {
    title: "Agents",
    description: "Субагенты, MCP, tool use — когда нужно больше одного мозга.",
    children: [
      {
        title: "Subagents",
        description: "Изоляция контекста + свой tool allowlist.",
      },
      {
        title: "MCP",
        description: "Model Context Protocol — внешние серверы как tools.",
      },
      {
        title: "Tool use patterns",
        description: "Structured results, retry-on-error, Zod-валидация.",
      },
      {
        title: "Permission modes",
        description: "acceptEdits / ask / plan / bypassPermissions — разумные дефолты.",
      },
    ],
  };

  const aiSdk: RoadmapNodeInput = {
    title: "AI SDK",
    description: "Vercel AI SDK — streamText, Agent, tools, Gateway.",
    children: [
      {
        title: "streamText end-to-end",
        description: "Route handler → ReadableStream → useChat + onFinish.",
      },
      {
        title: "generateObject с Zod",
        description: "Structured output без парсинга текста.",
      },
      {
        title: "Agent и ToolLoopAgent",
        description: "Переиспользуемые LLM-персоны + auto-loop.",
      },
      {
        title: "AI Gateway",
        description: "Один endpoint, failover, budget, observability.",
      },
    ],
  };

  const patterns: RoadmapNodeInput = {
    title: "Patterns",
    description: "Reproducible loops: autoresearch, spec→plan→execute, reviews.",
    children: [
      {
        title: "Autoresearch loop",
        description: "Karpathy-style: Goal / Metric / Verify / Guard / Protocol.",
      },
      {
        title: "Spec → Plan → Execute",
        description: "Три артефакта, три чекпоинта, ноль сюрпризов.",
      },
      {
        title: "Code review subagent",
        description: "Read-only allowlist, severity report, зовётся на каждый PR.",
      },
    ],
  };

  const frontier: RoadmapNodeInput = {
    title: "Frontier",
    description: "Свежие паттерны и релизы — автоматически пополняется из radar.",
    children: [
      {
        title: "Skills 2.0",
        description: "Изолированные субагенты + evals через skill-creator.",
      },
      {
        title: "Observability для субагентов",
        description: "agent_id, transcript_path, per-subagent cost.",
      },
      {
        title: "Agentic engineering",
        description: "Сдвиг от 'AI пишет код' к оркестрации и надзору.",
      },
    ],
  };

  const prod: RoadmapNodeInput = {
    title: "Production",
    description: "Grown-up темы: evals, safety, migration, team practices.",
    children: [
      {
        title: "Eval engineering",
        description: "Регрессионные тесты для промптов и скиллов.",
      },
      {
        title: "Agent security",
        description: "Tool allowlist per-agent, human-in-the-loop approval.",
      },
      {
        title: "Migration strategies",
        description: "Модели, SDK major-bumps, MCP spec changes.",
      },
      {
        title: "Team practices",
        description: "Shared skills, observability policy, runbook'и.",
      },
    ],
  };

  switch (level) {
    case "newbie":
      return {
        description:
          "Старт с нуля. Сначала — Claude Code и базовый промптинг, потом — первые агент-паттерны.",
        nodes: [foundations],
      };
    case "practitioner":
      return {
        description:
          "Ты уже в CLI. Дальше — субагенты, AI SDK, паттерны композиции.",
        nodes: [foundations, agents, patterns],
      };
    case "architect":
      return {
        description:
          "Проектируешь агент-пайплайны. Фокус — observability, полный AI SDK, production-грани.",
        nodes: [foundations, agents, aiSdk, patterns, frontier],
      };
    case "maintainer":
      return {
        description:
          "Держишь экосистему и учишь других. Frontier + production — основные темы, база — справочник.",
        nodes: [foundations, agents, aiSdk, patterns, frontier, prod],
      };
  }
}
