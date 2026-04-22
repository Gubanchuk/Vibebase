---
type: english-learning
source: sciencedirect
url: https://www.sciencedirect.com/science/article/pii/S2772766125000205
title: "Assigning CEFR-J levels to English learners' writing — lexical metrics + generative AI"
tldr: |
  Hybrid approach: lexical-metric features (type-token ratio, AWL coverage)
  fused with LLM-generated rubric scores predict CEFR-J level (A1–C1) with
  sub-band accuracy. Key contribution: confidence modeling — low-confidence
  predictions held back from high-stakes use. Useful pattern for our
  placement: always surface a confidence number with the level.
tags: [cefr, placement, writing, llm-assessment, confidence]
published_at: 2025-06-15
relevance: strong
---

# Implementation note

Return `{ level, confidence }` from the placement endpoint. Below 0.7
confidence, show "roughly B1-ish — let's verify in the first lesson" copy.
