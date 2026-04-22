---
type: english-learning
source: oxford-elt
url: https://elt.oup.com/feature/global/oxford-online-placement/
title: "Oxford Placement Test — adaptive CEFR methodology reference"
tldr: |
  Oxford's computer-adaptive placement uses Item Response Theory (IRT) with
  difficulty and discrimination parameters pretested on global populations.
  Test-retest reliability 0.91 across the whole test, 0.87 on Use of English,
  0.82 on Listening. Two sections, ~40 minutes. Adapts difficulty after
  every response.
tags: [cefr, placement, adaptive, irt, methodology]
published_at: 2025-09-20
relevance: strong
---

# Applied to our app

Our MVP placement is 15 static questions (A1→C1 ramp), NOT adaptive. That's
a v1 compromise — acceptable since single-user. For v2, replace with an
AI-driven adaptive loop: the model picks the next question based on a
rolling estimate of level, stops when confidence ≥ 0.8.

Target metrics from Oxford's reliability benchmarks: aim for test-retest
correlation ≥ 0.85 before swapping out the static fallback.
