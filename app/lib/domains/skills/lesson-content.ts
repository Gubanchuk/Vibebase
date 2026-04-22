/**
 * Rich markdown bodies used as fixture lesson content. Each is roughly
 * ~400 words and exercises the full markdown surface (headings, lists,
 * tables, code blocks, blockquotes) so the prose renderer is properly
 * stress-tested.
 */

export const PAST_PERFECT_LESSON_MD = `# Past Perfect — когда прошлое было «до»

## Идея в одну строку

Когда в твоём рассказе есть два события в прошлом, и ты хочешь
подчеркнуть, что **одно случилось раньше другого** — на «раньшее»
ставим **Past Perfect** (\`had + V3\`). Остальное остаётся в Past Simple.

## Формула

\`\`\`
[Subject] + had + [past participle]

I had finished the book before the movie started.
She had already left when we arrived.
\`\`\`

## Когда использовать

| Случай | Пример |
|--------|--------|
| Порядок событий | *By the time we arrived, they **had left**.* |
| Опыт до момента в прошлом | *She **had never tried** sushi until last summer.* |
| Reported speech | *He said he **had seen** the script.* |
| После \`after / before / when / by the time\` | *After I **had eaten**, I went for a walk.* |

## Частая ошибка — "and then"

Если события идут **последовательно** и без подчёркивания порядка,
Past Simple справляется один:

> I woke up, brushed my teeth and left the house. ✓

Здесь Past Perfect звучит странно — никто не запутается в
последовательности, потому что она уже видна из порядка предложений.

## Past Simple vs Past Perfect

Сравни две версии:

1. *When I arrived, she left.* — она ушла **после** моего прихода.
2. *When I arrived, she **had left**.* — она ушла **до** моего прихода.

Past Perfect переставляет временную линию, не трогая порядок слов.

## Мини-упражнение

Переведи на английский:

1. К моменту, когда ты позвонил, я уже пообедал.
2. Она никогда не летала на самолёте до 2020 года.
3. Я понял, что забыл зонтик.

---

**Ответы (не подглядывай):**

1. By the time you called, I **had already had** lunch.
2. She **had never flown** on a plane before 2020.
3. I realised that I **had forgotten** my umbrella.

## Когда НЕ использовать

- Для действий, связанных с настоящим → Present Perfect.
- Для неопределённого прошлого без «точки отсчёта» → Past Simple.

> Rule of thumb: если нет **второго прошедшего момента** в предложении
> или подразумеваемого контекста — не лезь в Past Perfect.

## Следующие шаги

- 10 минут drill на had + V3 (Mode 3).
- Quiz недели в воскресенье.
- В дневнике отметь 2 ситуации из своей недели, где Past Perfect был
  бы к месту.
`;

