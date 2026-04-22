---
type: english-learning
source: sciencedirect
url: https://www.sciencedirect.com/science/article/pii/S2772766125000205
title: "Assigning CEFR-J levels to English learners' writing — lexical metrics + generative AI"
tldr: |
  2025 paper combining lexical complexity metrics (type-token ratio,
  AoA-weighted word frequency) with an LLM judge to auto-rate learner
  writing against the CEFR-J scale (a finer-grained fork of CEFR used in
  Japanese education). Agreement with human raters ~0.78 Cohen's kappa —
  high enough for formative feedback, not summative placement.
tags: [cefr, writing, assessment, llm-grading]
published_at: 2025-07-01
relevance: moderate
---

# Use for Mode 1 (Native chat) feedback

Append a silent post-turn analysis: "Based on this message, lexical level
was A2+; to grow toward B1+, try using X, Y collocations." Requires the
metrics pipeline; worth it for a v1.1 feature.
