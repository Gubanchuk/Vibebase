---
type: radar-item
source: github
url: https://github.com/wshobson/agents
title: "wshobson/agents — intelligent automation + multi-agent orchestration"
tldr: |
  GitHub-репо с practical patterns для multi-agent Claude Code workflows:
  ~30 ready-to-use agent configs (.claude/agents/*.md) для типовых задач
  — code reviewer, security auditor, test writer, migration specialist,
  doc writer. Каждый с tool allowlist, permissionMode, model override.
  Отличная стартовая база для команд которые только внедряют subagents.
tags: [claude-code, subagents, templates, community]
published_at: 2026-04-12
relevance: moderate
---

# Типы готовых агентов в репо

- **code-reviewer** — read-only, strict review per PR
- **security-scanner** — ищет секреты, CVE, insecure patterns
- **test-writer** — добавляет тесты к diff
- **doc-writer** — генерирует README / docstrings
- **migration-specialist** — применяет codemods (React 19, Next 16)
- **refactor-legacy** — осторожный рефакторинг с `permissionMode: ask`
- **explore-codebase** — read-only навигация по незнакомому repo

# Как использовать

```bash
git clone https://github.com/wshobson/agents
cp -r agents/.claude/agents/* ~/.claude/agents/
# или для проекта:
cp agents/.claude/agents/code-reviewer.md .claude/agents/
```

Получаешь 30 subagents без написания промптов с нуля.

# Применимо у нас

Два паттерна для заимствования: (1) `code-reviewer` как template для
нашего review-mode в vibecoding tutor. (2) Структура каталога с категориями
— aligns с тем как мы делаем skill tree в Vibebase.
