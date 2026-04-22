---
type: radar-item
source: ai-sdk-docs
url: https://ai-sdk.dev/docs/introduction
title: "AI SDK 6 — Agent abstraction for building reusable LLM agents"
tldr: |
  In AI SDK 6 you declare an agent once (`new Agent({ model, system, tools })`)
  and use it everywhere — no more passing model/instructions through every
  `streamText` call. Agents compose with tools and with each other, and
  `ToolLoopAgent` handles the loop-until-terminal-condition pattern.
tags: [ai-sdk, agents, patterns]
published_at: 2026-04-12
relevance: strong
related_skill: vibecoding
---

# Code sketch (from docs)

```ts
import { Agent, ToolLoopAgent } from 'ai'

const englishTutor = new Agent({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: 'You are an English tutor...',
  tools: { lookupWord, pronunciationGuide },
})

// Later:
const { text } = await englishTutor.generate({ messages })
```

# When to reach for it

Whenever you have a long-lived "persona" (tutor, reviewer, planner) used from
multiple entry points. Our 6 English modes map cleanly onto 6 Agent instances.
