---
type: radar-item
source: community-blog
url: https://www.firecrawl.dev/blog/best-llm-observability-tools
title: "Langfuse приобретён Clickhouse — январь 2026"
tldr: |
  Langfuse, open-source LLM observability platform (логирует traces,
  sessions, nested chains, prompt versions), куплен Clickhouse в январе
  2026. Текущие capabilities не меняются, но backend теперь сидит на
  Clickhouse-stack (массивная column-oriented analytics). Для дебага
  agent-цепочек — один из двух must-have инструментов наравне с LangSmith.
tags: [observability, langfuse, tooling, open-source]
published_at: 2026-02-15
relevance: moderate
---

# Что Langfuse даёт

- **Nested traces** для chains и агентов — видно ветвление decision-points
- **Session grouping** — связь между message-ами одного юзера
- **Prompt versioning** — trackаешь какая версия промпта дала какой output
- **Self-hosted option** — можно не отдавать данные в cloud

# Позиционирование

| Tool | Стронг-сторона | Слабое |
|------|----------------|--------|
| Langfuse | Open-source, self-host, agent chains | UI чуть grеch'ее чем у Braintrust |
| LangSmith | LangChain-native | Vendor lock-in |
| Braintrust | Eval + monitoring в одном | Cloud-only, платный |
| Helicone | Простой proxy | Простые кейсы только |

# Применимо у нас

Пока своя табличка `ai_usage_log` — достаточно. Если хочется лучшего UX
для дебага агент-цепочек без вендор-блокинга — Langfuse self-hosted в том
же Supabase-инстансе.
