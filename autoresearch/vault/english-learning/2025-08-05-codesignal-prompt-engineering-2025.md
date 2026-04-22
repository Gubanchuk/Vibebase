---
type: english-learning
source: codesignal
url: https://codesignal.com/blog/prompt-engineering-best-practices-2025/
title: "Prompt engineering best practices 2025 — applied to tutoring"
tldr: |
  2025-current collection of prompt patterns. Most relevant for our tutor:
  (a) system prompts do the heavy lifting — often 85% of quality is there;
  (b) few-shot examples beat abstract instructions for nuanced tasks like
  "correct without breaking flow"; (c) Claude specifically tends to
  over-explain unless bounded ("keep response under 3 sentences").
tags: [prompting, system-prompt, claude, tutor-design]
published_at: 2025-08-05
relevance: strong
---

# Applied to each English mode

- **Mode 1 (Native chat):** few-shot of "good correction that doesn't break flow"
- **Mode 2 (Lesson):** system prompt locks format: hero card + 3 examples + 1 self-test
- **Mode 3 (Translate):** constrain to exactly "translation + 1-sentence why"
- **Mode 4 (Flashcards):** output 8 items as strict JSON (list of {en, ru, note})
- **Mode 5 (Grammar):** "answer under 120 words unless user asks to expand"
- **Mode 6 (Quiz):** 5 MCQs, answers shown only on request

Claude's tendency to over-explain is a real cost driver if unbounded — we
already cap `maxOutputTokens`, but system-level verbosity guards save more.