export const CLAUDE_CODE_CLI_LESSON_MD = `# Claude Code CLI — local agent в твоём терминале

## Что это

\`claude\` — это **локальный агент** от Anthropic, который:

- читает и правит файлы в проекте,
- запускает shell-команды,
- держит проектную память (\`CLAUDE.md\`),
- умеет стримить ответы и вызывать tools.

В отличие от облачных IDE-ассистентов, он исполняет **у тебя на машине**:
полный доступ к репозиторию, git, node, pnpm, docker — всему, что есть
в PATH.

## Установка и первый запуск

\`\`\`bash
npm install -g @anthropic-ai/claude-code
claude --version
claude
\`\`\`

Первый запуск попросит API-ключ или подпишет тебя через подписку
Claude Pro/Max.

## Три уровня памяти

| Уровень | Файл | Что кладём |
|---------|------|------------|
| Global | \`~/.claude/CLAUDE.md\` | стиль общения, любимые фреймворки |
| Project | \`<repo>/CLAUDE.md\` | архитектура, команды, нюансы |
| Session | ephemeral | цель текущей задачи |

Чем точнее project-файл — тем меньше Claude переспрашивает.

## Скиллы (\`.claude/skills/\`)

Скилл = markdown-файл с frontmatter:

\`\`\`md
---
name: pre-push
description: Verify build locally before pushing
---

You are a pre-push guard. Run the build, parse errors, fix them
surgically, re-run until green — only then hand off to git push.
\`\`\`

Claude сам решает, когда триггернуть скилл — по \`description\` он
понимает контекст.

## Subagents

В \`.claude/agents/\` лежат субагенты — отдельные контексты с
**своим tool allowlist**. Используются для:

- кодревью без доступа к \`git push\`,
- research без доступа к \`rm\`,
- «security scanner» с read-only правами.

Главный агент вызывает субагента через Task-tool, получает структурный
результат и продолжает.

## Hooks

В \`~/.claude/settings.json\` можно прописать хуки на события:

\`\`\`json
{
  "hooks": {
    "Stop": [{ "type": "command", "command": "notify-send done" }]
  }
}
\`\`\`

Хуки исполняются харнессом (не моделью) — поэтому они надёжны.

## Пара горячих трюков

- \`claude "/resume"\` — вернуться в последнюю сессию.
- \`claude --dangerously-skip-permissions\` — для CI (в песочнице!).
- \`claude -p "review this diff"\` — один запрос без интерактива.

## Что дальше

- Настрой \`CLAUDE.md\` с командами проекта.
- Добавь 2–3 скилла под типовые задачи.
- Поиграйся с subagent для кодревью.
`;

export const HOOKS_LESSON_MD = `# Hooks — автоматика, которая всегда срабатывает

## Идея в одну строку

Хуки — это команды, которые **харнесс** (не модель) гарантированно
выполняет в определённые моменты жизненного цикла Claude Code.

## Почему это важно

Попросить LLM «не забудь запустить тесты после каждого изменения» — значит
полагаться на его память. Модель может забыть или решить, что этот раз
«не важный». Хук не забывает — это просто shell-команда на событие.

## Шесть событий, на которые можно навесить хук

| Event | Когда срабатывает |
|-------|------------------|
| \`UserPromptSubmit\` | Юзер отправил сообщение |
| \`PreToolUse\` | Перед вызовом любого tool |
| \`PostToolUse\` | После вызова tool |
| \`Stop\` | Сессия завершилась (агент сказал Done) |
| \`SubagentStart\` | Спавнится субагент |
| \`SubagentStop\` | Субагент завершился |

## Минимальный пример

В \`~/.claude/settings.json\`:

\`\`\`json
{
  "hooks": {
    "Stop": [
      { "type": "command", "command": "notify-send 'Claude готов'" }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "prettier --write \\"$CLAUDE_FILE_PATH\\""
      }
    ]
  }
}
\`\`\`

Первый хук шлёт десктоп-нотифу на завершение. Второй — автоматически
прогоняет Prettier на любой отредактированный файл.

## Пять классических паттернов

1. **Блокировка .env-коммита** — \`PreToolUse\` на \`git commit\`, грепает \`.env\`, падает с exit 2.
2. **Auto-format after edit** — как выше, Prettier / ESLint на сейв.
3. **Security gate** — \`PreToolUse\` на \`Bash(rm:*)\` требует подтверждения.
4. **Rollback on fail** — \`Stop\`-хук на ошибке делает \`git stash\`.
5. **Audit log** — \`PostToolUse\` пишет каждую команду в \`~/claude-audit.log\`.

## Коды возврата

| Exit code | Что значит |
|-----------|------------|
| \`0\` | Продолжаем как будто ничего не было |
| \`2\` | Блокируем действие, stderr уйдёт модели как объяснение |
| Другое | Warning, но выполнение продолжается |

## Как тестировать хук

\`\`\`bash
# Эмулируем событие вручную
echo '{"tool_name":"Edit","tool_input":{"file_path":"/tmp/x.py"}}' \\
  | /path/to/hook.sh
\`\`\`

Харнесс всегда даёт событие как JSON в stdin — удобно писать хуки
на любом языке.

## Когда *не* нужен хук

- Если просьбы в CLAUDE.md достаточно.
- Если логика зависит от контекста задачи (хук контекст не видит).
- Если хук медленный — 5 секунд на каждое действие убьёт UX.
`;

