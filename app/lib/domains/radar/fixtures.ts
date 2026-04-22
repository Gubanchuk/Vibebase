import type { RadarItemView } from "./types";

/**
 * Radar seed items — 24 real entries drawn from `autoresearch/vault/radar-items/`
 * (WebSearch run 2026-04-22). Each item has:
 *   - `tldr` — 2–4 sentence card teaser
 *   - `summaryMd` — 200–400 word Russian write-up для internal detail page
 *   - `url` — real source URL, shown at the bottom of the detail page
 *
 * When autoresearch syncs to Supabase, these get replaced by live data;
 * until then they serve as a faithful snapshot that tells the whole story
 * in Russian without requiring the user to follow external links.
 */

function iso(dateStr: string): string {
  return new Date(dateStr + "T12:00:00.000Z").toISOString();
}

const SEED: RadarItemView[] = [
  // ─── STRONG ──────────────────────────────────────────────────────────────
  {
    id: "r_opus_4_7_ga",
    source: "anthropic-blog",
    url: "https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7",
    title: "Claude Opus 4.7 — релиз, SWE-bench Pro 64.3%",
    tldr:
      "Anthropic выкатила Opus 4.7 16 апреля 2026. На реальных инженерных задачах (SWE-bench Pro) модель показывает 64.3% — самый высокий публичный результат. В Claude Code появилась команда `/ultrareview`.",
    summaryMd: `## Что произошло

16 апреля 2026 Anthropic официально выпустила Claude Opus 4.7 — свою самую
капабельную на сегодня модель. Основной заход релиза — резкий скачок
в кодинг-бенчмарках.

## Ключевые цифры

- **SWE-bench Verified**: 87.6% (было 80.8% у 4.6)
- **SWE-bench Pro**: 64.3% (было 53.4%) — лидер среди всех публичных моделей на реальных инженерных задачах, обгоняет GPT-5.4 (57.7%) на 6.6 пункта
- **CursorBench**: 70% (+12 над 4.6)
- **Production-task completion**: в 3 раза больше решённых задач vs 4.6

## Что нового

- **1M tokens context** + **128k max output** — как у 4.6
- **Adaptive thinking** сохранён
- Новый уровень усилий **\`xhigh\`** между \`high\` и \`max\` — тонкая
  настройка trade-off'а «рассуждение vs латенси»
- В Claude Code появилась команда **\`/ultrareview\`** — запускает
  выделенную ревью-сессию, которая ищет баги и design-проблемы

## Что это значит для нас

Если используешь Opus в агент-пайплайнах, 4.7 — прямой drop-in
replacement. Особенно хорош для задач с неоднозначными спеками или
многофайловыми рефакторами.

Для cost-sensitive задач (проверки, code-review) — по-прежнему Sonnet
или Haiku достаточно и дешевле.

GitHub в тот же день добавил Opus 4.7 в Copilot — самая быстрая
ротация моделей в их истории.
`,
    tags: ["opus-4", "claude-code", "benchmarks", "coding"],
    publishedAt: iso("2026-04-16"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_claude_code_skills_2",
    source: "community-blog",
    url: "https://perevillega.com/posts/2026-04-01-claude-code-skills-2-what-changed-what-works-what-to-watch-out-for/",
    title: "Claude Code Skills 2.0 — что поменялось",
    tldr:
      "Скиллы стали мини-агентами: спавнят изолированных субагентов со своим контекстом, поддерживают live-данные через shell-хуки, и тестируются через evals. Крупнейший апдейт Claude Code за несколько месяцев.",
    summaryMd: `## Коротко

Skills 2.0 превратила скиллы из «продвинутых промптов» в полноценных
**мини-агентов** с собственной изоляцией и инструментарием.

## Три ключевых изменения

### 1. Изолированные субагенты

Раньше скилл исполнялся в контексте основного агента — делил его
историю, его модель, его tool allowlist. Теперь каждый скилл **спавнит
свой субагент** с отдельным окном контекста. Это значит:

- главный контекст не раздувается
- можно параллелить 5+ скиллов одновременно
- failure одного скилла не отравляет главный тред

### 2. Live-данные через shell

До вызова скилла можно прогнать shell-команду, и её stdout уйдёт в
промпт скилла **до того**, как Claude его увидит. Практический пример:
\`git diff\` впрыскивается в скилл «review-the-diff» автоматически,
без участия модели.

### 3. Evals через skill-creator

Мета-скилл \`skill-creator\` теперь может тестировать твой скилл:
прогоняешь его на наборе тестовых промптов, а skill-creator оценивает
вывод по твоим критериям. Это **регрессионные тесты для промптов** —
фича, которой не хватало.

## Практический вывод

Этот релиз переоткрывает вопрос: наши шесть English-режимов — это
отдельные system-промпты или шесть скиллов? Как скиллы они получают
изоляцию и evals, но добавляют сложность. Для MVP оставим как
prompt-файлы; как только появится потребность в tool allowlist
per-режим (Flashcards + spaced-repetition store) — конвертируем.
`,
    tags: ["claude-code", "skills", "subagents", "eval"],
    publishedAt: iso("2026-04-01"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_claude_code_advanced_patterns",
    source: "community-blog",
    url: "https://www.trensee.com/en/blog/explainer-claude-code-skills-fork-subagents-2026-03-31",
    title: "Claude Code advanced patterns — skills, fork, subagents",
    tldr:
      "Разбор комбинации трёх фичей Claude Code: скиллы как переиспользуемые возможности, `/fork` для ветвления сессии с сохранением контекста, субагенты для изолированного выполнения задач.",
    summaryMd: `## Контекст

Большинство пользователей Claude Code берут одну-две фичи и не видят,
как они стекаются. Эта статья — об этом стеке.

## Три примитива

### Skills — переиспользуемые паки возможностей
Лежат в \`.claude/skills/*.md\`, диспетчеризуются автоматически по
\`description\`. Сохраняют знание: «как делать X правильно в этом
репозитории».

### /fork — ветвление сессии
Сохраняет текущее состояние, открывает новую ветку сессии, потом
можно вернуться. Используется когда нужно попробовать рискованный
подход, не потеряв контекст планирования.

### Subagents — изолированное выполнение
\`.claude/agents/*.md\` — отдельные агенты со своим системным
промптом, своим tool allowlist, своим контекстом.

## Комбо-рецепт

Настоящая ценность когда все три работают вместе:

1. **Главный тред планирует** задачу, раскладывает на шаги
2. **\`/fork\`** фиксирует план как точку возврата
3. **Субагент исполняет** (с узким allowlist, коротким брифом)
4. **Главный тред получает** структурный результат, идёт дальше

Это, по сути, «Spec → Plan → Execute» декомпозиция, которую
формализует Superpowers-плагин — но на уровне низкоуровневых
примитивов.

## Применимость

Наш проект следует этой философии: skills в \`.claude/skills/\` — для
повторяющихся паттернов (pre-push, autoresearch), subagents — для
локальных изоляций (code-reviewer, security-scanner), fork — для
экспериментов внутри текущей задачи.
`,
    tags: ["claude-code", "skills", "subagents", "patterns"],
    publishedAt: iso("2026-03-31"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_ai_sdk_6",
    source: "vercel-changelog",
    url: "https://vercel.com/blog/ai-sdk-6",
    title: "Vercel AI SDK 6 — Agents, tool approval, DevTools, MCP",
    tldr:
      "В AI SDK 6 появился класс `Agent` для многоразового использования, `ToolLoopAgent`, human-in-the-loop approval через `useChat`, полная поддержка MCP, reranking, image editing и DevTools для дебага.",
    summaryMd: `## Что в релизе

AI SDK 6 — первый major-релиз с SDK 5, и он вводит **v3 Language Model
Specification**. В отличие от SDK 5, большинству существующих
пользователей миграция почти не нужна.

## Новые примитивы

### Agent — переиспользуемые персоны

\`\`\`ts
const tutor = new Agent({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: 'You are a patient English tutor...',
  tools: { lookupWord, pronunciationGuide },
})

// Вызываешь из любой точки кода:
const { text } = await tutor.generate({ messages })
\`\`\`

Раньше приходилось таскать model + instructions через каждый
\`streamText\`-вызов. Теперь декларация один раз, использование везде.

### ToolLoopAgent

Автоматический loop «модель → tool call → tool result → модель», до
указанного \`maxSteps\` или до terminal-условия.

### Execution Approval (HITL)

Помечаешь чувствительные tools как требующие явного одобрения. На
клиенте \`useChat\` получает \`toolApprovalRequest\`, рендеришь
Approve/Reject, tool резюмируется после клика.

## Остальное

- **Полная поддержка MCP** — можно подключать MCP-серверы как tools
- **Reranking** — для RAG-пайплайнов
- **Image editing** — multi-modal
- **DevTools** — React-компонент для live-инспекции агент-ранов

## Что это значит для нас

Наш \`AiKernel\` интерфейс хорошо ложится на \`Agent\`-абстракцию.
Когда подключим Gateway, каждый из 6 English-режимов станет
отдельным Agent-инстансом, а \`AiKernel.stream()\` под капотом будет
звать \`agent.stream()\`. Для клиентского кода ничего не меняется.
`,
    tags: ["ai-sdk", "agents", "tool-use", "mcp", "gateway"],
    publishedAt: iso("2026-03-15"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_mcp_roadmap_2026",
    source: "mcp-blog",
    url: "https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/",
    title: "The 2026 MCP roadmap — enterprise-grade plumbing",
    tldr:
      "MCP вырос с 2M до 97M SDK-скачиваний в месяц за 16 месяцев. В 2026 фокус на четыре направления: enterprise readiness, масштабируемость, server discoverability, конформанс-тестирование.",
    summaryMd: `## Цифры роста

С момента запуска в ноябре 2024 до марта 2026 Model Context Protocol
прошёл путь от «внутреннего эксперимента Anthropic» до 97 миллионов
SDK-скачиваний в месяц. Принят OpenAI, Google, Microsoft, AWS,
Cloudflare. В декабре 2025 Anthropic **передала проект в Agentic AI
Foundation** под Linux Foundation — теперь это нейтральный стандарт.

Forrester прогнозирует, что 30% enterprise-app вендоров запустят свои
MCP-серверы в 2026.

## Roadmap по четырём вехам

### 1. Enterprise readiness
- **Audit trails** — стандартизированное логирование tool-вызовов
- **SSO-интегрированный auth** — не только OAuth, но и IdP
- **Gateway-поведение** — предсказуемость прокси и rate-limiting
- **Configuration portability** — миграция между клиентами

### 2. Scalability
- **Stateful sessions vs load balancers** — сейчас конфликтуют с
  горизонтальным scale'ом
- **Statelessness** — новая модель сессий
- **Explicit session handling** — явные механизмы

### 3. Server discoverability
- Стандартный метаданный формат через \`.well-known\`
- Возможность видеть capabilities без живого подключения

### 4. Конформанс
- TypeScript SDK v1.27.x фокусируется на conformance, а не новых фичах
- Python SDK догоняет корректность

## Что это значит для нас

MCP переходит из «интересного эксперимента» в «скучный стандарт» — и
это именно то, что хочется от инфраструктуры. Для радара: MCP
server-релизы достойны отдельного \`mcp\`-тэга, и ожидать «больших
сюрпризов» в протоколе в 2026 не стоит.
`,
    tags: ["mcp", "agents", "standards", "infra"],
    publishedAt: iso("2026-04-10"),
    relevance: "strong",
  },
  {
    id: "r_willison_agentic_patterns",
    source: "simonw",
    url: "https://simonwillison.net/",
    title: "Simon Willison — Agentic Engineering Patterns",
    tldr:
      "Саймон Уиллисон запустил новый гайд «Agentic Engineering Patterns» — практики и паттерны для работы с кодинг-агентами вроде Claude Code и OpenAI Codex. Первые две главы вышли в феврале 2026.",
    summaryMd: `## Кто такой Уиллисон и почему это важно

Саймон Уиллисон — один из наиболее последовательных летописцев
LLM-ландшафта. Его блог за 3+ года стал канонической
референс-точкой для разработчиков, работающих с AI. Практически
каждый его гайд обрастает «де-факто стандартом» за несколько
месяцев.

## О чём новый гайд

«Agentic Engineering Patterns» — сборник практик для профессиональной
работы с кодинг-агентами. Первые две главы, опубликованные в
феврале 2026, покрывают:

- **Планирование работы с агентом** — когда начинать со спеки, когда
  с прототипа
- **Управление контекстом** — что класть в память, что в CLAUDE.md,
  что в промпт
- **Ревью вывода агента** — как читать diff, что автоматизировать
- **Композиция нескольких агентов** — когда spawn, когда fork, когда
  отдельная сессия

## Связь с другими работами

Гайд перекликается с эссе Карпаты («vibe coding is passé, теперь это
agentic engineering»): оба утверждают, что стадия «просто пиши
промпты» пройдена, и нужны структурные практики. Уиллисон даёт их в
concrete, actionable форме.

## Почему подписаться

Следующие главы публикуются по мере готовности. Best practice:
подписаться на RSS и flag'ить каждую новую главу как potential
radar item.

## Связанные эфиры

2 апреля 2026 Уиллисон выступал на Lenny's Podcast с похожим
нарративом для продуктовой аудитории. В марте читал 3-часовой
воркшоп на NICAR о применении coding-agents для data exploration.
`,
    tags: ["claude-code", "agents", "patterns", "willison"],
    publishedAt: iso("2026-02-20"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_karpathy_vibe_coding_passe",
    source: "thenewstack",
    url: "https://thenewstack.io/vibe-coding-is-passe/",
    title: "Karpathy: 'vibe coding' устарел, теперь agentic engineering",
    tldr:
      "Через год после своей же формулировки Карпаты говорит, что термин «vibe coding» обнулился. Профессиональный дефолт в 2026 — agentic engineering: 99% времени на оркестрацию, инженерное суждение на direction, а не на код.",
    summaryMd: `## Флип ровно через год

В марте 2025 Андрей Карпаты популяризовал термин «vibe coding» —
настроение, при котором ты «просто болтаешь с моделью, и она пишет
код». В марте-апреле 2026, ровно через год, он публично объявляет
термин устаревшим: «Модели стали заметно умнее. Vibe coding прошло».

## Новый термин — agentic engineering

Карпаты формулирует текущий профессиональный подход так: **99%
времени уходит на оркестрацию агентов и надзор за ними**.
Инженерное суждение применяется к направлению, к *what*, а не к
*implementation*.

## Личный флип

Декабрьский пост Карпаты раскрывает его собственные цифры:
«соотношение 80/20 (пишу сам / делегирую) флипнулось в 20/80».
То есть он больше пишет спеки и ревью, чем код.

## Почему это важно для нас

Три прямых следствия:

1. **Радар должен расширить tag-coverage** — «agentic engineering»
   становится новым зонтом. \`vibecoding\` остаётся как бренд-слово
   (наш скилл так называется), но content-критерии сдвигаются:
   больше про оркестрацию, review, oversight, и меньше про
   «AI написал код».

2. **Композиция агентов важнее одиночных промптов** — subagents,
   fork, skills, hooks становятся primary инструментарием, а не
   optional.

3. **Ожидаемый размер PR** смещается. Если раньше «закодил 50 строк
   вручную, 50 через агент», теперь — «поставил задачу, агент
   закрыл PR на 300 строк, я ревьюил». Новый bottleneck — качество
   постановки задачи и ревью.

## Контраргумент

Часть индустрии напоминает, что «vibe coding» всё ещё полезен как
mental model для non-dev стейкхолдеров. Термин не умер — сместился
в адаптированные слои.
`,
    tags: ["vibecoding", "agents", "karpathy", "workflow"],
    publishedAt: iso("2026-04-05"),
    relevance: "strong",
  },
  {
    id: "r_subagent_transcripts",
    source: "claude-code-changelog",
    url: "https://docs.claude.com/en/docs/claude-code/changelog",
    title: "Claude Code — SubagentStart/Stop хуки с транскриптом",
    tldr:
      "События SubagentStop (и новый SubagentStart) теперь содержат поля `agent_id` и `agent_transcript_path` — можно отслеживать поведение каждого субагента с полным доступом к транскрипту.",
    summaryMd: `## Что поменялось

События хуков для субагентов получили два новых поля:

- **\`agent_id\`** — уникальный идентификатор спавнутого субагента
- **\`agent_transcript_path\`** — путь к файлу с полным транскриптом
  (messages, tool calls, finish reason)

## Зачем

До этого у тебя был хук на \`SubagentStop\`, но всё, что ты знал — что
субагент завершился. Tool calls, cost, ошибки — всё невидимо.

Теперь можно:

### Observability для агент-пайплайнов

\`\`\`json
{
  "hooks": {
    "SubagentStop": [{
      "type": "command",
      "command": "cp \\"$CLAUDE_AGENT_TRANSCRIPT_PATH\\" ~/agent-log/"
    }]
  }
}
\`\`\`

И ты получаешь локальную историю всех субагентов за день.

### Per-subagent cost accounting

Читаешь транскрипт, суммируешь токены по tool-вызовам, агрегируешь —
per-subagent cost без сторонней обвязки.

### Failure forensics

Субагент упал? Читай транскрипт, смотри, на каком шаге break, какой
был tool-output, какой system-prompt — всё на месте.

## Связь с трендом

Это часть общего тренда «субагенты как first-class». Сочетается с
\`permissionMode\` per-агент и \`skills:\` авто-загрузкой.

## Применимость

Для нашего проекта пока не критично — мы не используем subagents в
приложении (они локальные). Но когда подключим Claude Code в скрипты
(auto-generated lesson с review-субагентом), этот хук станет
первой линией observability.
`,
    tags: ["claude-code", "subagents", "hooks", "observability"],
    publishedAt: iso("2026-03-15"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_permission_mode_per_agent",
    source: "claude-code-changelog",
    url: "https://docs.claude.com/en/docs/claude-code/changelog",
    title: "Claude Code — permissionMode для каждого custom agent",
    tldr:
      "В frontmatter custom-агента добавили поле `permissionMode` — можно контролировать tool-approval per-agent. Поле `skills:` авто-загружает скиллы при запуске агента.",
    summaryMd: `## Что изменилось

В YAML frontmatter файлов \`.claude/agents/*.md\` появилось два новых
поля:

### \`permissionMode\`

Принимает те же значения, что и глобальная настройка:
\`ask | acceptEdits | bypassPermissions | plan\`. Позволяет по-разному
настраивать поведение разных агентов.

### \`skills\`

Массив имён скиллов, которые автоматически загружаются в контекст
субагента при его запуске.

## Пример

\`\`\`md
---
name: refactor-legacy
description: Refactors legacy code with extreme caution
permissionMode: ask
skills: [test-verifier, type-checker]
tools: Read, Grep, Edit, Bash(npm test:*)
model: claude-opus-4-7
---

You refactor legacy code only after understanding all tests pass.
For every change, verify types first, then behaviour.
\`\`\`

И другой:

\`\`\`md
---
name: explore-codebase
description: Fast exploration of unfamiliar repos
permissionMode: acceptEdits
tools: Read, Grep, Glob
---

Build a mental model of the repo fast. No edits, no commands.
\`\`\`

## Практика

До этого permission-mode был global — либо ты за всё ask'ил, либо
всё bypass'ил. Теперь careful-агенты могут жить в строгом режиме,
а исследовательские — в свободном, в одной сессии.

## Для нас

Когда начнём использовать subagents в нашем workflow (lesson
generation + review), сможем задать:

- **\`generate-lesson\`** → \`acceptEdits\`
- **\`review-lesson\`** → \`ask\` (правки показываем пользователю
  перед коммитом)

Без этой фичи пришлось бы городить обходы через разные сессии.
`,
    tags: ["claude-code", "subagents", "permissions", "skills"],
    publishedAt: iso("2026-03-10"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_ai_sdk_agent_abstraction",
    source: "ai-sdk-docs",
    url: "https://ai-sdk.dev/docs/introduction",
    title: "AI SDK 6 — Agent абстракция для LLM-персон",
    tldr:
      "Объявляешь `new Agent({ model, system, tools })` один раз и используешь из любой точки кода. Больше не надо таскать model и instructions через каждый streamText-вызов.",
    summaryMd: `## Проблема, которую закрывает Agent

До AI SDK 6 типичный код выглядел так:

\`\`\`ts
// В /api/chat/route.ts
streamText({
  model: 'anthropic/claude-sonnet-4-6',
  system: ENGLISH_TUTOR_SYSTEM_PROMPT,
  tools: { lookupWord, pronunciationGuide },
  messages,
})

// В /api/quiz/route.ts (почти копипаста)
streamText({
  model: 'anthropic/claude-sonnet-4-6',
  system: ENGLISH_TUTOR_SYSTEM_PROMPT,
  tools: { lookupWord, pronunciationGuide },
  messages,
})
\`\`\`

Конфигурация размазана, изменения типа «поменять модель для всего
тьютора» превращаются в grep.

## Agent — декларация один раз

\`\`\`ts
// В lib/agents/english-tutor.ts
import { Agent } from 'ai'

export const englishTutor = new Agent({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: ENGLISH_TUTOR_SYSTEM_PROMPT,
  tools: { lookupWord, pronunciationGuide },
})

// В /api/chat/route.ts
const { textStream } = englishTutor.stream({ messages })

// В /api/quiz/route.ts
const { object } = await englishTutor.generate({
  messages,
  schema: QuizSchema,
})
\`\`\`

Вся конфигурация — в одном файле. Поменять модель — одна правка.

## Композиция с ToolLoopAgent

\`\`\`ts
const planner = new Agent({...})
const executor = new ToolLoopAgent({ maxSteps: 10 })

const result = await planner.generate({ messages })
await executor.run({ initial: result.text })
\`\`\`

Один даёт план, второй исполняет.

## Маппинг на наш код

Наши 6 English-режимов один-в-один ложатся на 6 Agent-инстансов.
\`AiKernel.stream()\` под капотом будет звать \`agent.stream()\` —
для клиентского кода ничего не меняется.
`,
    tags: ["ai-sdk", "agents", "patterns"],
    publishedAt: iso("2026-04-12"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_ai_sdk_tool_approval",
    source: "ai-sdk-docs",
    url: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling",
    title: "AI SDK — human-in-the-loop approval для tools",
    tldr:
      "Можно пометить чувствительные tools как требующие явного подтверждения. Когда модель пытается их вызвать, `useChat` выдаёт `toolApprovalRequest`, UI рендерит Approve/Reject.",
    summaryMd: `## Зачем

Не все tools равны. Один вернёт погоду — ок, другой удалит файл или
зальёт платёж — тут хочется, чтобы человек посмотрел параметры прежде,
чем позволить.

До AI SDK 6 это приходилось делать **в коде tool'а**: проверить userId,
показать confirm-модалку, хранить state — громоздко.

## Как работает сейчас

### Декларация

\`\`\`ts
const deleteFile = tool({
  description: 'Permanently delete a file at the given path.',
  inputSchema: z.object({ path: z.string() }),
  requiresApproval: true,
  execute: async ({ path }) => {
    await fs.rm(path)
    return { deleted: path }
  },
})
\`\`\`

### UI автоматически

На клиенте \`useChat\` теперь выдаёт \`toolApprovalRequest\`:

\`\`\`tsx
const { messages, toolApprovals, approve, reject } = useChat()

{toolApprovals.map(req => (
  <ApprovalCard key={req.id}>
    <code>{req.tool}({JSON.stringify(req.input)})</code>
    <button onClick={() => approve(req.id)}>Выполнить</button>
    <button onClick={() => reject(req.id)}>Отменить</button>
  </ApprovalCard>
))}
\`\`\`

Когда пользователь жмёт Approve, tool резюмируется. Reject —
возвращает модели сообщение «отклонено», и она продолжает без него.

## Где применять у нас

1. **Lesson Generation** — tool «сохранить в Supabase» может быть
   approval-required: пользователь видит preview и кнопку Сохранить.
2. **Budget override** — tool «потратить больше per-call лимита» —
   approval через явный клик.
3. **Journal delete** — если сделаем AI-помощника для чистки дневника.

## Trade-off

Approval прерывает flow. Пользователи не любят модалки. Применяй
только к действиям, которые трудно откатить.
`,
    tags: ["ai-sdk", "tool-use", "safety", "ux"],
    publishedAt: iso("2026-04-14"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_ai_sdk_devtools",
    source: "ai-sdk-docs",
    url: "https://ai-sdk.dev/docs/introduction",
    title: "AI SDK DevTools — inspector для агент-ранов",
    tldr:
      "React-компонент `<AIDevTools />` рендерит live-инспекцию AI SDK-рана прямо в dev-окружении: сообщения, tool calls, usage, latency per step.",
    summaryMd: `## Что это

\`<AIDevTools />\` — небольшой React-компонент, добавляемый в приложение
**только в dev-режиме**. Показывает живую панель со всем, что
происходит в AI SDK-ранах: от первого запроса до \`onFinish\`.

## Установка

\`\`\`tsx
// app/providers.tsx
import { AIDevTools } from '@ai-sdk/devtools'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && <AIDevTools />}
    </>
  )
}
\`\`\`

## Что видно

- **Сообщения** — все system/user/assistant turns с токен-счётами
- **Tool calls** — аргументы, результаты, длительность
- **Usage** — tokens in/out per step
- **Latency** — time-to-first-token, полное время
- **Errors** — если модель retry'нулась или tool упал

Всё в реальном времени, без перезагрузки страницы, без консольных
\`console.log\`'ов.

## Зачем

Раньше отладка выглядела так:

1. Добавить \`console.log\` в route handler
2. Перезагрузить страницу, отправить сообщение
3. Терминал → скроллить JSON
4. Иногда понять что-то
5. Повторить

С DevTools — просто открываешь панель и видишь.

## Применимость у нас

Да, сразу после подключения Gateway. Полезно для отладки:

- Почему ответы обрываются раньше \`maxOutputTokens\`?
- Почему \`onFinish\` не срабатывает в какой-то сессии?
- Сколько токенов реально съедает \`system\`-промпт?
- Latency p95 на Sonnet vs Haiku?

## Caveat

DevTools mount'ится только в dev. В production не подвешивать.
`,
    tags: ["ai-sdk", "tooling", "debugging", "dx"],
    publishedAt: iso("2026-04-08"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_skills_docs",
    source: "claude-docs",
    url: "https://code.claude.com/docs/en/skills",
    title: "Extend Claude with skills — обновлённый официальный гайд",
    tldr:
      "Документация по скиллам полностью переписана под Skills 2.0. Разобрана структура скилла, конвенции frontmatter, логика триггеров, мета-скилл skill-creator, evals, модель изолированного-субагента.",
    summaryMd: `## Что в документации

Anthropic полностью переписала страницу «Extend Claude with skills» в
апреле 2026 под апдейт Skills 2.0. Это теперь **канонический источник**
того, как писать скиллы.

## Структура документа

### 1. Что такое скилл и зачем он
Введение в концепцию: скилл = переиспользуемый паттерн, завёрнутый в
файл с метаданными. Отличается от CLAUDE.md тем, что активируется по
контексту, а не постоянно в промпте.

### 2. Конвенции frontmatter
- \`name\` — обязательно, уникально
- \`description\` — обязательно, это классификатор триггера
- \`tools\` — опциональный allowlist
- \`model\` — опциональный override
- \`skills\` — массив зависимостей

### 3. Логика триггеров
Как модель решает, звать скилл или нет. Ключевой инсайт:
\`description\` — это не help-текст, это классификатор. Пиши так,
чтобы исключало неподходящие кейсы.

### 4. Изолированный-субагент
С Skills 2.0 каждый вызов скилла спавнит свой контекст. Это меняет
подход к промпту — он должен быть самодостаточным.

### 5. Skill-creator и evals
Мета-скилл \`skill-creator\` теперь умеет запускать твой скилл на
наборе тестовых промптов и проверять output против твоих критериев.
Регрессионные тесты для промптов.

### 6. Примеры
Около 10 примеров скиллов — от простых (pre-push) до сложных
(multi-step autoresearch).

## Для нас

Прямая ссылка на каноническое определение. Когда будем писать
собственный набор скиллов для проекта, этот гайд — первый источник.
`,
    tags: ["claude-code", "skills", "docs"],
    publishedAt: iso("2026-04-15"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_reddit_skill_files_pattern",
    source: "reddit-claudeai",
    url: "https://www.reddit.com/r/ClaudeAI/",
    title: "Паттерн: one-shot промпт → multi-step скилл",
    tldr:
      "Тред с высокими upvotes (~1.2k) о том, как повторяющийся промпт переделать в .claude/skills/*.md файл с явными условиями триггера, tool allowlist и шагами верификации.",
    summaryMd: `## Контекст треда

Пост на r/ClaudeAI получил ~1.2k upvotes. Тема: «что я заметил,
переписав свои 10 любимых промптов в скиллы».

## Основной инсайт

«Просто вставить промпт снова» работает хуже, чем «вынести промпт в
скилл, даже если он простой». Почему:

- **Явная структура** — frontmatter форсит декомпозицию на
  trigger / protocol / verification
- **Авто-триггер** — не надо вспоминать, когда звать
- **Tool allowlist** — уменьшает шанс, что модель сделает что-то
  левое

## Распределённый паттерн

Автор поста описывает процесс превращения промпта в скилл:

1. **Собери 3+ примера**, где промпт работал
2. **Извлеки общий scaffolding** — какие шаги всегда?
3. **Напиши Goal / Trigger / Steps / Verify секции**
4. **Сохрани как \`.claude/skills/my-skill.md\`**
5. **Протестируй через skill-creator evals**

Это буквально то, что делает Skills-creator мета-скилл, но автор
треда пришёл к этому из first principles — что подтверждает метод.

## Комментарии

- «Мои скиллы стали тестами моего же понимания задачи» — если не
  можешь описать trigger чётко, значит и в голове неясно
- «Переход на скиллы сократил мои CLAUDE.md в 3 раза» — рецепты
  уехали в скиллы
- «У меня теперь 40 скиллов, и самый важный — этот мета-промпт
  ‘напиши-скилл’»

## Применимость

Наш проект уже следует этому паттерну. Когда подключим Claude Code
в dev-workflow (build, test, pre-push), каждый повторяющийся
паттерн будет становиться скиллом.
`,
    tags: ["claude-code", "skills", "patterns", "community"],
    publishedAt: iso("2026-04-18"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_alexop_full_stack",
    source: "community-blog",
    url: "https://alexop.dev/posts/understanding-claude-code-full-stack/",
    title: "Claude Code full stack — MCP, skills, subagents, hooks",
    tldr:
      "End-to-end explainer по четырём примитивам Claude Code: MCP как транспорт инструментов, скиллы как паки возможностей, субагенты как изоляция, хуки как точки перехвата.",
    summaryMd: `## Зачем этот пост

Большинство пользователей Claude Code берут одну-две фичи и не видят
картину целиком. Этот пост систематически раскладывает четыре
примитива и показывает, как они композируются.

## Четыре примитива

### MCP — транспорт инструментов

Model Context Protocol — как инструменты (Slack API, Postgres, GitHub)
**доставляются** в модель. Стандартизированный формат описания tools.

### Skills — паки возможностей

\`.claude/skills/*.md\` — переиспользуемые паттерны «как делать X».
Автоматически триггерятся по \`description\`. Живут в репозитории.

### Subagents — изоляция выполнения

\`.claude/agents/*.md\` — отдельные агенты с собственным промптом,
tool allowlist и моделью. Позволяют изолировать cost, risk,
parallelism.

### Hooks — детерминированные точки перехвата

JSON-конфиг в \`settings.json\`. Shell-команды, запускающиеся на
события харнесом, а не моделью. Надёжны — модель не может их
пропустить.

## Как они стекаются

Один типичный pipeline:

1. **Скилл** «refactor-this-module» активируется по контексту
2. Скилл спавнит **субагент** с узким allowlist (Read, Edit, Bash(test))
3. Субагент использует **MCP-сервер** для доступа к type-definitions
4. **PostToolUse хук** авто-форматирует каждый Edit через Prettier
5. **SubagentStop хук** копирует транскрипт в локальный лог

Все четыре примитива работают вместе, ни один не дублирует другой.

## Почему стоит прочитать

Если ты использовал только 2 из 4 — этот пост превратит твой workflow
в полноценный агент-пайплайн. Для onboarding'а новых разработчиков в
Claude Code — это №1 recommendation.
`,
    tags: ["claude-code", "mcp", "skills", "subagents", "hooks", "primer"],
    publishedAt: iso("2026-03-25"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },
  {
    id: "r_danilchenko_subagents_guide",
    source: "community-blog",
    url: "https://www.danilchenko.dev/posts/claude-code-subagents/",
    title: "Claude Code subagents — практический гайд",
    tldr:
      "Живые примеры: когда спавнить субагент, как рассчитать бюджет контекста, как структурировать промпт делегирования, как инспектировать транскрипт. Три конкретных паттерна.",
    summaryMd: `## Формат поста

Один практикующий разработчик делится опытом 6 месяцев работы с
субагентами в Claude Code. Без маркетинга — с количественными
наблюдениями.

## Когда спавнить субагент

Чеклист из поста:

1. Задача повторяется ≥3 раз? → скорее всего надо.
2. Нужен свой tool allowlist? → точно надо.
3. Контекст главного тянется >50k tokens? → уже надо было.
4. Можно описать input/output в 3 строках? → готов к декомпозиции.

Если меньше 3 из 4 пунктов — оставайся в главном.

## Бюджет контекста

Автор делит субагенты на три класса:

- **Light** (≤8k input) — one-shot research задачи
- **Medium** (8–32k) — анализ файлов, review диффов
- **Heavy** (>32k) — полноценная подзадача с внутренним планом

Правило: бюджет субагента ≤ 40% бюджета главного.

## Структура промпта делегирования

«Золотой стандарт» от автора:

\`\`\`
You are a [ROLE]. Your task: [ONE SENTENCE].

CONTEXT (provided by parent):
- ...

CONSTRAINTS:
- ...

OUTPUT FORMAT:
- ...
\`\`\`

Критически важно: передавать **минимум контекста** (только то, что
нужно), **явно описать формат результата** (иначе придётся парсить).

## Три конкретных паттерна

### 1. Fan-out research
Главный спавнит 5 параллельных субагентов, каждый исследует свою
часть кодабазы. Главный агрегирует.

### 2. Parallel code-review
PR с 10 файлами — 3 субагента-ревьюера. Агрегирующий субагент
сливает отчёты, дедуплицирует замечания.

### 3. Two-phase refactor
Фаза 1 — \`analyze-refactor\` возвращает план.
Фаза 2 — \`execute-refactor\` применяет план. Между ними человек
ревьюит.

## Применимость

Прямые кандидаты в нашем workflow:

- **Autoresearch run** — parent + N scout-субагентов по источникам
- **Lesson review** — review-субагент проверяет качество
- **Weekly radar sync** — main + HTTP-fetch субагенты
`,
    tags: ["claude-code", "subagents", "patterns"],
    publishedAt: iso("2026-03-05"),
    relevance: "strong",
    relatedSkill: "vibecoding",
  },

  // ─── MODERATE ─────────────────────────────────────────────────────────────
  {
    id: "r_github_opus_4_7",
    source: "github-changelog",
    url: "https://github.blog/changelog/2026-04-16-claude-opus-4-7-is-generally-available/",
    title: "GitHub Copilot добавил Opus 4.7 в same-day ship",
    tldr:
      "GitHub Copilot добавил Opus 4.7 в model picker для Pro и Business в тот же день, что и релиз Anthropic. Самая быстрая ротация моделей в истории Copilot.",
    summaryMd: `## Что произошло

16 апреля 2026, в день релиза Opus 4.7, GitHub добавил модель в
model-picker Copilot для Pro и Business планов. Раньше такие ротации
занимали 2–4 недели.

## Почему быстро

Судя по смежным инсайдер-нотам, Anthropic и GitHub шли параллельно
по pre-release тестированию. Означает:

- Координация релиз-тайминга между провайдерами и крупными
  интеграторами становится нормой
- Copilot Pro-пользователи получают flagship-модель сразу

## Цена

Copilot трекает цену Anthropic 1:1 для Opus 4.7: \$15 input /
\$75 output per million tokens.

## Сигнал для радара

Это pattern-wide событие, не разовое: можно ожидать, что следующие
релизы Anthropic / OpenAI / Google будут немедленно доступны в
большинстве IDE-коннекторов.

## Применимость для нас

Если в будущем дадим users выбирать между Opus 4.7 и более дешёвыми
моделями через Gateway, можно быть уверенными: на момент выхода новой
модели она уже доступна. Не придётся ждать weeks.
`,
    tags: ["opus-4", "copilot", "github", "tooling"],
    publishedAt: iso("2026-04-16"),
    relevance: "moderate",
  },
  {
    id: "r_reload_plugins",
    source: "claude-code-changelog",
    url: "https://docs.claude.com/en/docs/claude-code/changelog",
    title: "Claude Code — /reload-plugins без рестарта",
    tldr:
      "Команда `/reload-plugins` подтягивает скиллы и агенты без рестарта CLI. Команда `/agents` получила tabbed UI: Running (живые субагенты) и Library (доступные).",
    summaryMd: `## Что поменялось

Две QoL-фичи из марта 2026:

### \`/reload-plugins\`

Раньше, если ты правил \`.claude/skills/foo.md\`, приходилось
перезапускать CLI, чтобы Claude Code увидел изменения.

Теперь \`/reload-plugins\` перечитывает все плагины, скиллы и агенты
прямо в текущей сессии. Цикл «правь скилл → тестируй» сократился с
~30 секунд до ~2.

### Tabbed \`/agents\` UI

Два таба:
- **Running** — субагенты в работе, с кнопками «View instance» и
  «Terminate»
- **Library** — все доступные, с кнопкой «Run agent»

## Почему мелко, но важно

Классическая «тысячи маленьких улучшений». Сами по себе не меняют
продукт, но вместе делают CLI-опыт сильно приятнее. Итерация по
скиллам была одной из главных болей — теперь её нет.

## Связь с общим развитием

Сочетается с subagent transcripts (Running позволяет читать лог) и
per-agent permissionMode (видно настройки в Library). Каждый релиз
Claude Code добавляет observability в субагенты.

## Для нас

Если будем разрабатывать свои скиллы/агенты для проекта, итерация
станет быстрой.
`,
    tags: ["claude-code", "skills", "ux"],
    publishedAt: iso("2026-03-28"),
    relevance: "moderate",
  },
  {
    id: "r_mcp_127_release",
    source: "mcp-blog",
    url: "https://www.contextstudios.ai/blog/mcp-ecosystem-in-2026-what-the-v127-release-actually-tells-us",
    title: "MCP v1.27 — «скучный стандарт» в деле",
    tldr:
      "TypeScript SDK v1.27.x фокусируется на conformance-тестировании и SEP-governance, а не на новых фичах. Python SDK добивает корректность. Протокол стабилизируется.",
    summaryMd: `## Контекст

Большая часть 2024–2025 в MCP — это «добавим ещё одну фичу в
протокол». Вторая половина 2025 и весь 2026 — другая история:
**наводить порядок в том, что уже есть**.

## Что в v1.27.x

### TypeScript SDK

- **Conformance tests** — стандартизированный набор, который
  любой сервер обязан проходить
- **SEP (Spec Enhancement Proposal) workflow** — формальный
  процесс изменений в протокол
- **Deprecation policy** — сколько минорных версий живёт
  устаревшее API до удаления

### Python SDK

- Закрытие ~30 багов, накопившихся за год активного роста
- Гармонизация error messages с TypeScript

## Нет новых протокольных фич

Это **осознанное решение**. Автор поста: «Это то, как выглядит
протокол, переходящий от "интересного эксперимента" к "скучному
стандарту" — и скучный стандарт это именно то, чем должна быть
инфраструктура».

## Что это значит для нас

Если бы мы встраивали MCP-интеграцию сегодня — делали бы это против
актуальной спеки в надежде, что «всё как-нибудь сработает». После
v1.27.x — совсем другая уверенность: ожидай обратной совместимости
на годы.
`,
    tags: ["mcp", "standards", "infra"],
    publishedAt: iso("2026-03-20"),
    relevance: "moderate",
  },
  {
    id: "r_willison_lennys_podcast",
    source: "simonw",
    url: "https://simonwillison.net/",
    title: "Willison на Lenny's Podcast — agentic engineering для PM'ов",
    tldr:
      "Саймон Уиллисон сходил на Lenny Rachitsky объяснять agentic engineering продуктовой аудитории. Главный takeaway: «относись к агенту как к новичку-джуну», пиши спеку.",
    summaryMd: `## Кто слушает этот подкаст

Lenny Rachitsky — бывший продукт-менеджер Airbnb, его подкаст слушают
в основном PMs и продуктовые лиды. То есть **не разработчики**, а
люди, которые распределяют инженерные ресурсы.

## Почему это важно

В продуктовой индустрии до сих пор есть разрыв в понимании: что
реально меняется в продуктивности инженерных команд от AI.

Willison — один из немногих, кто систематизирует эти изменения без
гипа и без панических атак. Его появление на продуктовом подкасте —
хорошо откалиброванный мост.

## Главные takeaways

### «Относись к агенту как к новичку-джуну»

Пиши **спеку**, не код. Чёткий input, чёткий expected output,
список того, что надо проверить.

### Multi-agent pipelines — реальность

Willison показывает рабочие setups «main agent делегирует 3
специализированным subagent'ам».

### «Автономия без ревью — это способ зашипить мусор»

Не слепо доверять output'у агента. Читать diff. Критически важно в
эпоху, когда соблазн «просто нажми accept» велик.

## Что это для нас

Наша платформа должна быть **прозрачной**: каждый AI-вывод должен
быть видимым и ревьюабельным. Влияет на UX:
- «Mark complete» у урока — юзер явно ревьюит
- Cost dashboard — видишь, куда ушли деньги
- Backlinks в журнале — видишь, откуда пошла идея
`,
    tags: ["claude-code", "agents", "workflow", "podcasts"],
    publishedAt: iso("2026-04-02"),
    relevance: "moderate",
  },
  {
    id: "r_willison_claude_cowork",
    source: "simonw",
    url: "https://simonwillison.net/",
    title: "Первые впечатления от Claude Cowork",
    tldr:
      "Claude Cowork — броузерный general agent от Anthropic (не Claude Code). Работает с веб-тулами и документами. Хорош в research и drafting, медленнее на code-heavy задачах.",
    summaryMd: `## Что такое Claude Cowork

Anthropic запустила два продукта в начале 2026:

1. **Claude Code** — dev-специфический агент для кода и файловой
   системы
2. **Claude Cowork** — «бытовой» агент для веб-тулов, документов,
   email, задач

Cowork — ответ Anthropic на ChatGPT Tasks, Gemini's Deep Research.

## Что Willison отметил

### Сильные стороны

- **Research** — прекрасен в многошаговом веб-поиске, синтезирует
  10–20 источников в структурный отчёт
- **Document drafting** — пишет черновики постов, писем, планов
- **Web-based tools** — работает с Google Docs, Notion, Linear
  нативно

### Слабости

- **Медленнее Claude Code** на code-heavy задачах — 3–5× дольше
- **Меньше control** — нельзя дать узкий tool allowlist, меньше
  transparency про tool calls

## Позиционирование

Два агента — две работы. Путать их — ошибка.
- Claude Code — для разработчика в терминале
- Claude Cowork — для менеджера в браузере

## Для нашего радара

Наш радар отслеживает vibecoding — это Claude Code-centric мир.
Cowork — смежное пространство, но не наше. Важно сразу понимать,
о каком агенте идёт речь.
`,
    tags: ["claude", "agents", "willison"],
    publishedAt: iso("2026-01-12"),
    relevance: "moderate",
  },
  {
    id: "r_verdent_opus_coding",
    source: "community-blog",
    url: "https://www.verdent.ai/guides/what-is-claude-opus-4-7",
    title: "Opus 4.7 — что реально поменялось для кодинг-агентов",
    tldr:
      "Третьесторонний анализ Opus 4.7 под coding-agent workloads. Ключевой вывод: в 3 раза больше production-задач решено vs 4.6. Новый `xhigh` даёт Opus-рассуждение без max-latency.",
    summaryMd: `## Фокус поста

Не просто бенчмарки — разбор **реальных coding-agent сценариев** на
Opus 4.7. Автор гоняет модель на 40+ задач из своих клиент-проектов.

## Количественный вывод

- **Production-task completion: 3×** по сравнению с 4.6 — полностью
  завершённые задачи без человеческого вмешательства
- **Multi-file refactoring** — ~2× скорость
- **Ambiguous specs** (задачи где нужно задавать вопросы) —
  практически без regression'а

## Качественное про новый \`xhigh\`

> «Это почти Opus-level рассуждение без full-max латенси.
> Практический sweet-spot для большинства задач, которые раньше
> требовали max.»

## Decision heuristic

| Задача | Модель | Уровень |
|--------|--------|---------|
| Multi-file refactor, неоднозначная спека | Opus 4.7 | xhigh |
| Well-scoped code-gen | Sonnet 4.6 | medium |
| Code review, verification | Sonnet 4.6 | high |
| Mechanical transformations | Haiku 4 | low |
| Structured output extraction | Haiku 4 | low |

## Caveats

- **Benchmark contamination** — неизвестно, не тренировали ли модель
  на публичных SWE-bench задачах
- **Sample size** — 40 задач недостаточно для статистики
- **Prompt quality** — всё на хорошо-написанных спеках

## Применимость у нас

Прямо ложится в наш choice-of-model flow:

- \`english.*\` — Sonnet 4.6 default
- \`english.mistakes\` — Haiku 4
- \`skills.generate-lesson\` — Sonnet + high, или Opus 4.7 xhigh
`,
    tags: ["opus-4", "claude-code", "benchmarks", "cost-analysis"],
    publishedAt: iso("2026-04-16"),
    relevance: "moderate",
  },
  {
    id: "r_vellum_opus_benchmark",
    source: "vellum-blog",
    url: "https://www.vellum.ai/blog/claude-opus-4-7-benchmarks-explained",
    title: "Vellum — бенчмарки Opus 4.7 в деталях",
    tldr:
      "Vellum сделал подробный разбор цифр Opus 4.7. CursorBench 70%, SWE-bench Pro 64.3% (vs GPT-5.4 57.7%), production-task completion утроилось. С оговорками про contamination и cost-scaling.",
    summaryMd: `## Про источник

Vellum — инструмент для production-deployment LLM'ов. Нейтральная
позиция в benchmarks-анализе — не продают конкретную модель.

## Цифры

- **SWE-bench Verified**: 87.6% (+6.8 vs 4.6)
- **SWE-bench Pro**: 64.3% (+10.9 vs 4.6) — лидер
- **CursorBench**: 70% (+12 vs 4.6)
- **Production-task completion**: 3× vs 4.6
- **MMLU-Pro**: 82.1%
- **GPQA-Diamond**: 67%

## Сравнение с GPT-5.4

На SWE-bench Pro Opus 4.7 ведёт на 6.6 пунктов. Значит: 4.7 решает
**больше половины** задач, где GPT-5.4 ошибается.

## Cost-scaling caveats

Цифры даны на **максимальном effort level**. Для большинства реальных
задач используется \`medium\` или \`high\`, где разрыв меньше. На
\`xhigh\` сохраняется большинство бенчмарк-приростов, но cost ~50%
от max — реальный sweet-spot.

## Benchmark contamination

Открытый вопрос индустрии: сколько публичных SWE-bench задач модели
видели в тренировке? Vellum предлагает смотреть на **non-public
evals** как primary источник доверия.

## Для нас

Главная метрика — **cost per completed task**. Opus 4.7 дороже Sonnet
в ~5 раз, но решает значительно больше. Для задач с низким try-rate
(долгие генерации, важный output) — Opus становится default.
`,
    tags: ["opus-4", "benchmarks", "analysis"],
    publishedAt: iso("2026-04-11"),
    relevance: "moderate",
  },
  {
    id: "r_releasebot_claude",
    source: "community-tool",
    url: "https://releasebot.io/updates/anthropic/claude-code",
    title: "Releasebot — aggregated feed релиз-нотов Claude Code",
    tldr:
      "Третьесторонний аггрегатор релиз-нотов Claude Code в один хронологический feed с тэггингом. Есть RSS. Покрывает CLI, VS Code и JetBrains расширения.",
    summaryMd: `## Что это

Releasebot — небольшой community-tool, собирающий release notes
Claude Code (GitHub, official changelog, JetBrains/VSCode marketplaces)
в один aggregated feed.

## Зачем нужен

Anthropic публикует изменения в нескольких местах:

1. GitHub Releases (CLI)
2. Changelog на docs.claude.com
3. VSCode Marketplace (extension updates)
4. JetBrains Plugin Repository (extension updates)

Смотреть все четыре — рутина. Releasebot мёрджит их в один
хронологический RSS.

## Фичи

- **Хронологический feed** — все изменения по дате
- **Тэггинг** — подписка только на \`[breaking]\`, \`[security]\`,
  \`[skills]\` или другие категории
- **RSS-экспорт** — для любых reader'ов
- **JSON API** — для автоматизации

## Качество

Обновляется быстро (~минуты после релиза). Нет платных тиров.
Поддерживается одним разработчиком.

## Применимость

Для нашего weekly-radar autoresearch — не нужно, мы собираем своё.
Но как backup-источник для проверки (вдруг autoresearch пропустит
что-то) — удобно.

Если автоматизируем radar-sync через cron, можно просто парсить
Releasebot's RSS вместо веб-скрейпа.
`,
    tags: ["claude-code", "tooling", "rss"],
    publishedAt: iso("2026-04-05"),
    relevance: "moderate",
  },
];

export function getSeedRadarItems(): RadarItemView[] {
  return SEED;
}

export function getRadarItemById(id: string): RadarItemView | undefined {
  return SEED.find((item) => item.id === id);
}
