---
type: radar-item
source: northflank-blog
url: https://northflank.com/blog/how-to-sandbox-ai-agents
title: "Как sandboxить AI-агентов в 2026 — microVMs, gVisor, изоляция"
tldr: |
  Три approach'а изоляции: microVMs (Firecracker, Kata — сильнейшая,
  dedicated kernel per workload), gVisor (user-space kernel, syscall
  interception), hardened containers (только для trusted code). К началу
  2026 Cloudflare, Vercel, Ramp, Modal — все зашипили sandbox-фичи. Новая
  модель: per-tool sandboxing — каждый tool декларирует capabilities
  (пути, hosts), система форкает процесс с confinement policy.
tags: [agents, security, sandbox, tool-use]
published_at: 2026-03-10
relevance: strong
related_skill: vibecoding
---

# Threat model для coding-agents

AI coding-агент запускает shell-команды с теми же permissions что и юзер.
Это enormous attack surface: промпт-injection → rm -rf, network egress для
data exfiltration, file writes outside workspace для persistence.

# Mandatory controls

1. **Network egress control** — ограничь список допустимых хостов
2. **Path confinement** — запрет writes вне workspace
3. **Syscall filtering** — seccomp profiles
4. **Approval gates** — human-in-the-loop для destructive actions
5. **Signed artifacts** — tool'ы подписаны, не модифицированы

# Platform примеры

- **Cloudflare Sandbox** — V8 isolate per request
- **Vercel Sandbox** — Firecracker microVM, ephemeral
- **Modal Sandbox** — per-function isolated container
- **Permiso SandyClaw** — first dynamic sandbox специально для agent skills

# Применимо у нас

Мы пока не выполняем user-code. Но если добавим «code review» режим с
запуском user-snippets — нужен будет Vercel Sandbox или Modal как
execution backend. MicroVM > container для untrusted input.
