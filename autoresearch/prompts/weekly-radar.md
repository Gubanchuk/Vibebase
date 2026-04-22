# Weekly Vibecoding Radar — Autoresearch Prompt

## Autoresearch configuration

**Goal:** Collect fresh (past 7 days) material about Claude Code, coding agents,
Vercel AI SDK, Model Context Protocol, and vibecoding tooling from official
blogs, Reddit, and curated Twitter/X accounts. Write each discovery as a
markdown card into `autoresearch/vault/radar-items/` with YAML frontmatter
conforming to `RadarItemSchema`. Update `_INDEX.md` after every iteration.

**Metric:** Number of new, deduplicated radar items added with
`relevance: strong` or `moderate`, published in the past 7 days.

**Direction:** Maximize (target 10–30 items per run; 3–8 marked `strong`).

**Verify:** For each new item, confirm:
- URL is reachable (HEAD 200)
- `published_at` is within the past 7 days
- Content is genuinely about the topic (not a passing mention)
- No existing file in `vault/radar-items/` has the same URL

**Guard:**
- Do not include items older than 7 days (unless explicitly widening the window — note it in `_INDEX.md`)
- Do not include duplicates — check URL against existing files BEFORE creating
- Do not invent content — every `tldr` must be grounded in the actual source
- Mark uncertain relevance as `moderate`; reserve `strong` for concrete product/tool/pattern releases or heavily-upvoted community patterns
- Do not emit frontmatter that fails the `RadarItemSchema` contract (see `app/lib/domains/radar/schema.ts`)
- Maximum 40 items per run; prefer quality over quantity

**Iterations:** 3

**Protocol:**

### 1. Baseline

Read every file under `vault/radar-items/`. Build a `Set<url>` of existing URLs.
Record baseline counts in `_INDEX.md` (total, by tag, by source).

### 2. Search pass — Official sources (highest trust)

- Anthropic News: https://www.anthropic.com/news
- Anthropic Engineering blog: https://www.anthropic.com/engineering
- Claude Code changelog: https://docs.claude.com/en/docs/claude-code/changelog
- Claude Code skills/hooks/subagents docs pages
- Vercel changelog: https://vercel.com/changelog
- Vercel AI SDK releases: https://github.com/vercel/ai/releases
- OpenAI blog: https://openai.com/blog
- Model Context Protocol blog: https://blog.modelcontextprotocol.io

### 3. Search pass — Reddit (via public JSON, last 7 days top)

- `https://www.reddit.com/r/ClaudeAI/top.json?t=week`
- `https://www.reddit.com/r/LocalLLaMA/top.json?t=week`
- `https://www.reddit.com/r/ChatGPTPromptGenius/top.json?t=week`
- Include only posts with score ≥ 50 and on-topic per Guard

### 4. Search pass — Twitter/X (curated list)

- @simonw, @swyx, @AnthropicAI, @karpathy, @rauchg, @jaredpalmer
- Include only tweets with ≥ 200 likes AND links to substantial content

### 5. Candidate evaluation

For each discovered item:
- Fetch the page; extract title + publish date + 2–3 representative sentences
- Reject if: older than 7 days, duplicate URL, off-topic, paywalled without free excerpt
- Score relevance:
  - `strong` — concrete product/feature release, novel technique with working code, consensus community pattern (upvotes > 200 / likes > 500)
  - `moderate` — useful discussion, partial insight, context-dependent
  - `weak` — tangential; skip entirely

### 6. Write card

For each kept item create `vault/radar-items/<yyyy-mm-dd>-<slug>.md`:

```markdown
---
type: radar-item
source: anthropic-blog
url: https://www.anthropic.com/news/<slug>
title: "Claude Code 2.7 — subagents as first-class primitives"
tldr: |
  2–4 sentence summary, grounded in actual source.
tags: [claude-code, agents, subagents]
published_at: 2026-04-19
relevance: strong
related_skill: vibecoding
---

# Optional deep-dive body (markdown)
```

### 7. Update `_INDEX.md`

Table of all items grouped by week with counts:

```markdown
# Radar index — last updated 2026-04-21

## Counts
- Total: 47 items
- This week: 14 new (3 strong, 9 moderate, 2 retro)
- Tags: claude-code (18), agents (12), mcp (8), prompts (6), tooling (3)

## Week of 2026-04-15
- [2026-04-19] [strong][anthropic-blog] Claude Code 2.7 — subagents as first-class primitives
- [2026-04-18] [strong][r/ClaudeAI] "Skill files" — prompt into multi-step agent
- ...
```

### 8. Iterate

Repeat up to 3 iterations: if a referenced item leads to another on-topic
source (blog post citing a GitHub repo), chase it within the budget.

## Tips

- **Log negative results:** if a source was searched and nothing fresh found,
  note it in `_INDEX.md` under a "Searched, found nothing" section.
- **Prefer canonical URLs:** if a tweet links a blog post, cite the blog post.
- **Deduplicate by URL aggressively** — sync script also dedups, but a clean
  vault makes diffs readable.
