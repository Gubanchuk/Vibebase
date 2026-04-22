import { z } from "zod";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env";
import type { LearningDomain } from "../types";
import {
  LEARNING_CONVENTIONS,
  MODEL_ERA_CONTEXT,
  currentDate,
  englishLevelHint,
  vibecodingLevelHint,
} from "./shared";

/**
 * TEACHER — генерит 5-секционный урок под топик и уровень юзера.
 * Structured output через generateObject — ни парсинга, ни regex.
 */

const QuizItemSchema = z.object({
  prompt: z.string().min(8).max(300),
  options: z.array(z.string().min(1).max(120)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z
    .string()
    .min(10)
    .max(500)
    .describe("Почему правильный вариант правильный, + что не так с остальными"),
});

const LessonSchema = z.object({
  introMd: z
    .string()
    .min(60)
    .max(900)
    .describe(
      "Hook (2-3 абзаца). Зачем юзеру это знать — в его контексте. До 150 слов."
    ),
  conceptMd: z
    .string()
    .min(200)
    .max(2500)
    .describe(
      "Ядро темы. Объяснение + одна диаграмма или таблица в markdown. 200-500 слов."
    ),
  exampleMd: z
    .string()
    .min(100)
    .max(2000)
    .describe(
      "Один проработанный пример с кодом или диалогом. Ясно что происходит на каждом шаге."
    ),
  exerciseMd: z
    .string()
    .min(50)
    .max(700)
    .describe(
      "Задание для юзера. Конкретное, проверяемое, ≤ 3 минут на решение в голове или на бумаге."
    ),
  exerciseSolutionMd: z
    .string()
    .min(50)
    .max(1500)
    .describe("Эталонное решение + разбор, скрывается до попытки юзера."),
  quiz: z
    .array(QuizItemSchema)
    .length(3)
    .describe("Ровно 3 multi-choice вопроса. Пройти = ≥2 из 3 правильно."),
});

export type TeacherOutput = z.infer<typeof LessonSchema>;

interface TeacherInput {
  domain: LearningDomain;
  topicTitle: string;
  topicSummary: string;
  topicTags: string[];
  vaultRefs: string[];
  /** Сниппеты из vault, связанные с топиком — передаём Teacher'у как грант. */
  vaultExcerpts?: Array<{ ref: string; excerpt: string }>;
  userLevel: string | null;
}

function buildSystemPrompt(domain: LearningDomain, userLevel: string | null): string {
  const levelHint =
    domain === "english"
      ? englishLevelHint(userLevel)
      : vibecodingLevelHint(userLevel);

  const domainFlavor =
    domain === "english"
      ? [
          "Ты преподаёшь АНГЛИЙСКИЙ русскоговорящему. Ориентир — CEFR.",
          "Всё **объяснение** — на русском. Примеры и целевые слова — на английском.",
          "Где уместно — сравни с русским («в русском ты бы сказал Х, в английском Y потому что...»).",
          "Не бойся ошибок: в exercise юзеру попроси **написать по-английски 2-3 предложения** на заданную тему, в solution разбери типичные ловушки для русских.",
        ].join("\n")
      : [
          "Ты преподаёшь vibecoding / agentic engineering. Ориентир — Claude Code, AI SDK, MCP.",
          "Всё на русском, кроме кода и технических терминов.",
          "В примерах используй НАСТОЯЩИЕ API реальных версий, не псевдо-код.",
          "В exercise попроси написать короткий артефакт (скилл-файл, hook, tool-определение) или answer concrete trade-off question — так чтобы можно было проверить решение конкретно.",
        ].join("\n");

  return `# Ты — Teacher, генератор учебных лекций

Сегодня ${currentDate()}.

${domainFlavor}

## Контекст ученика
${levelHint}

## Задача

Тебе дан один топик. Ты создаёшь **ровно одну лекцию** в структурном формате.

## Структура лекции (5 секций — ВСЕ обязательные)

### 1. introMd — Hook (≤ 150 слов)
2-3 абзаца. **Зачем эту тему знать**: какая боль она закрывает, какой level-up даёт. Без воды, без «в этой лекции мы узнаем».

### 2. conceptMd — Ядро (200-500 слов)
Главное объяснение. **Идея в одну строку** первым абзацем. Потом развёртка. **Одна markdown-таблица или маркированный список** если сравнение уместно. Никаких скриншотов.

### 3. exampleMd — Проработанный пример
**ОДИН** пример. С кодом или диалогом. Пошагово: вот данные → вот что модель видит → вот что получается → почему так. Разжёвывай.

### 4. exerciseMd — Задание для юзера
Задание **проверяемое** (не размытое «подумай о X»). Юзер должен написать что-то: предложение, код, ответ. ≤ 3 минут.

### 5. exerciseSolutionMd — Эталонное решение
Правильное решение + **типичные ловушки** («новички часто пишут X, но это ошибка потому что...»). Юзер увидит это после попытки.

### 6. quiz — 3 вопроса (ровно 3!)
- Multi-choice, 4 варианта, 1 правильный.
- Первые 2 вопроса — на понимание core concept'а.
- Третий — на application / edge case.
- **explanation** обязательна: почему правильный — правильный, что не так с дистракторами.

## Важно

- **НЕ повторяй** контент между секциями. Intro не должно содержать example. Concept не должен содержать exercise.
- **Используй vault-excerpts** (если переданы) как источник фактов — цитируй, если ценно.
- **Calibrate to level**: для newbie пиши проще, для architect'a — show trade-off'ы и критикуй простые подходы.
- Квиз не должен быть trivial — хотя бы один вопрос должен требовать реального понимания.

## Конвенции
${LEARNING_CONVENTIONS}

## Контекст эпохи
${MODEL_ERA_CONTEXT}
`;
}

export async function runTeacher(input: TeacherInput): Promise<{
  lesson: TeacherOutput;
  usage: { inputTokens: number; outputTokens: number };
}> {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY required for Teacher");
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

  const excerptsBlock = (input.vaultExcerpts ?? [])
    .map((e) => `#### vault-ref: ${e.ref}\n\n${e.excerpt.slice(0, 1500)}\n`)
    .join("\n---\n");

  const userPrompt = [
    `## Топик`,
    `**Title:** ${input.topicTitle}`,
    `**Summary:** ${input.topicSummary}`,
    `**Tags:** ${input.topicTags.join(", ") || "—"}`,
    "",
    excerptsBlock
      ? [
          "## Vault-excerpts (источники знания)",
          "",
          excerptsBlock,
        ].join("\n")
      : "## Vault-excerpts\n\nНет — опирайся на каноничное знание темы.",
    "",
    "Сгенерируй лекцию по шаблону 5 секций + 3 quiz-items.",
  ].join("\n");

  const result = await generateObject({
    model: openai(env.OPENAI_MODEL_DEFAULT),
    schema: LessonSchema,
    system: buildSystemPrompt(input.domain, input.userLevel),
    prompt: userPrompt,
  });

  return {
    lesson: result.object,
    usage: {
      inputTokens: result.usage?.inputTokens ?? 0,
      outputTokens: result.usage?.outputTokens ?? 0,
    },
  };
}