export const AI_GATEWAY_LESSON_MD = `# AI Gateway — один endpoint, много провайдеров

## Зачем

Простой способ думать: **reverse-proxy для LLM-провайдеров**.
Стучишься в один URL, gateway сам разбирается:

- какой провайдер (Anthropic / OpenAI / Google / xAI) ответит,
- что делать, если провайдер упал (failover),
- что делать на rate-limit,
- как логировать cost и latency per-route.

Без gateway — 4 SDK, 4 ключа, 4 места возможного возгорания.

## Базовый запрос

\`\`\`ts
import { streamText } from 'ai'
import { gateway } from '@ai-sdk/gateway'

const { textStream } = streamText({
  model: gateway('anthropic/claude-sonnet-4-6'),
  system: 'You are helpful.',
  messages: [{ role: 'user', content: 'Explain MCP.' }],
})
\`\`\`

Ты не знаешь, какой upstream-провайдер ответит — это забота gateway'а.
Для тебя — один унифицированный SDK-вызов.

## Failover

В консоли Vercel задаёшь fallback-цепочку:

\`\`\`
anthropic/claude-sonnet-4-6
  → openai/gpt-4o
    → google/gemini-2.5-flash
\`\`\`

Первый вернул 429 / 500 / timeout → gateway пробует следующий. Для юзера
это просто +200ms, но ответ пришёл.

## Budget tracking

В dashboard можно задать:

- **Per-user cap** — юзер X не тратит больше $N/месяц.
- **Per-route cap** — роут /api/chat не стоит больше $X/день.
- **Per-org cap** — общий лимит на весь проект.

Cap достигнут → gateway возвращает 402, код ловит и показывает UX.

## Observability

В dashboard видно:

| Метрика | Что показывает |
|---------|----------------|
| Latency p50/p95 | per-provider, per-model |
| Cost | по времени, route, user |
| Error rate | 429'ы, 5xx'ы, failover triggers |
| Traffic split | как распределяются вызовы |

Это заменяет самописную Sentry-обвязку для большинства случаев.

## Когда *не* нужен gateway

- Одна модель одного провайдера, нет growth-плана.
- Нет юзеров, нет budget-лимитов.
- Latency критичнее failover'а (gateway добавляет ~20ms).

Во всех остальных — окупится на первом upstream-падении.

## Для нашего приложения

1. **Авто-failover Sonnet → Haiku** на rate-limit — юзер не видит простой.
2. **Cost per domain** в \`/settings/usage\` (english.lesson vs skills.generate).
3. **Единый ключ** вместо четырёх, если подключим GPT-5 для A/B.
`;

