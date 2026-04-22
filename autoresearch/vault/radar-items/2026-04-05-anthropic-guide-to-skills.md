---
type: radar-item
source: anthropic-resources
url: https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf
title: "The Complete Guide to Building Skills for Claude (PDF)"
tldr: |
  Официальный comprehensive guide от Anthropic — PDF на ~80 страниц
  с полным теоретическим фундаментом и практическими примерами.
  Покрывает: анатомия SKILL.md, trigger-description как классификатор,
  skill-creator evals, isolation via subagents, shell-injection live
  data, debugging через hooks, case-study портфель от Anthropic и
  partners (PlanetScale, Google Workspace, Remotion).
tags: [claude-code, skills, docs, canonical]
published_at: 2026-04-05
relevance: strong
related_skill: vibecoding
---

# Структура гайда

1. Why skills exist (problem they solve)
2. SKILL.md anatomy (frontmatter + body)
3. Triggers: writing descriptions как classifier
4. Tool allowlist: principle of least privilege
5. Skills 2.0: isolated subagents + evals
6. Live-data injection через shell hooks
7. Debugging: hook'и на SubagentStart/Stop
8. Case studies (~20 production skills)
9. Anti-patterns + migration from v1
10. Future roadmap (community registry 2026-H2)

# Канонический источник

Когда создаёшь новый скилл — начни с этой PDF, не с community blog'ов.
В community bloggers часто outdated описания v1-скиллов, которые в
Skills 2.0 работают по-другому.

# Применимо у нас

Для Vibebase: Teacher-промпт должен ссылаться на эту PDF как authoritative
source когда обучает теме «как писать скиллы». Добавить в vault-refs
топика `skills-files` в учебном плане.
