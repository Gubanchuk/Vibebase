---
type: radar-item
source: mcp-github
url: https://github.com/modelcontextprotocol/servers
title: "Model Context Protocol — official reference servers registry"
tldr: |
  Официальный GitHub-репо с reference-реализациями MCP-серверов: Postgres
  (read-only + schema inspection), Slack (channels + messaging), GitHub
  (repos + issues + PRs), файлы, поиск, Redis. Community добавил 5000+
  серверов к марту 2026. Claude alone обрабатывает 1B+ tool calls/month
  через MCP.
tags: [mcp, tools, registry, production]
published_at: 2026-03-15
relevance: strong
related_skill: vibecoding
---

# Почему это важно

MCP стал де-факто стандартом. 300+ клиентов говорят на нём: Claude
Desktop, Cursor, Windsurf, VS Code (Copilot), Zed, Replit, Continue,
Sourcegraph Cody, Taskade Genesis.

# Популярные server-типы

- **Database**: Postgres MCP → «покажи всех юзеров за 7 дней» → SQL написан
  и исполнен
- **Git platform**: GitHub MCP → чтение repos, создание issues, review PRs
  из чата
- **Messaging**: Slack MCP — stdio / SSE / HTTP transports, DMs, group DMs,
  smart history fetch
- **Files**: filesystem MCP — granular path permissions

# Для нашего проекта

Если понадобится дать AI-тьютору доступ к чему-то external (например
synced-vocabulary в Anki), MCP — канонический путь, а не самописный
tool-endpoint.
