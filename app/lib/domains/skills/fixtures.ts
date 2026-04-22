/**
 * Fixture skills used during MVP until Supabase is wired up.
 *
 * Two seed skills — "Learning English" and "Vibecoding" — with a realistic
 * roadmap each, one lesson per leaf, and a handful of completed lessons so
 * the UI has interesting progress to render.
 */

import { MOCK_USER } from "@/lib/core/auth";
import {
  buildTree,
  type LessonProgress,
  type Skill,
  type SkillLesson,
  type SkillNode,
  type SkillWithTree,
} from "./types";
import {
  CLAUDE_CODE_CLI_LESSON_MD,
  PAST_PERFECT_LESSON_MD,
  SUBAGENTS_LESSON_MD,
  HOOKS_LESSON_MD,
  AI_GATEWAY_LESSON_MD,
  MCP_LESSON_MD,
  STREAM_TEXT_LESSON_MD,
  TOOL_CALLING_LESSON_MD,
  SKILLS_FILE_LESSON_MD,
} from "./lesson-content";

const userId = MOCK_USER.userId;
const t0 = "2026-04-01T09:00:00.000Z";
const t1 = "2026-04-10T12:30:00.000Z";
const t2 = "2026-04-15T18:10:00.000Z";
const t3 = "2026-04-20T08:42:00.000Z";

// ---------------------------------------------------------------------------
// Helper — terse node/lesson factories to keep the fixture dense but readable.
// ---------------------------------------------------------------------------

type NodeSeed = {
  id: string;
  parentId: string | null;
  title: string;
  description: string;
};

type LessonSeed = {
  id: string;
  nodeId: string;
  title: string;
  contentMd: string;
  completedAt?: string;
};

function materialise(
  skill: Skill,
  nodeSeeds: NodeSeed[],
  lessonSeeds: LessonSeed[]
): SkillWithTree {
  const nodes: SkillNode[] = nodeSeeds.map((n, i) => ({
    id: n.id,
    skillId: skill.id,
    parentId: n.parentId,
    title: n.title,
    description: n.description,
    sortOrder: i,
  }));

  const lessons: SkillLesson[] = lessonSeeds.map((l) => ({
    id: l.id,
    nodeId: l.nodeId,
    title: l.title,
    contentMd: l.contentMd,
    generatedByAi: false,
    createdAt: t0,
    archivedAt: null,
  }));

  const progress: LessonProgress[] = lessonSeeds
    .filter((l) => l.completedAt)
    .map((l) => ({
      userId,
      lessonId: l.id,
      completedAt: l.completedAt!,
    }));

  return { ...skill, nodes, lessons, progress };
}

// ---------------------------------------------------------------------------
// Skill 1 — Learning English (~15 nodes, 4 lessons done)
// ---------------------------------------------------------------------------

const english: Skill = {
  id: "sk_english",
  slug: "learning-english",
  name: "Learning English",
  description:
    "От B1 к уверенному intermediate — грамматика, словарь, listening и живой speaking.",
  emoji: "🗣️",
  targetLevel: "intermediate",
  createdAt: t0,
  archivedAt: null,
};

