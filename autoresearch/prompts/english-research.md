# English Learning Methodology — Autoresearch Prompt

## Autoresearch configuration

**Goal:** Gather methodology signal for the AI English tutor: CEFR placement,
comprehensible input, corrective feedback, common L1→L2 (Russian → English)
transfer errors, vocabulary acquisition techniques, conversation practice
design, and effective LLM-tutor prompt patterns. Write each finding as a
markdown file into `autoresearch/vault/english-learning/` with frontmatter
(`type: english-learning`). Run cadence is **monthly** (not weekly).

**Metric:** Number of new, deduplicated items with `relevance: strong` or
`moderate`, each grounded in a verifiable source (paper, teacher blog,
language school publication, or reputable industry resource).

**Direction:** Maximize within quality bar. Target 5–15 items per monthly
run, covering broad time window (prior 12 months, not just 7 days).

**Verify:** For each item:
- URL reachable
- Source is reputable (peer-reviewed, established ELT org, working teacher, or
  well-known LLM tutor vendor with public methodology)
- Content is actionable: names a method, cites a study, or extracts a pattern

**Guard:**
- Do not include generic "AI will change education" opinion pieces
- Do not include items that are only marketing copy for language apps
- Do not confuse *comprehensible input* (Krashen) with *comprehensive input*
  (meaningless phrase) — watch for clickbait
- Prefer content that cites empirical work (RCTs, meta-analyses) when
  available over purely anecdotal posts
- Russian-English specifics (article omission, aspect/tense mismatch,
  preposition transfer) are high-priority

**Iterations:** 2

**Protocol:**

### 1. Baseline

Read every file under `vault/english-learning/`. Build URL set. Record counts
in `_INDEX.md` by tag and by source type.

### 2. Source passes (priority order)

**Academic:**
- Google Scholar: "CEFR placement adaptive", "comprehensible input adults",
  "corrective feedback SLA", "L1 transfer Russian English"
- ScienceDirect, Springer, Frontiers in Psychology / Education
- ResearchGate public PDFs

**Professional ELT:**
- Cambridge English Assessment publications
- Oxford University Press ELT blog
- British Council TeachingEnglish
- TESOL International Association

**LLM tutor methodology:**
- Duolingo Research blog
- Papers about LLM language tutoring (arXiv cs.CL)
- Leonardo English, FluentForever, Pimsleur (public method docs)

**Russian-specific:**
- Study.ru, Онлайн-школа OTUK, Heather Hughes blog
- Polyglottist Language Academy posts on Russian↔English transfer

### 3. Candidate evaluation

For each item:
- Confirm source type (academic / professional / applied / industry)
- Extract 2–4 sentence summary grounded in source text
- Tag with: `cefr`, `placement`, `comprehensible-input`, `corrective-feedback`,
  `vocabulary`, `russian-l1`, `prompting`, `conversation-practice`,
  `grammar-teaching`, `spaced-repetition`, as applicable
- Score:
  - `strong` — empirical finding, widely-cited method, directly applicable to
    an LLM tutor system prompt
  - `moderate` — useful heuristic or pattern, possibly anecdotal
  - `weak` — skip

### 4. Write card

```markdown
---
type: english-learning
source: frontiers-psychology
url: https://www.frontiersin.org/articles/...
title: "..."
tldr: |
  ...
tags: [comprehensible-input, adults, llm-tutor]
published_at: 2025-11-12
relevance: strong
---

# Optional deep body — key passages, numbers, how to bake into a tutor prompt.
```

### 5. Update `_INDEX.md` and surface to tutor prompts

- Maintain the index like the radar version
- Highlight items that suggest concrete prompt changes ("system prompt should
  emphasize i+1 calibration"), so the next English-domain prompt audit can
  pull from them.

### 6. Iterate

One second pass chasing citations from any `strong` items.

## Curation rule

After each monthly run, copy the top 5 items into
`vault/curated/english/` with a 1-paragraph note per item explaining why
it's in curated (which tutor prompt it should influence, which feature in the
app it supports).
