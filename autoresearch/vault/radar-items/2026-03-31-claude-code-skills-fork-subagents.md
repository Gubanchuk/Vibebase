---
type: radar-item
source: trensee-blog
url: https://www.trensee.com/en/blog/explainer-claude-code-skills-fork-subagents-2026-03-31
title: "Claude Code advanced patterns — connecting skills, fork, and subagents"
tldr: |
  Deep-dive on stacking Claude Code features — skills for reusable capability
  packs, `/fork` to branch the session while keeping the original context,
  and subagents for isolated task execution. The value compounds when you
  combine them: a fork keeps main-thread clean, the subagent does the heavy
  lift, the skill formalizes the interface.
tags: [claude-code, skills, subagents, patterns]
published_at: 2026-03-31
relevance: strong
related_skill: vibecoding
---

# The combo recipe

1. Main thread plans
2. `/fork` captures the plan
3. Subagent executes (with allowlisted tools from a skill)
4. Main thread receives result, continues

This is roughly the "Spec → Plan → Execute" decomposition the Superpowers
plugin formalizes, just at a lower level.
