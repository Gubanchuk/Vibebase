---
type: radar-item
source: anthropic-blog
url: https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7
title: "Claude Opus 4.7 is generally available — SWE-bench Pro jumps to 64.3%"
tldr: |
  Anthropic shipped Opus 4.7 on 2026-04-16. Headline: SWE-bench Verified 87.6%
  (up from 80.8%), SWE-bench Pro 64.3% (up from 53.4% — industry's highest on
  real-world engineering tasks). New `xhigh` effort level sits between `high`
  and `max` for finer reasoning/latency control, and Claude Code gets a new
  `/ultrareview` command that runs a dedicated review session flagging bugs
  and design issues.
tags: [opus-4, claude-code, benchmarks, coding]
published_at: 2026-04-16
relevance: strong
related_skill: vibecoding
---

# Why this matters

The delta on SWE-bench Pro (+10.9 over Opus 4.6) is the biggest single-release
jump in coding benchmarks of the last year. Pairs well with `/ultrareview` in
Claude Code — you can have Opus draft + review in one session.

Also note: 1M token context, 128k max output, adaptive thinking preserved from
4.6 — no behavioral surprises for agent pipelines already on Opus.
