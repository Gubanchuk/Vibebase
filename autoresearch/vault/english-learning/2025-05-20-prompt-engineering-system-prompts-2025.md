---
type: english-learning
source: aakashg-news
url: https://www.news.aakashg.com/p/prompt-engineering
title: "Prompt engineering in 2025 — system prompts do 85% of the heavy lifting"
tldr: |
  Industry post arguing that, across the best consumer LLM products, the
  system prompt accounts for ~85% of output quality — the rest is user
  skill. Specific recommendations: set role + constraints + success criteria
  + examples + failure modes. Chain-of-thought and few-shot still dominate
  as techniques. Iterate via testing, not speculation.
tags: [prompting, system-prompt, llm-tutor]
published_at: 2025-05-20
relevance: strong
---

# Apply to our 7 prompts

Every `lib/domains/english/prompts/*.ts` should contain:
1. Role ("You are an encouraging English tutor specializing in Russian L1 speakers")
2. Learner context ({level}, common L1 traps)
3. Success criteria ("user leaves with one clear takeaway and optional homework")
4. Failure modes ("don't correct aggressively in Mode 1 — kills anxiety-free flow")
5. Output format (Markdown, specific sections for some modes)
6. 1-2 worked examples

Length target: 300-500 words per mode prompt. Worth the token budget — every
turn benefits.
