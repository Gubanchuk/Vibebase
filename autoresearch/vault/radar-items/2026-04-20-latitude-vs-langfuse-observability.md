---
type: radar-item
source: latitude
url: https://latitude.so/blog/best-llm-observability-tools-agents-latitude-vs-langfuse-langsmith
title: "Latitude vs Langfuse vs LangSmith vs Arize — observability comparison"
tldr: |
  Latitude — новый игрок (open-source, YC-backed), позиционируется как
  prompt-engineering-first platform с evals и observability. Фокус на
  prompt experimentation + A/B testing промптов в проде. Langfuse —
  лучший open-source general-purpose. LangSmith — best-in-class для
  LangChain экосистемы. Arize — enterprise со strongest ML-monitoring
  heritage. Для agent-only use cases — Latitude побеждает на prompt
  iteration workflow.
tags: [observability, agents, prompt-engineering, evals]
published_at: 2026-04-20
relevance: moderate
---

# Матрица выбора

| Критерий | Latitude | Langfuse | LangSmith | Arize |
|----------|----------|----------|-----------|-------|
| Open source | Да | Да | Нет | Partial |
| Agent chains | Good | Best | Best | Good |
| Prompt iteration | Best | Good | Good | Weak |
| Evals | Best | Good | Best | Best |
| Team collaboration | Best | Good | Good | Enterprise |
| Self-host | Да | Да | Нет | Нет |

# Когда Latitude

Если 80% работы = prompt iteration (пробую разные версии промпта,
хочу видеть diff, A/B-тестировать). Если работа = agent orchestration
с tool-calling — Langfuse / LangSmith.

# Применимо у нас

Curator и Teacher промпты в Vibebase могут эволюционировать — Latitude
подойдёт для tracking что именно изменилось в промпте и как это
сказалось на output quality. Но пока prompts стабильные, observability
встроена в `/settings/usage` — не усложняем.
