# Vibebase

A personal skills platform — an AI English tutor, a vibecoding tutor, a
curated vibecoding radar, and a markdown journal, all wired through a
single cost-aware `AiKernel`.

Built by one person, for one person. The point is not to be a SaaS for
others; the point is to put everything that moves learning forward into one
place: structured practice (English modes, Vibecoding modes), structured
knowledge (skill trees you grow with AI), structured signal (weekly radar
of what's happening in the Claude Code / AI SDK / MCP space), and
structured reflection (a journal that links to everything else).

---

## What's inside

### English tutor — 6 modes around a CEFR level
Placement test maps you onto the CEFR ladder (A1 → C2). Level is written to
Supabase and drives the tone and depth of every tutor reply. Six modes:

- **Native chat** — freeform conversation, mistakes flagged gently
- **Personal Lesson** — one topic, structural breakdown, self-check
- **Translate** — RU ↔ EN with a reason for every phrasing choice
- **Flashcards** — level-tuned vocabulary with collocations
- **Grammar** — tight rule explanation with contrastive pairs
- **Quiz** — 5 multi-choice items, graded with explanations

Retakes are additive: each attempt appends a row to `placement_results`,
the profile holds the latest level, and the dashboard shows your trajectory.

### Vibecoding tutor — same pattern, different content
Placement with 15 questions from Claude Code basics to MCP / AI SDK 6
internals maps you to one of four levels:

`Newbie → Practitioner → Architect → Maintainer`

The level seeds a Vibecoding skill tree automatically (Foundations /
Agents / AI SDK / Patterns / Frontier / Production — depth depends on
level), which you grow as you study. Six modes:

- **Explain** — idea → mechanics → gotcha → when NOT to use → self-check
- **Chat** — think-out-loud sparring, no empty agreement
- **Review** — severity-ranked code / skill / agent review
- **Recipe** — 5–8 step runnable recipe with code and gotchas
- **Radar debrief** — turn a read radar item into 2–4 actions this week
- **Challenge** — mini-quest under your level, checked strictly

Each mode has a hand-crafted system prompt (~400 words) that enforces an
output contract.

### Vibecoding radar
A feed of curated items about Claude Code, AI SDK, MCP, agent patterns, and
model releases, powered by a local autoresearch loop:

```
/autoresearch autoresearch/prompts/weekly-radar.md
   ↓
autoresearch/vault/radar-items/*.md  (markdown with YAML frontmatter)
   ↓
pnpm sync:radar   (parses the vault, upserts into Supabase via service role)
   ↓
UI at /radar reads from Supabase
```

Each radar item has an internal detail page with a full Russian summary
(~200–400 words), a TL;DR card, tags, and a **"Discuss with tutor"** button
that launches the vibecoding `debrief` mode with the item prefilled as
context.

### Skill trees
Greenfield skills: you give a name + goal + level, GPT-5.4 generates a
structured roadmap (3–8 root nodes, each with 0–6 children) through
`generateObject` + Zod, and it's saved to Supabase. Each node can have
lessons (hand-crafted or AI-generated) tracked in `lesson_progress`.

### Journal
Markdown journal with templates (Daily Reflection, Lesson Note, Idea,
Weekly Review), autosave, backlinks to skills / lessons / radar items,
live preview with Split-view option, localStorage-backed (Supabase in
v2).

### Cost & budget
Every AI call flows through `lib/core/ai-kernel.ts`. `BudgetGuard`
enforces four layers: pre-call hard gate, 80% soft warning,
`maxOutputTokens` from `budget_config`, and a 90-second watchdog.
`/settings/usage` shows today's spend, MTD, per-domain breakdown, the
last 50 calls, and editable caps.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| UI | React 19, **Tailwind v4**, shadcn-style primitives hand-rolled, lucide-react, Radix UI |
| State / data | Server Components + Server Actions + localStorage for journal MVP |
| Auth & DB | **Supabase** (Auth password-based, Postgres with RLS on every user-scoped table) |
| AI | **OpenAI GPT-5.4** (and -mini) via AI SDK 6 — `streamText`, `generateObject` |
| Typography | Inter (body), JetBrains Mono (metadata), Instrument Serif (accent italics) |
| Theme | Dark only; V1 density + V3 coral→amber gradient accents — see `docs/superpowers/design/v4-hybrid.html` |

---

## Getting started

```bash
# 1. Install
cd app
npm install

# 2. Fill env
cp ../.env.example .env.local
# edit with real Supabase + OpenAI keys

# 3. Apply migrations (Supabase SQL Editor)
#    Run in order: 0001_init.sql → 0002_rls.sql → 0003_vibecoding.sql

# 4. Create your user
npx tsx scripts/setup-user.ts

# 5. Run
npm run dev
# → http://localhost:3000
```

---

## Repository layout

```
Vibebase/
├── app/                          ← Next.js 16 project (the product)
│   ├── app/                      ← routes
│   │   ├── (auth)/sign-in
│   │   ├── (app)/
│   │   │   ├── dashboard
│   │   │   ├── english/{page,[mode],placement,...}
│   │   │   ├── vibecoding/{page,[mode],placement,...}
│   │   │   ├── skills/{page,new,[slug],...}
│   │   │   ├── radar/{page,[id]}
│   │   │   ├── journal/{page,new,[id]}
│   │   │   └── settings/{page,usage}
│   │   └── api/
│   │       ├── english/chat
│   │       ├── vibecoding/chat
│   │       └── skills/[id]/lessons/generate
│   ├── components/
│   │   ├── shell/                ← Sidebar, TopBar, BottomTabs, CommandPalette
│   │   ├── ui/                   ← button, chip, card, dialog, popover, ...
│   │   ├── english/, vibecoding/, skills/, radar/, journal/
│   ├── lib/
│   │   ├── core/                 ← AiKernel, BudgetGuard, auth, pricing, types
│   │   ├── infra/supabase/       ← server, client, admin clients
│   │   └── domains/              ← english, vibecoding, skills, radar, journal
│   ├── supabase/
│   │   ├── migrations/0001..0003.sql
│   │   ├── tests/rls/*.test.sql  ← pg_tap RLS tests
│   │   └── seed.sql
│   └── scripts/setup-user.ts
├── autoresearch/                 ← Karpathy-style research loop
│   ├── prompts/{weekly-radar,english-research}.md
│   └── vault/
│       ├── radar-items/          ← raw findings (markdown + frontmatter)
│       ├── english-learning/     ← raw methodology research
│       └── curated/              ← filtered top items
├── docs/
│   └── superpowers/
│       ├── design/v4-hybrid.html ← canonical visual reference
│       ├── plans/final-plan.md   ← implementation plan (source of truth)
│       └── specs/                ← brainstorm + tournament specs
└── STATUS.md                     ← current state and what's next
```

---

## Design language

Dark-only. Near-black base (`#0a0a0a`) with subtle coral/violet mesh at
body level. The accent palette is a coral→amber linear gradient reserved
for active states, streaming indicators, primary CTAs, and logos. Violet
as secondary accent. `Instrument Serif` italic on exactly one word per
heading adds character without going cute. Canonical reference:
[`docs/superpowers/design/v4-hybrid.html`](./docs/superpowers/design/v4-hybrid.html).

---

## Status

See [STATUS.md](./STATUS.md) for the current build state, what's wired,
what's stubbed, and what's next on the roadmap.

---

## License

All rights reserved. Personal project — not licensed for redistribution.
