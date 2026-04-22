---
type: english-learning
source: oxford-elt
url: https://elt.oup.com/feature/global/oxford-online-placement/
title: "Oxford Placement Test — computer-adaptive CEFR assessment"
tldr: |
  Canonical industry-standard adaptive placement test for adults. IRT
  parameters adjust difficulty per response; two sections (Use of English
  + Listening), ~40 minutes total, Pre-A1 to C2. Test-retest reliability
  0.91 overall. Provides a methodological benchmark our in-app placement
  can calibrate against.
tags: [cefr, placement, adaptive, oxford]
published_at: 2025-08-22
relevance: strong
---

# Implications for our placement flow

Our MVP uses 15 static questions — fine to ship. For v1.1, evolve to an
adaptive version using IRT-like logic: start mid-range, step up on correct,
step down on wrong, narrow to a band in ~10 questions. Can reuse the same
question bank with difficulty tags.