const englishNodes: NodeSeed[] = [
  // Roots
  {
    id: "n_en_grammar",
    parentId: null,
    title: "Grammar",
    description: "Скелет языка — времена и артикли.",
  },
  {
    id: "n_en_vocab",
    parentId: null,
    title: "Vocabulary",
    description: "Ядро B1, фразовые глаголы, коллокации.",
  },
  {
    id: "n_en_pron",
    parentId: null,
    title: "Pronunciation",
    description: "Звуки и интонация, которые выдают уровень.",
  },
  {
    id: "n_en_listen",
    parentId: null,
    title: "Listening",
    description: "От подкастов в 0.8x до нативной речи.",
  },
  {
    id: "n_en_speak",
    parentId: null,
    title: "Speaking Practice",
    description: "Живые сессии с моделью — говорим, чиним, повторяем.",
  },

  // Grammar children
  {
    id: "n_en_tenses",
    parentId: "n_en_grammar",
    title: "Tenses",
    description: "Перфектные времена — ядро уровня B1→B2.",
  },
  {
    id: "n_en_tense_past_perfect",
    parentId: "n_en_tenses",
    title: "Past Perfect",
    description: "Когда прошлое случилось «до» другого прошлого.",
  },
  {
    id: "n_en_tense_present_perfect",
    parentId: "n_en_tenses",
    title: "Present Perfect",
    description: "Связь прошлого с настоящим.",
  },
  {
    id: "n_en_tense_future_perfect",
    parentId: "n_en_tenses",
    title: "Future Perfect",
    description: "К моменту в будущем действие уже будет завершено.",
  },
  {
    id: "n_en_articles",
    parentId: "n_en_grammar",
    title: "Articles",
    description: "the / a / an — и когда их вообще нет.",
  },

  // Vocabulary children
  {
    id: "n_en_b1_core",
    parentId: "n_en_vocab",
    title: "B1 Core Words",
    description: "2000 базовых слов, которые должны быть «в зубах».",
  },
  {
    id: "n_en_phrasal",
    parentId: "n_en_vocab",
    title: "Phrasal Verbs",
    description: "Топ-50 фразовых глаголов, без которых никуда.",
  },
  {
    id: "n_en_collocations",
    parentId: "n_en_vocab",
    title: "Collocations",
    description: "Слова, которые ходят парами — make/do, strong tea.",
  },
];

const englishLessons: LessonSeed[] = [
  {
    id: "l_en_past_perfect",
    nodeId: "n_en_tense_past_perfect",
    title: "Past Perfect — introduction",
    contentMd: PAST_PERFECT_LESSON_MD,
  },
  {
    id: "l_en_present_perfect",
    nodeId: "n_en_tense_present_perfect",
    title: "Present Perfect — introduction",
    contentMd:
      "# Present Perfect\n\nСвязь прошлого с настоящим. *I have lived here since 2020.* Короткий лид, дальше примеры и упражнения.",
    completedAt: t1,
  },
  {
    id: "l_en_future_perfect",
    nodeId: "n_en_tense_future_perfect",
    title: "Future Perfect — introduction",
    contentMd:
      "# Future Perfect\n\nК моменту в будущем действие уже завершится. *By 2030 I will have shipped three apps.*",
  },
  {
    id: "l_en_articles",
    nodeId: "n_en_articles",
    title: "Articles — the essentials",
    contentMd:
      "# Articles\n\nТри правила на 80% случаев:\n\n1. Конкретный → **the**.\n2. Один из многих → **a/an**.\n3. Абстрактное/множественное без определённости → без артикля.",
    completedAt: t2,
  },
  {
    id: "l_en_b1_core",
    nodeId: "n_en_b1_core",
    title: "B1 Core — week 1",
    contentMd:
      "# B1 Core — week 1\n\nПервая партия из 40 слов с примерами. В конце — mini-quiz.",
    completedAt: t1,
  },
  {
    id: "l_en_phrasal",
    nodeId: "n_en_phrasal",
    title: "Phrasal verbs — take",
    contentMd:
      "# Phrasal verbs — take\n\ntake off, take on, take over, take up — пять значений с примерами из сериалов.",
  },
  {
    id: "l_en_collocations",
    nodeId: "n_en_collocations",
    title: "Strong vs powerful",
    contentMd:
      "# Strong vs powerful\n\nStrong coffee, powerful engine — привычные пары и ловушки.",
  },
  {
    id: "l_en_pron",
    nodeId: "n_en_pron",
    title: "Vowel reduction in connected speech",
    contentMd:
      "# Vowel reduction\n\nПочему *'gonna'* и *'wanna'* — не сленг, а норма связной речи.",
    completedAt: t3,
  },
  {
    id: "l_en_listen",
    nodeId: "n_en_listen",
    title: "Listening ladder",
    contentMd:
      "# Listening ladder\n\nПодкаст → скорость 0.8x → транскрипт → пересказ. Методичка.",
  },
  {
    id: "l_en_speak",
    nodeId: "n_en_speak",
    title: "Weekly speaking drill",
    contentMd:
      "# Weekly speaking drill\n\n15 минут monologue, запись, разбор с AI — протокол.",
  },
];

