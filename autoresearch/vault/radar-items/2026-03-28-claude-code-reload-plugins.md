---
type: radar-item
source: claude-code-changelog
url: https://docs.claude.com/en/docs/claude-code/changelog
title: "Claude Code — /reload-plugins picks up new skills without restart"
tldr: |
  Small but welcome quality-of-life change: `/reload-plugins` now picks up
  plugin-provided skills without requiring a CLI restart. The `/agents`
  command also got a tabbed UI split into "Running" (live subagents) and
  "Library" (available).
tags: [claude-code, skills, ux]
published_at: 2026-03-28
relevance: moderate
---

# Concrete win

Iterating on a skill file no longer means killing your session. Accumulates
with the new subagent transcript fields (see separate item).
