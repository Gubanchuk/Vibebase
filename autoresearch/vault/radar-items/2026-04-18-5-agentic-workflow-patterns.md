---
type: radar-item
source: mindstudio
url: https://www.mindstudio.ai/blog/claude-code-agentic-workflow-patterns
title: "5 Claude Code Agentic Workflow Patterns — от Sequential до Fully Autonomous"
tldr: |
  Таксономия патернов: (1) Single-task — один вызов, один результат.
  (2) Sequential pipeline — агент A → агент B → агент C, каждый
  специализирован. (3) Parallel fan-out — main раздаёт под-задачи
  параллельным под-агентам. (4) Hierarchical — supervisor распределяет
  работу, review'ит. (5) Fully autonomous — agent team крутится loop'ом
  по shared task list до completion.
tags: [claude-code, agents, patterns, workflow]
published_at: 2026-04-18
relevance: strong
related_skill: vibecoding
---

# Когда какой

| Паттерн | Сложность | Когда |
|---------|-----------|-------|
| Single-task | 1 | Простой discrete вопрос |
| Sequential pipeline | 2 | Чётко разделимые фазы (research → draft → review) |
| Parallel fan-out | 3 | N независимых sub-задач (scan 10 файлов) |
| Hierarchical | 4 | Сложный проект с meta-planning |
| Fully autonomous | 5 | Long-horizon задача с clear acceptance criteria |

# Anti-patterns

- **Over-decomposition** — разбивать задачу на 20 микро-шагов, когда
  2-3 хватило бы. Overhead коммуникации съест profit.
- **Underspecified acceptance** — agent team не знает когда stop
- **No verification agent** — результаты не проверяются → галлюцинации
  компаундируются

# Применимо у нас

Наш runCuratorAction — sequential pipeline (read vault → cluster → rank).
getOrGenerateLessonAction — single-task. Когда будем делать «сгенерить
весь курс разом» — parallel fan-out с Agent Teams.
