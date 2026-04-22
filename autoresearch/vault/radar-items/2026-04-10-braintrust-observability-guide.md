---
type: radar-item
source: braintrust-articles
url: https://www.braintrust.dev/articles/best-llm-monitoring-tools-2026
title: "5 best tools for monitoring LLM applications in 2026"
tldr: |
  Обзор observability-ландшафта для LLM от Braintrust. Пятёрка лидеров:
  Braintrust (monitoring + eval + experimentation в одном), Langfuse
  (open-source, куплен Clickhouse в январе 2026), Helicone (proxy-based,
  no SDK), Maxim AI (quality-focused), Datadog (enterprise). Браиантраст
  показывает nested traces с лучшей визуализацией и сразу гоняет evals
  на этих же трейсах.
tags: [observability, evals, monitoring, tooling]
published_at: 2026-04-10
relevance: strong
related_skill: vibecoding
---

# Ключевые выводы

- **Evals на производстве** становятся стандартом: не только перформанс
  трейсов, но и автоматическая проверка quality step-by-step.
- **Agent-specific tracing** — отдельная категория. Langfuse и LangSmith
  особенно хороши для агент-цепочек, показывают где принимаются решения.
- **Proxy vs SDK**: Helicone проще интегрировать (меняешь baseURL, ничего
  больше), но работает только для simple request/response, не для агентов.

# Для нашего проекта

`/settings/usage` сейчас — самописный observability (taблица `ai_usage_log`).
Для MVP достаточно. Когда агентов станет 3+ с цепочками tool calls —
имеет смысл прикрутить Langfuse (open-source, без vendor lock-in).
