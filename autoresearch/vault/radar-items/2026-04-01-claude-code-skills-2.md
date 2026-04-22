---
type: radar-item
source: community-blog
url: https://perevillega.com/posts/2026-04-01-claude-code-skills-2-what-changed-what-works-what-to-watch-out-for/
title: "What's new in Claude Code Skills 2.0"
tldr: |
  Skills 2.0 lets a skill spawn isolated subagents with their own context
  windows, and you can inject live data via shell commands before Claude
  sees the skill prompt. Skill-creator adds `evals` — run your skill on test
  prompts and grade output against your criteria. Big upgrade for anyone
  building composable agent pipelines.
tags: [claude-code, skills, subagents, evals]
published_at: 2026-04-01
relevance: strong
related_skill: vibecoding
---

# Practical implication

The isolated-subagent-per-skill model means skills are no longer "prompt
includes". They're mini-agents with their own budget and transcript. This
reopens the question: should each of our English modes be a skill, or just a
system prompt? Skills become worth it when mode needs its own tools (e.g.
"Mode 4 Flashcards" could have a `spaced-repetition-store` tool).

Evals via skill-creator is the missing piece — finally a canonical way to
regression-test a prompt change.
