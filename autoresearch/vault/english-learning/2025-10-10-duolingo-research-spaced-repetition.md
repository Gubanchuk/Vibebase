---
type: english-learning
source: industry-research
url: https://research.duolingo.com/
title: "Duolingo research — half-life regression for spaced repetition"
tldr: |
  Duolingo's half-life regression (HLR) model predicts when a learner will
  forget a vocabulary item and schedules review accordingly — outperforms
  classic Leitner/SM-2 for high-frequency learning. Key insight: recall
  probability depends not just on time since last review but on the specific
  item, the learner's prior exposure, and their overall level.
tags: [spaced-repetition, vocabulary, research, flashcards]
published_at: 2025-10-10
relevance: strong
---

# For Mode 4 (Flashcards)

MVP: simple Leitner-style 1-3-7-14-30 day intervals, stored per-user per-card.
v2: swap to HLR if we collect enough review data (need ~50+ events per card
to train meaningful half-life estimates).