export const MCP_LESSON_MD = `# MCP — Model Context Protocol

## Что это

Открытый протокол (JSON-RPC поверх stdio / HTTP), который стандартизирует
способ давать LLM **доступ к инструментам**.

До MCP каждый клиент (Claude Desktop, Claude Code, Cursor) имел свой
формат tools, каждый сервер (Slack, Postgres, GitHub) имел свою обёртку
под каждый клиент. С MCP один сервер работает со всеми клиентами.

## Анатомия минимального сервера

\`\`\`ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = new Server(
  { name: 'hello-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'greet',
    description: 'Return a greeting',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    },
  }],
}))

server.setRequestHandler('tools/call', async ({ params }) => {
  if (params.name === 'greet') {
    return { content: [{ type: 'text', text: \`Hi, \${params.arguments.name}\` }] }
  }
  throw new Error('Unknown tool')
})

await server.connect(new StdioServerTransport())
\`\`\`

Всё. Подключишь к Claude Desktop через \`claude_desktop_config.json\` —
там появится tool \`greet\`.

## Три транспорта

| Транспорт | Когда |
|-----------|------|
| \`stdio\` | Локальные процессы — быстро, просто |
| \`HTTP (streamable)\` | Серверы в облаке, multi-user, 2026-дефолт |
| \`SSE (legacy)\` | Старые клиенты, вытесняется |

## Три примитива

1. **Tools** — функции, которые модель может вызвать.
2. **Resources** — read-only документы для показа модели.
3. **Prompts** — шаблоны, которые клиент вставляет в чат.

Большинство серверов реализуют только \`Tools\`.

## Масштаб: 97M/месяц

MCP вырос с 2M до 97M SDK-скачиваний за 16 месяцев (ноябрь 2024 → март 2026).
Принят OpenAI, Google, Microsoft, AWS, Cloudflare. В декабре 2025 Anthropic
передала проект в Agentic AI Foundation под Linux Foundation — теперь это
нейтральный стандарт.

## Когда писать свой MCP-сервер

- Есть внутренний API — хочется дать агентам.
- Есть БД — нужен read-only LLM-доступ.
- Есть legacy-CLI, обёртку которого часто зовёшь из агентов.

## Когда *не* писать

- Достаточно \`Bash\` tool'а.
- Разовая задача — напиши функцию в коде.
- Нужна тонкая авторизация — MCP-auth ещё развивается.
`;

export const STREAM_TEXT_LESSON_MD = `# streamText — стриминг end-to-end

## Базовый вызов

\`\`\`ts
import { streamText } from 'ai'

const { textStream } = streamText({
  model: 'anthropic/claude-sonnet-4-6',
  system: 'You are a concise tutor.',
  messages: [{ role: 'user', content: 'Past Perfect за 3 строки.' }],
})

for await (const chunk of textStream) {
  process.stdout.write(chunk)
}
\`\`\`

Модель отдаёт текст сразу, как появились первые токены — не ждёшь
финального ответа.

## Четыре потока из одного вызова

\`\`\`ts
const { textStream, fullStream, finishReason, usage } = streamText({...})
\`\`\`

| Свойство | Что |
|----------|-----|
| \`textStream\` | Только текст, чанками |
| \`fullStream\` | Все события — tool calls, tool results, finish |
| \`finishReason\` | Promise: 'stop' / 'tool-calls' / 'length' / 'error' |
| \`usage\` | Promise: { promptTokens, completionTokens, totalTokens } |

Для UI нужно \`textStream\`. Для observability — \`usage\` + \`finishReason\`
через \`onFinish\`.

## onFinish — точка записи в БД

\`\`\`ts
streamText({
  model: 'anthropic/claude-sonnet-4-6',
  messages,
  onFinish: async ({ text, usage, finishReason }) => {
    await db.aiUsageLog.insert({
      userId,
      tokensIn: usage.promptTokens,
      tokensOut: usage.completionTokens,
      costUsd: costFor('sonnet', usage),
      status: finishReason,
    })
  },
})
\`\`\`

Именно здесь мы пишем строку в \`ai_usage_log\`. Без этого нет cost-dashboard.

## Route handler

\`\`\`ts
export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({ model: 'anthropic/claude-sonnet-4-6', messages })
  return result.toDataStreamResponse()
}
\`\`\`

\`.toDataStreamResponse()\` возвращает готовый Response для \`useChat\`.

## useChat на клиенте

\`\`\`tsx
import { useChat } from '@ai-sdk/react'

function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  // ...
}
\`\`\`

Хук делает fetch, собирает стрим, обновляет state. Добавляем только свой
AbortController для stop-кнопки.

## Частые грабли

- **AbortController обязателен** — иначе stop-кнопка декоративная.
- **Headers в прокси** — Nginx/CloudFront режут SSE без \`X-Accel-Buffering: no\`.
- **onFinish не вызывается** → клиент abort'нулся раньше. Пишем partial через \`try/finally\`.
- **Double-billing** — на retry \`onFinish\` срабатывает дважды. Idempotency key по message-id спасает.
`;