// ---------------------------------------------------------------------------
// Skill 2 — Vibecoding (~14 nodes, 3 lessons done)
// ---------------------------------------------------------------------------

const vibecoding: Skill = {
  id: "sk_vibecoding",
  slug: "vibecoding",
  name: "Vibecoding",
  description:
    "Искусство разработки в паре с агентом — от Claude Code CLI до AI SDK и автоматических loops.",
  emoji: "⚡",
  targetLevel: "advanced",
  createdAt: t0,
  archivedAt: null,
};

const vibecodingNodes: NodeSeed[] = [
  // Roots
  {
    id: "n_vc_foundations",
    parentId: null,
    title: "Foundations",
    description: "База — без неё остальное повиснет в воздухе.",
  },
  {
    id: "n_vc_agents",
    parentId: null,
    title: "Agents",
    description: "Субагенты, MCP, tool use — когда нужно больше одного мозга.",
  },
  {
    id: "n_vc_ai_sdk",
    parentId: null,
    title: "AI SDK",
    description: "Vercel AI SDK — streamText, generateObject, tools, gateway.",
  },
  {
    id: "n_vc_patterns",
    parentId: null,
    title: "Patterns",
    description: "Репродуцируемые loops — autoresearch, spec→plan→execute, reviews.",
  },

  // Foundations children
  {
    id: "n_vc_cli",
    parentId: "n_vc_foundations",
    title: "Claude Code CLI",
    description: "Local agent в терминале — сессии, память, tool use.",
  },
  {
    id: "n_vc_skills",
    parentId: "n_vc_foundations",
    title: "Skills files",
    description: ".claude/skills/*.md — как заворачивать промпт в переиспользуемый паттерн.",
  },
  {
    id: "n_vc_hooks",
    parentId: "n_vc_foundations",
    title: "Hooks",
    description: "settings.json — автоматика на события Stop/PreToolUse/PostToolUse.",
  },

  // Agents children
  {
    id: "n_vc_subagents",
    parentId: "n_vc_agents",
    title: "Subagents",
    description: "Изолированный контекст + свой tool allowlist.",
  },
  {
    id: "n_vc_mcp",
    parentId: "n_vc_agents",
    title: "MCP",
    description: "Model Context Protocol — внешние серверы как tools.",
  },
  {
    id: "n_vc_tool_use",
    parentId: "n_vc_agents",
    title: "Tool use",
    description: "Паттерны передачи инструментов и structured results.",
  },

  // AI SDK children
  {
    id: "n_vc_stream_text",
    parentId: "n_vc_ai_sdk",
    title: "streamText",
    description: "Стриминг текста в UI с ToolInvocations и finish callbacks.",
  },
  {
    id: "n_vc_generate_object",
    parentId: "n_vc_ai_sdk",
    title: "generateObject",
    description: "Structured output со схемой Zod — без парсинга руками.",
  },
  {
    id: "n_vc_tool_calling",
    parentId: "n_vc_ai_sdk",
    title: "Tool calling",
    description: "Функции, которые модель сама решает вызвать.",
  },
  {
    id: "n_vc_gateway",
    parentId: "n_vc_ai_sdk",
    title: "Gateway",
    description: "Vercel AI Gateway — провайдеры, роутинг, failover, observability.",
  },

  // Patterns children
  {
    id: "n_vc_autoresearch",
    parentId: "n_vc_patterns",
    title: "Autoresearch loop",
    description: "Karpathy-style loop: Goal/Metric/Verify/Guard/Protocol.",
  },
  {
    id: "n_vc_spec_plan",
    parentId: "n_vc_patterns",
    title: "Spec → Plan → Execute",
    description: "Разбиваем задачу на фазы и верифицируем каждый чекпоинт.",
  },
  {
    id: "n_vc_code_review",
    parentId: "n_vc_patterns",
    title: "Code review flow",
    description: "Reviewer-subagent с read-only allowlist и структурным отчётом.",
  },
];

