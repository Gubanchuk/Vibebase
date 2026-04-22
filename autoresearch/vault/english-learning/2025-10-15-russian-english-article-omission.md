---
type: english-learning
source: talk-schools
url: https://blog.talk.edu/learn-english/common-grammar-errors-russian-speakers/
title: "Most common grammar errors Russian speakers make in English — articles & tenses"
tldr: |
  Russian has no articles (a/the), so Russian-L1 learners regularly omit
  them ("It's very popular city", "We booked table in restaurant"). Also
  conflate Present Perfect and Present Simple because Russian lacks a
  direct Perfect equivalent ("I'm training pole sport 6 years" →
  "I have been training..."). These are high-frequency, low-difficulty
  errors to auto-flag in our mistake extractor.
tags: [russian-l1, articles, tenses, grammar]
published_at: 2025-10-15
relevance: strong
---

# Auto-flag patterns (regex-ish heuristics for the mistake extractor prompt)

- Sentences without `a|an|the|my|your|etc.` before a countable singular noun
- `[verb] for [time-duration]` without Perfect form
- Copula omission ("I doctor" vs. "I am a doctor")

Cheap to detect even without a full grammar parser — great for the Haiku
second-pass mistake extractor.
