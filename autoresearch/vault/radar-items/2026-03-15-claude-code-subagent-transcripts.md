---
type: radar-item
source: claude-code-changelog
url: https://docs.claude.com/en/docs/claude-code/changelog
title: "Claude Code — SubagentStart/Stop hooks now include agent_id and transcript_path"
tldr: |
  SubagentStop (and new SubagentStart) hook events now carry `agent_id` and
  `agent_transcript_path` fields. You can track and analyze subagent behavior
  with full transcript access — observability for agent pipelines finally
  matches what you have for the main thread.
tags: [claude-code, subagents, hooks, observability]
published_at: 2026-03-15
relevance: strong
related_skill: vibecoding
---

# How to use

Register a hook that tails each subagent transcript into a local log dir.
That gives you per-subagent cost, tool-call audit, and failure forensics
without leaning on third-party observability tooling.