export const TOOL_CALLING_LESSON_MD = `# Tool calling — от определения до multi-step

## Минимальный tool

\`\`\`ts
import { tool } from 'ai'
import { z } from 'zod'

const weatherTool = tool({
  description: 'Get current weather by city name',
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    const r = await fetch(\`https://wttr.in/\${city}?format=j1\`)
    const d = await r.json()
    return { tempC: d.current_condition[0].temp_C }
  },
})
\`\`\`

Три обязательных поля: \`description\` (модель решает *когда* звать),
\`inputSchema\` (Zod аргументов), \`execute\` (функция).

## Передача в streamText

\`\`\`ts
streamText({
  model: 'anthropic/claude-sonnet-4-6',
  tools: { weather: weatherTool },
  maxSteps: 5,
  messages: [{ role: 'user', content: 'Сколько градусов в Тбилиси?' }],
})
\`\`\`

\`maxSteps: 5\` — до 5 циклов tool-call → result → model.

## Structured results

Модель получает \`{ tempC: 18 }\` как JSON и продолжает учитывая значение.
Никакого парсинга текста.

## Human-in-the-loop approval (AI SDK 6+)

\`\`\`ts
const deleteTool = tool({
  description: 'Delete a file',
  inputSchema: z.object({ path: z.string() }),
  requiresApproval: true,
  execute: async ({ path }) => { await fs.rm(path); return { deleted: path } },
})
\`\`\`

\`useChat\` получает \`toolApprovalRequest\`, рендеришь Approve/Reject,
tool резюмируется после клика.

## Узкий tool vs широкий

Плохо — один универсальный \`do-everything\`:

\`\`\`ts
const doEverything = tool({
  description: 'Do anything',
  inputSchema: z.object({ action: z.string() }),
  execute: async ({ action }) => evalAnyAction(action),
})
\`\`\`

Модель не понимает, когда вызывать. Лучше три узких tool'а — им модель
автоматически ищет место в логике.

## Частые ошибки

- Description для человека, не для модели.
- Zod-схема без \`.describe()\` — вложенные поля модель угадывает плохо.
- \`execute\` кидает исключение наверх — лучше \`return { error: '...' }\`.
- 15+ tools в одном вызове — модель теряется. Разноси по субагентам.
`;

export const SKILLS_FILE_LESSON_MD = `# Skill files — промпт в переиспользуемой обёртке

## Анатомия

Файл \`.claude/skills/my-skill.md\`:

\`\`\`md
---
name: pre-push
description: Verify build locally before pushing to remote
---

You are a pre-push guard. Run the build, parse errors, fix them surgically,
re-run until green — only then hand off to git push.

## Protocol

1. Run npm run build.
2. If errors, read them, fix root cause (not --no-verify).
3. Re-run until green.
4. Short summary of what was fixed.
\`\`\`

Две части: frontmatter (метаданные) и тело (промпт + протокол).

## Поля frontmatter

| Поле | Обязательно | Что делает |
|------|-------------|-----------|
| \`name\` | да | Уникальное имя, используется в \`/skill-name\` |
| \`description\` | да | По нему модель решает, когда триггерить |
| \`tools\` | нет | Allowlist — иначе все доступные |
| \`model\` | нет | Явный пик — иначе текущая |

## Как скилл триггерится

Два способа:

1. **Автоматически** — агент читает description всех скиллов, сопоставляет
   с задачей.
2. **Явно** — юзер пишет \`/pre-push\`.

Description — это не хелп для человека, это **классификатор**. Пиши так,
чтобы исключало неподходящие кейсы.

## Skill vs системный промпт

| Критерий | Скилл | Системный промпт |
|----------|-------|------------------|
| Переиспользуется | Да, между проектами | Нет |
| Авто-триггерится | Да | Нет |
| Свой tool allowlist | Да | Нет |
| Живёт в репе | В \`.claude/skills/\` | В коде |

## Skills 2.0 (апрель 2026)

Скилл стал **мини-агентом**:

- Спавнит изолированный субагент со своим контекстом.
- Инъецирует live-данные через shell-хук.
- Тестируется через **evals** — \`skill-creator\` прогоняет на
  тестовых промптах и оценивает результат.

## Когда писать скилл

- Промпт повторяется ≥3 раза.
- Промпт длинный (>15 строк).
- Хочется авто-триггер без команды.
- Нужен tool allowlist для безопасности.

## Когда *не* писать

- Одноразовый таск — напиши промпт.
- Короткий промпт — в CLAUDE.md.
- Нет чёткого description — ложные триггеры замучают.
`;

