import { z } from "zod";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { env } from "@/lib/env";
import type { LearningDomain } from "../types";
import {
  LEARNING_CONVENTIONS,
  MODEL_ERA_CONTEXT,
  currentDate,
} from "./shared";

/**
 * CURATOR — читает vault, кластеризует темы, ранжирует по
 * popularity × importance. Возвращает ordered список топиков с
 * metadata, готовых для заливки в curriculum_topics.
 */

const CuratedTopicSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(3)
    .max(60)
    .describe("kebab-case, only lowercase letters, digits, hyphens"),
  title: z.string().min(4).max(80),
  summary: z
    .string()
    .min(20)
    .max(280)
    .describe("Одно предложение-два — о чём тема, что юзер получит освоив"),
  importance: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe("1 = опциональная мелочь, 5 = must-have для домена"),
  popularity: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Сколько vault-items касаются этой темы (примерно)"),
  levelMin: z
    .string()
    .nullable()
    .describe(
      "Минимальный уровень юзера для этой темы. English: A1/A2/B1/B1+/B2/C1/C2 или null. Vibecoding: newbie/practitioner/architect/maintainer или null."
    ),
  levelMax: z.string().nullable(),
  tags: z.array(z.string().min(2).max(20)).min(1).max(5),
  vaultRefs: z
    .array(z.string())
    .describe(
      "Имена файлов из vault, которые фидят эту тему. Используй только те, что я передал во входе."
    ),
  // OpenAI strict structured output: все поля required, никаких .default().
  // Модель возвращает [] если prerequisites нет.
  prerequisites: z
    .array(z.string())
    .describe(
      "Slug'и других тем из ЭТОГО же выхода, которые надо знать первыми. Пустой массив если это базовая тема без пререквизитов."
    ),
});

const CuratorOutputSchema = z.object({
  topics: z
    .array(CuratedTopicSchema)
    .min(8)
    .max(24)
    .describe(
      "Upоряд. по порядку обучения: сначала базовые, потом продвинутые"
    ),
});

export type CuratorOutput = z.infer<typeof CuratorOutputSchema>;
export type CuratedTopic = z.infer<typeof CuratedTopicSchema>;

function buildSystemPrompt(domain: LearningDomain): string {
  const domainContext =
    domain === "english"
      ? [
          "Ты — куратор ОБУЧАЮЩЕГО курса по английскому языку для русскоговорящих.",
          "Источник — методологический vault (research по CEFR, input hypothesis, Russian-L1 ошибки, Krashen, adaptive placement).",
          "Твоя цель: построить ordered roadmap по CEFR-прогрессии, опираясь на vault.",
          "",
          "Важные акценты для русских:",
          "- Артикли (нет в русском)",
          "- Present Perfect vs Past Simple (нет аналога)",
          "- Предлоги (перенос с русского → ошибки)",
          "- False friends / collocations",
          "- Порядок слов и интонация",
        ].join("\n")
      : [
          "Ты — куратор ОБУЧАЮЩЕГО курса по vibecoding / agentic engineering.",
          "Источник — vault с radar-items о Claude Code, AI SDK, MCP, субагентах, паттернах.",
          "Твоя цель: построить ordered roadmap от базы до frontier-паттернов.",
          "",
          "Шкала уровней: newbie → practitioner → architect → maintainer.",
          "Группы тем: Foundations, Agents, AI SDK, MCP, Patterns, Frontier, Production.",
          "Базовые темы (Claude Code CLI, первый скилл) — importance 5, popularity высокая.",
          "Niche/frontier (conformance testing, migration strategies) — importance 3-4.",
        ].join("\n");

  return `# Ты — Curriculum Curator

Сегодня ${currentDate()}.

${domainContext}

## Что ты получаешь на входе

1. **vault** — список markdown-файлов с frontmatter (YAML: source, url, title, tldr, tags, relevance, published_at) + body.
2. **количество файлов** — используй это, чтобы откалибровать popularity.

## Что ты должен вернуть

Ordered список из 8–24 тем в формате CuratorOutput. Порядок = порядок обучения: сначала базовые (prerequisites = []), потом те, которые опираются на базовые.

## Правила

1. **Каждая тема — самостоятельный 15-минутный урок**. Не делай гигантские темы типа "AI SDK целиком". Разбивай: "AI SDK streamText", "AI SDK Agent class", "AI SDK Gateway".
2. **Slug — kebab-case, понятный**. Для English: \`past-perfect\`, \`articles-basics\`. Для Vibecoding: \`claude-code-cli\`, \`ai-sdk-agent\`.
3. **importance 5** для тем которые разработчик/студент **должен знать**. importance 1 — для нишевых вещей типа "conformance testing MCP".
4. **popularity** считай как количество vault-items, которые упоминают эту тему. Если vault молчит, а тема важная — importance 5 + popularity 1 (база всё равно нужна).
5. **prerequisites** указывай slug'и ТЕМ из твоего же выхода, не чужие. Это строит граф.
6. **vaultRefs** — только те filename'ы, которые тебе передали во входе. Не выдумывай.
7. **8–24 темы total**. Меньше 8 — слишком мало для roadmap, больше 24 — перегруз.

## Конвенции
${LEARNING_CONVENTIONS}

## Контекст эпохи
${MODEL_ERA_CONTEXT}
`;
}

interface VaultEntry {
  filename: string;
  content: string;
}

function readVault(dir: string): VaultEntry[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_")
  );
  return files.map((filename) => ({
    filename,
    content: readFileSync(join(dir, filename), "utf-8").slice(0, 2500),
  }));
}

export async function runCurator(domain: LearningDomain): Promise<CuratorOutput> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY required for Curator");
  }

  const vaultDir =
    domain === "english"
      ? join(process.cwd(), "..", "autoresearch", "vault", "english-learning")
      : join(process.cwd(), "..", "autoresearch", "vault", "radar-items");

  const entries = readVault(vaultDir);
  if (entries.length === 0) {
    // Fallback: куратор построит roadmap из общих знаний модели.
    const entriesFallbackPrompt = `Vault пустой — построй roadmap из общих канонических знаний по ${domain}.`;
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    const { object } = await generateObject({
      model: openai(env.OPENAI_MODEL_DEFAULT),
      schema: CuratorOutputSchema,
      system: buildSystemPrompt(domain),
      prompt: entriesFallbackPrompt,
    });
    return object;
  }

  const prompt = [
    `Домен: ${domain}`,
    `Количество vault-items: ${entries.length}`,
    "",
    "Содержимое vault (каждый item ≤ 2500 символов):",
    "",
    ...entries.map(
      (e, i) =>
        `### ${i + 1}. ${e.filename}\n\n${e.content.trim()}\n\n---\n`
    ),
    "",
    "Построй ordered roadmap по инструкции выше.",
  ].join("\n");

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  const { object } = await generateObject({
    model: openai(env.OPENAI_MODEL_DEFAULT),
    schema: CuratorOutputSchema,
    system: buildSystemPrompt(domain),
    prompt,
  });

  return object;
}
