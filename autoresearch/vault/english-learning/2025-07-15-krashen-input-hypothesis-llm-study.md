---
type: english-learning
source: frontiers-education
url: https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1614680/full
title: "Testing Krashen's input hypothesis with AI: a mixed-methods study"
tldr: |
  Empirical study (2025, Frontiers in Education) tested whether LLM-generated
  reading input calibrated to a learner's proficiency improves oral fluency
  in EFL. Result: statistically significant gains when input is at the
  learner's i+1 level vs. generic internet text. Supports the core design
  premise of our English tutor: the system prompt must model the learner's
  CEFR level and stay one step above it.
tags: [comprehensible-input, llm-tutor, cefr, research, adults]
published_at: 2025-07-15
relevance: strong
---

# Prompt-design takeaway

Bake the current CEFR level into every system prompt. Instruct the model
explicitly: "You are talking to a {level} learner. Use vocabulary they
already know 95% of the time; introduce 1-2 new words per turn with
context."

Mode 1 (Native/Chat) benefits most — the model drifts upward if you don't
anchor it.
