import type { PlacementQuestion } from "./types";

/**
 * 15 placement-вопросов от Newbie до Maintainer.
 * Покрывают: Claude Code CLI, скиллы, хуки, субагенты, MCP, AI SDK, prompting,
 * observability, agent security, industry patterns. Ответ правильный только один.
 */

export const PLACEMENT_BANK: PlacementQuestion[] = [
  // ─── Newbie (1-4) — базовые концепты ───────────────────────────────────
  {
    id: "v1",
    level: "newbie",
    tag: "claude-code",
    prompt: "Что такое Claude Code?",
    options: [
      { label: "Онлайн-редактор кода от Anthropic" },
      { label: "Локальный CLI-агент, умеющий читать и менять файлы, запускать shell" },
      { label: "VS Code extension для автодополнения" },
      { label: "Язык программирования для промптов" },
    ],
    correctIndex: 1,
  },
  {
    id: "v2",
    level: "newbie",
    tag: "prompting",
    prompt: "Где лежит project-level проектная память, которую Claude читает автоматически?",
    options: [
      { label: ".env файл в корне проекта" },
      { label: "CLAUDE.md в корне репозитория" },
      { label: "README.md" },
      { label: ".vscode/settings.json" },
    ],
    correctIndex: 1,
  },
  {
    id: "v3",
    level: "newbie",
    tag: "claude-code",
    prompt: "Что такое скилл в Claude Code?",
    options: [
      { label: "Функция на TypeScript, которую модель вызывает" },
      { label: "Внешний API endpoint, которым управляет Claude" },
      { label: "Markdown-файл с frontmatter в .claude/skills/, описывающий переиспользуемый паттерн" },
      { label: "Плагин, устанавливаемый через npm" },
    ],
    correctIndex: 2,
  },
  {
    id: "v4",
    level: "newbie",
    tag: "prompting",
    prompt: "Какая главная идея за хорошим system-промптом?",
    options: [
      { label: "Как можно больше слов, чтобы модель всё поняла" },
      { label: "Роль + контекст + ограничения + success criteria + формат вывода" },
      { label: "Список запретов вроде «не делай X»" },
      { label: "Ничего не нужно — модель и так умная" },
    ],
    correctIndex: 1,
  },

  // ─── Practitioner (5-8) — повседневный workflow ─────────────────────────
  {
    id: "v5",
    level: "practitioner",
    tag: "hooks",
    prompt: "Какое отличие хука от скилла?",
    options: [
      { label: "Хук — это другое название скилла" },
      { label: "Хук — shell-команда, которую запускает харнесс на событие (PostToolUse, Stop и т.д.)" },
      { label: "Скилл быстрее хука" },
      { label: "Хуки работают только на macOS" },
    ],
    correctIndex: 1,
  },
  {
    id: "v6",
    level: "practitioner",
    tag: "subagents",
    prompt: "Зачем спавнить субагент вместо работы в главном треде?",
    options: [
      { label: "Чтобы было побольше логов" },
      { label: "Изоляция контекста + свой tool allowlist → дешевле и безопаснее" },
      { label: "Потому что главный тред нельзя прерывать" },
      { label: "Субагенты обязательны для любой задачи сложнее одного файла" },
    ],
    correctIndex: 1,
  },
  {
    id: "v7",
    level: "practitioner",
    tag: "ai-sdk",
    prompt: "Что возвращает `streamText` из AI SDK?",
    options: [
      { label: "Готовую строку с ответом целиком" },
      { label: "Объект с `textStream`, `fullStream`, `usage` и `finishReason`" },
      { label: "Raw ReadableStream без метаданных" },
      { label: "Массив JSON-токенов" },
    ],
    correctIndex: 1,
  },
  {
    id: "v8",
    level: "practitioner",
    tag: "mcp",
    prompt: "Model Context Protocol — что это в одной фразе?",
    options: [
      { label: "Протокол передачи контекста между разными моделями" },
      { label: "Открытый JSON-RPC стандарт, стандартизирующий доступ LLM к инструментам" },
      { label: "Новый формат эмбеддингов" },
      { label: "Внутренний API Anthropic" },
    ],
    correctIndex: 1,
  },

  // ─── Architect (9-12) — системный взгляд ────────────────────────────────
  {
    id: "v9",
    level: "architect",
    tag: "agents",
    prompt: "Что такое ToolLoopAgent в AI SDK 6?",
    options: [
      { label: "Обёртка над одноразовым вызовом tool" },
      { label: "Агент, автоматически крутящий цикл «модель → tool call → tool result → модель» до `maxSteps` или terminal-условия" },
      { label: "Плагин для логирования" },
      { label: "Hook, который запускает tools в цикле" },
    ],
    correctIndex: 1,
  },
  {
    id: "v10",
    level: "architect",
    tag: "patterns",
    prompt: "Ты пишешь скилл «review-pr». Правильный ход для `description`:",
    options: [
      { label: "Описать подробно, как работает скилл — шаг за шагом" },
      { label: "Короткое предложение на человеческом языке" },
      { label: "Классификатор: когда звать, включая исключения («runs on PR review requests, NOT on commit messages»)" },
      { label: "Ничего не писать, description опционален" },
    ],
    correctIndex: 2,
  },
  {
    id: "v11",
    level: "architect",
    tag: "observability",
    prompt: "Что дали в Claude Code новые поля agent_id и agent_transcript_path в хуках SubagentStop?",
    options: [
      { label: "Возможность переименовать субагент" },
      { label: "Полный транскрипт субагента и его идентификатор — наконец observability для агент-пайплайнов" },
      { label: "Ничего важного, декоративные поля" },
      { label: "Только скорость работы" },
    ],
    correctIndex: 1,
  },
  {
    id: "v12",
    level: "architect",
    tag: "ai-sdk",
    prompt: "Tool помечен `requiresApproval: true`. Что случится при вызове моделью?",
    options: [
      { label: "Tool выполнится, модель спросит потом" },
      { label: "Ошибка — approval не поддерживается" },
      { label: "useChat получит `toolApprovalRequest`, UI отрендерит Approve/Reject, tool резюмируется после approval" },
      { label: "Tool исполнится в sandbox'е" },
    ],
    correctIndex: 2,
  },

  // ─── Maintainer (13-15) — эволюция платформы ────────────────────────────
  {
    id: "v13",
    level: "maintainer",
    tag: "evolution",
    prompt: "В 2026-м Karpathy объявил «vibe coding» устаревшим. Чем он его заменил?",
    options: [
      { label: "Prompt engineering" },
      { label: "Agentic engineering — 99% времени на оркестрацию агентов и надзор" },
      { label: "Full-auto coding без ревью" },
      { label: "Low-code" },
    ],
    correctIndex: 1,
  },
  {
    id: "v14",
    level: "maintainer",
    tag: "mcp",
    prompt: "Главные четыре вехи MCP-роадмапа на 2026?",
    options: [
      { label: "Только скорость" },
      { label: "Новые типы tools каждые 2 недели" },
      { label: "Enterprise readiness, масштабируемость, server discoverability (.well-known), конформанс-тестирование" },
      { label: "Переход с JSON-RPC на gRPC" },
    ],
    correctIndex: 2,
  },
  {
    id: "v15",
    level: "maintainer",
    tag: "evals",
    prompt: "Как в Skills 2.0 устроены evals, появившиеся в skill-creator?",
    options: [
      { label: "Внешний сервис — отправляешь скилл, ждёшь email" },
      { label: "Прогоняешь скилл на наборе тестовых промптов, skill-creator проверяет output против твоих критериев — регрессионные тесты для промптов" },
      { label: "Просто benchmark на скорость" },
      { label: "Evals это алиас для Debugger" },
    ],
    correctIndex: 1,
  },
];
