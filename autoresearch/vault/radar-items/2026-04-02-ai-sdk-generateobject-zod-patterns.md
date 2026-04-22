---
type: radar-item
source: ai-sdk-docs
url: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
title: "AI SDK Core — generateObject и Zod для structured output"
tldr: |
  `generateObject` + Zod-схема = канонический способ получить
  type-safe JSON от LLM в TypeScript. SDK автоматически использует
  native structured-output API провайдера (OpenAI), а для остальных
  (Claude, Gemini) fallback на prompt-based + Zod validation с
  automatic retry при невалидном output'е.
tags: [ai-sdk, zod, structured-output, patterns]
published_at: 2026-04-02
relevance: strong
related_skill: vibecoding
---

# Паттерн

```ts
import { generateObject } from 'ai'
import { z } from 'zod'

const { object } = await generateObject({
  model: openai('gpt-5.4'),
  schema: z.object({
    topics: z.array(z.object({
      title: z.string().min(3).max(80),
      importance: z.number().int().min(1).max(5),
      tags: z.array(z.string()).min(1).max(5),
    })).min(5).max(20),
  }),
  prompt: '...',
})
// object.topics — типизирован, провалидирован, готов к insert
```

# Ключевые практики

- **`.describe()`** на полях — попадает в JSON Schema, направляет модель
- **`.min()`/`.max()`** — жёсткие границы, модель их соблюдает
- **Retry на validation failure** встроен — не нужно писать самому
- **streamObject** — если хочется показывать результат по мере генерации

# Применимо у нас

Наш Curator и Teacher агенты оба используют этот паттерн. Это **главная
причина** почему они стабильны: никакого regex-парсинга markdown'а в JSON.
