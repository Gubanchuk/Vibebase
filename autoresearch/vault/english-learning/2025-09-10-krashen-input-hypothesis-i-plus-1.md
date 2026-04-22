---
type: english-learning
source: sdkrashen
url: https://www.sdkrashen.com/content/articles/case_for_comprehensible_input.pdf
title: "Krashen — The Case for Comprehensible Input (canonical source)"
tldr: |
  Krashen's input hypothesis: language is acquired by receiving input
  slightly above the learner's current level (i+1), provided it is
  understood. Practically: learners should know ~90% of the words/structures
  so the novel ~10% is supported by context. Lays the theoretical ground
  for level-calibrated AI tutor output.
tags: [comprehensible-input, krashen, theory, adults]
published_at: 2025-09-10
relevance: strong
---

# How to bake into the tutor prompt

System prompt pattern: "The learner's CEFR level is {level}. Compose replies
so that ~90% of the vocabulary and all grammar patterns are at or below that
level, with at most one new item per turn. Gloss the new item inline."

This replaces the common mistake of "simplify for beginners" (too loose) with
an operational rule the model can follow.