const vibecodingLessons: LessonSeed[] = [
  {
    id: "l_vc_cli",
    nodeId: "n_vc_cli",
    title: "Claude Code CLI basics",
    contentMd: CLAUDE_CODE_CLI_LESSON_MD,
    completedAt: t2,
  },
  {
    id: "l_vc_skills",
    nodeId: "n_vc_skills",
    title: "Anatomy of a skill file",
    contentMd: SKILLS_FILE_LESSON_MD,
    completedAt: t3,
  },
  {
    id: "l_vc_hooks",
    nodeId: "n_vc_hooks",
    title: "Hooks — automation that sticks",
    contentMd: HOOKS_LESSON_MD,
  },
  {
    id: "l_vc_subagents",
    nodeId: "n_vc_subagents",
    title: "Subagents — sandboxed workers",
    contentMd: SUBAGENTS_LESSON_MD,
    completedAt: t3,
  },
  {
    id: "l_vc_mcp",
    nodeId: "n_vc_mcp",
    title: "MCP in 47 lines",
    contentMd: MCP_LESSON_MD,
  },
  {
    id: "l_vc_tool_use",
    nodeId: "n_vc_tool_use",
    title: "Tool use patterns",
    contentMd: TOOL_CALLING_LESSON_MD,
  },
  {
    id: "l_vc_stream_text",
    nodeId: "n_vc_stream_text",
    title: "streamText end-to-end",
    contentMd: STREAM_TEXT_LESSON_MD,
  },
  {
    id: "l_vc_generate_object",
    nodeId: "n_vc_generate_object",
    title: "generateObject with Zod",
    contentMd:
      "# generateObject with Zod\n\nСхема → structured output без regex и прода-боли.",
  },
  {
    id: "l_vc_tool_calling",
    nodeId: "n_vc_tool_calling",
    title: "Tool calling from A to Z",
    contentMd:
      "# Tool calling from A to Z\n\nОпределение tool, когда модель его вызывает, multi-step реакции.",
  },
  {
    id: "l_vc_gateway",
    nodeId: "n_vc_gateway",
    title: "AI Gateway — failover and dashboards",
    contentMd: AI_GATEWAY_LESSON_MD,
  },
  {
    id: "l_vc_autoresearch",
    nodeId: "n_vc_autoresearch",
    title: "Autoresearch loop — the protocol",
    contentMd:
      "# Autoresearch loop\n\nGoal/Metric/Verify/Guard/Protocol — как Karpathy делает это по ночам.",
  },
  {
    id: "l_vc_spec_plan",
    nodeId: "n_vc_spec_plan",
    title: "Spec → Plan → Execute",
    contentMd:
      "# Spec → Plan → Execute\n\nТри артефакта, три чекпоинта, ноль сюрпризов к концу задачи.",
  },
  {
    id: "l_vc_code_review",
    nodeId: "n_vc_code_review",
    title: "Code review subagent",
    contentMd:
      "# Code review subagent\n\nRead-only allowlist, структурный отчёт с severity, зовётся на каждый PR.",
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Skills стартуют пустыми — юзер создаёт свои навыки сам (после placement
// автоматически создаётся "Learning English" под его уровень). Seed-паки
// «Learning English» и «Vibecoding» ниже сохранены как заготовки, но в
// SEED не попадают — UI показывает empty state до первого реального навыка.
void english;
void englishNodes;
void englishLessons;
void vibecoding;
void vibecodingNodes;
void vibecodingLessons;
void materialise;

const SEED: SkillWithTree[] = [];

export function getSeedSkills(): SkillWithTree[] {
  return SEED;
}

export function getSkillBySlug(slug: string): SkillWithTree | undefined {
  return SEED.find((s) => s.slug === slug);
}

/** Re-export for callers who want a nested tree without importing types. */
export function getSkillTree(slug: string): SkillNode[] {
  const skill = getSkillBySlug(slug);
  return skill ? buildTree(skill.nodes) : [];
}
