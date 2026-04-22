---
type: radar-item
source: claude-docs
url: https://code.claude.com/docs/en/best-practices
title: "Claude Code — официальные Best Practices от Anthropic"
tldr: |
  Официальный guide от Anthropic обновлён под Claude Code 2.1+. Главная
  мысль: в 2026 роль разработчика сдвинулась от context management к
  outcome specification. Harness берёт на себя clearing context,
  artifact directories, elaborate prompt crafting, simulation of workflow
  structure. Best practice → State objective → Let Claude explore → Use
  /plan → Review → Approve / redirect → Execute.
tags: [claude-code, best-practices, docs, workflow]
published_at: 2026-04-01
relevance: strong
related_skill: vibecoding
---

# Главные принципы 2026

1. **Clear objective over clever prompt** — формулируй что должно получиться
2. **Let Claude explore first** — не давай сразу implementation, дай
   сначала прочитать релевантный код
3. **/plan для architectural работы** — заставляет Claude артикулировать
   подход, ты можешь ревьюить *план* дешевле чем *код*
4. **Review proposed changes** — даже в auto-accept mode смотри diff
5. **Redirect не заново start** — часто проще скорректировать направление
   чем запустить новую сессию

# Deprecated в 2026

- Ручное «clear context» (harness умнее)
- Artifact directories (memory через CLAUDE.md + skills достаточно)
- Elaborate multi-shot prompting (модели стали лучше)

# Применимо у нас

Для собственного workflow — следуем. Для user-facing UX на Vibebase —
заимствуем паттерн: `/plan` → review → execute → show diff.
