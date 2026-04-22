---
type: radar-item
source: ai-sdk-docs
url: https://ai-sdk.dev/docs/introduction
title: "AI SDK DevTools — in-browser inspector for agent runs and tool calls"
tldr: |
  DevTools is a React component that renders live inspection of an AI SDK
  agent run in your dev environment: messages, tool calls, token usage,
  latency per step. Drops into any app with `<AIDevTools />`. No more
  guessing what the agent did.
tags: [ai-sdk, tooling, debugging, dx]
published_at: 2026-04-08
relevance: strong
related_skill: vibecoding
---

# Install cost

Low — one component, dev-only. Mount it conditionally on `process.env.NODE_ENV`.
