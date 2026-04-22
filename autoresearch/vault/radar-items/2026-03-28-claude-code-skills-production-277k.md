---
type: radar-item
source: composio
url: https://composio.dev/content/top-claude-skills
title: "Top 10 Claude Code Skills в продакшене 2026"
tldr: |
  Экосистема скиллов разрастается: официальный Anthropic frontend-design
  скилл имеет 277k+ установок, Remotion (видео) — 117k weekly. PlanetScale
  даёт агентам deep context о serverless MySQL. Google Workspace
  интегрируется через `gws` CLI + MCP-сервер. Ключевой сдвиг: developer
  ушёл от context management к outcome specification.
tags: [claude-code, skills, production, ecosystem]
published_at: 2026-03-28
relevance: strong
related_skill: vibecoding
---

# Канонический workflow в 2026

> State the objective clearly. Let Claude explore. Use /plan when the
> work is architectural. Review what is proposed. Approve, redirect,
> or refine. Then let it execute through to validation and deployment.

# Популярные скиллы

| Скилл | Installs | Что даёт |
|-------|----------|----------|
| frontend-design (Anthropic) | 277k | Дизайн-систему до кода, избегает AI-slop эстетики |
| Remotion | 117k weekly | Программное создание видео |
| PlanetScale | — | Branching workflow для MySQL/Postgres |
| Google Workspace `gws` | — | Unified interface для всех GWS API |

# Применимо у нас

Паттерн «скилл = контекст + template + инструкции до кода» — именно то,
что делает наш frontend-design скилл для Vibebase. Превращать повторяющиеся
задачи в скиллы → главный scaling-механизм в vibecoding.
