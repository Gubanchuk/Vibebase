---
type: radar-item
source: anthropic-engineering
url: https://www.anthropic.com/engineering/building-c-compiler
title: "Anthropic Engineering: 16 parallel Claudes построили C-компилятор"
tldr: |
  Demo-кейс Agent Teams (v2.1.32, 5 февраля 2026): 16 агентов работали
  параллельно над shared task list, за ~2000 Claude Code sessions
  написали 100,000-line Rust-based C-компилятор, способный скомпилить
  Linux kernel. Паттерн: 2-5 параллельных агентов — sweet spot. Больше
  — coordination cost съедает profit, если задачи не well-isolated.
tags: [claude-code, agents, parallel, subagents]
published_at: 2026-02-05
relevance: strong
related_skill: vibecoding
---

# Архитектура Agent Teams

- **Shared task list** — ТодоWrite-style, доступен всем агентам
- **Concurrent execution** — каждый агент берёт задачу, отмечает in-progress,
  работает, отмечает done
- **Real-time updates** — list меняется live, остальные видят
- **Минимум coordination** — tasks должны быть well-isolated, иначе merge-конфликты

# Best practices

1. **2-5 параллельных агентов** — сладкая точка для большинства проектов
2. **Хорошо-разделённые задачи** — каждая в своём файле/модуле, минимум
   cross-dependency
3. **Verification-agent** — один из команды специализируется на проверке
   результатов других

# Применимо у нас

Vibebase MVP не требует параллельных агентов. Но когда дойдём до автоген
всего курса (Curator × Teacher × Evaluator на 20+ топиках одновременно),
Agent Teams даст x5-x10 скорости vs sequential generation.
