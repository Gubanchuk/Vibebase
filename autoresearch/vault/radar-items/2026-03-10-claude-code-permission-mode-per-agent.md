---
type: radar-item
source: claude-code-changelog
url: https://docs.claude.com/en/docs/claude-code/changelog
title: "Claude Code custom agents get per-agent permissionMode"
tldr: |
  Custom agent config (`.claude/agents/*.md`) gained a `permissionMode` field
  letting you control tool-approval behavior per agent. Also: `skills:` in
  agent frontmatter auto-loads the listed skills when the agent runs.
tags: [claude-code, subagents, permissions, skills]
published_at: 2026-03-10
relevance: strong
related_skill: vibecoding
---

# Pattern

For a careful-mode agent ("refactor-legacy"), set `permissionMode: ask`; for
research-mode ("explore-codebase"), `permissionMode: acceptEdits`. No more
blanket session-level settings that fight with per-task intent.