export const SUBAGENTS_LESSON_MD = `# Subagents — изолированные рабочие лошадки

## Зачем вообще отдельный агент

Главный агент может всё — но «всё» это и проблема. Чем больше у него
контекста и инструментов, тем:

- дороже каждый запрос (контекст = токены = деньги),
- опаснее tool-use (удалит не тот файл, push’нёт в мастер),
- сложнее воспроизвести поведение.

Subagent решает это тремя ограничениями: **свой системный промпт,
свой tool allowlist, свой контекст**.

## Анатомия субагента

Файл \`.claude/agents/code-reviewer.md\`:

\`\`\`md
---
name: code-reviewer
description: Reviews pull request diffs for correctness and style.
tools: Read, Grep, Glob, Bash(git diff:*)
model: claude-sonnet-4-6
---

You are a strict but fair reviewer. For each file:
1. Read the full file, not just the diff.
2. Flag real bugs, not style nitpicks.
3. Return a structured report with severity.
\`\`\`

Frontmatter задаёт **контракт**: имя, описание, разрешённые tools, модель.
Тело — системный промпт.

## Когда триггерится

Главный агент читает \`description\` всех субагентов и решает, подходит
ли контекст текущей задачи. Два способа:

1. **Автоматически** — по совпадению описания.
2. **Явно** — пользователь пишет \`/code-reviewer\` или агент зовёт
   через Task-tool.

## Tool allowlist — главная фича

Субагент по умолчанию **не видит** инструменты главного. Перечисляешь
нужные в frontmatter:

| Пример | Что даёт |
|--------|----------|
| \`Read, Grep\` | read-only — для research |
| \`Bash(npm test:*)\` | можно только npm test, ничего больше |
| \`Edit, Write\` | может менять файлы |
| \`*\` | полный доступ (редко оправдано) |

Это **sandbox на уровне модели**: даже если промпт-инъекция попробует
запустить \`rm -rf\`, tool просто не существует в этом контексте.

## Контекст-изоляция

Субагент получает **только** те сообщения, что ему передал главный.
Свою историю он не тащит дальше:

- Главный зовёт субагента → передаёт short brief.
- Субагент отрабатывает → возвращает структурный результат.
- Главный видит результат, **не видит** внутреннюю переписку.

Это значит: можно запускать 5 субагентов параллельно, и контекст
главного не взрывается.

## Паттерн «узкий специалист»

Хорошие субагенты делают **одну вещь**:

- \`security-review\` — ищет секреты и CVE.
- \`doc-writer\` — пишет README/docstrings.
- \`test-writer\` — добавляет тесты к диффу.
- \`migrate-react-19\` — применяет codemods.

Плохой субагент — «универсальный помощник». Такой дублирует главного
и ничего не даёт.

## Цена и выгода

- **+** дешевле (короткие контексты),
- **+** безопаснее (узкий allowlist),
- **+** параллелится,
- **−** латенси на передачу туда-обратно,
- **−** нужно проектировать интерфейс (что передаём, что получаем).

## Чеклист перед созданием субагента

1. Задача повторяется ≥3 раз?
2. Нужен свой tool allowlist?
3. Контекст главного «устал» от этого типа задач?
4. Можно описать вход/выход в 3 строки?

Если три «да» — пиши субагента. Иначе — остаёмся в главном.
`;
