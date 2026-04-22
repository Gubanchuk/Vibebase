---
type: radar-item
source: openai-blog
url: https://developers.openai.com/api/docs/guides/agents/sandboxes
title: "OpenAI Agents SDK — sandbox, approvals, orchestration"
tldr: |
  OpenAI зашипила Agents SDK в апреле 2026 — прямой конкурент AI SDK от
  Vercel. Фичи: встроенный tool approval flow, native sandbox integration
  с OpenAI Sandbox service (Firecracker-backed), orchestration primitives
  (handoff между агентами), memory API. Позиционирование: "agentic
  workflows as first-class, not streamText wrapper". Цена — подписка OpenAI.
tags: [openai, agents, sdk, sandbox]
published_at: 2026-04-16
relevance: moderate
---

# Что в SDK

- **Handoffs** — один агент передаёт контекст другому (supervisor-pattern
  встроен)
- **Guardrails** — pre/post hooks на input/output с блокировкой
- **Sandbox execution** — нативное runs в OpenAI Sandbox (Firecracker)
- **Approvals** — human-in-the-loop для чувствительных tools
- **Tracing** — встроенный observability без доп. SDK

# Comparison с AI SDK

| Критерий | OpenAI Agents SDK | AI SDK 6 |
|----------|-------------------|----------|
| Provider-agnostic | Нет (only OpenAI) | Да |
| Sandbox built-in | Да (Firecracker) | Нет (external) |
| Tool approval | Да | Да (AI SDK 6+) |
| Open source | Нет | Да |
| Best for | OpenAI-committed shops | Multi-provider |

# Применимо у нас

Мы на AI SDK 6 — оставаться. Vendor-lock через OpenAI Agents SDK
невыгоден: завтра захотим Opus 4.7 через Gateway — уже нельзя. Но
мониторить эволюцию: OpenAI задаёт tempo для agent-frameworks, Vercel
часто догоняет фичами в следующей минорке.
