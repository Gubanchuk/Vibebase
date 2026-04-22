# Personal Skills Platform — Design Spec

**Date:** 2026-04-21
**Status:** Draft — awaiting user review
**Owner:** user (An.guban79@gmail.com)

## 1. Goal

Single-user (initially) web platform for personal skill development, combining:

1. **AI English tutor** — six distinct prompt-driven tutoring modes powered by Claude/GPT
2. **Skill growth (Прокачка навыков)** — per-skill roadmap trees with lessons, progress, and AI-generated content
3. **Vibecoding radar** — weekly curated feed of fresh material on Claude Code, agents, prompting, MCP, vibecoding
4. **Journal** — markdown journal with templates and backlinks to skills/lessons

Target: a central hub for learning English, tracking learning across arbitrary skills, staying current on AI-dev tooling, and reflecting through structured writing.

## 2. Scope

### In-scope (MVP)

- Auth (Supabase, magic-link email, single-user in practice; invite-gated later)
- All four subsystems above at functional-complete level
- Desktop + mobile web (responsive)
- Text-only interactions for English tutor (no voice in MVP)
- Placement test on first English entry

### Out-of-scope (v2+)

- TTS/STT (ElevenLabs + Whisper)
- YouTube transcript ingestion for radar
- Full multi-user onboarding with quotas/billing
- E2E-encrypted journal
- Multi-language tutor (non-English targets)
- Mobile native apps / offline PWA sync

## 3. Architectural Approach

### Chosen approach: **Monolith Next.js 16** + **local autoresearch** for radar

**Why:**
- One codebase, one deployment, fast to ship
- Vercel-native integrations (AI Gateway, Cron, Supabase Marketplace)
- Radar pipeline reuses the existing `autoresearch-genealogy-main` pattern (Goal/Metric/Verify/Guard/Protocol prompts) — runs locally via Claude Code CLI, syncs to Supabase through a small script
- Local autoresearch = $0 server cost for long-running web research, proven mental model for the user
- Easy to migrate radar to Vercel Workflow (WDK) or cron-headless-Claude later if scale demands

### Rejected alternatives

- **Turborepo monolithic monorepo (web + worker):** unnecessary overhead for single-user MVP, adds two deploy targets
- **Vercel Workflow DevKit for radar:** overkill when Claude Code CLI already has an autoresearch pattern that maps perfectly
- **Other frameworks (SvelteKit/Astro/Remix):** Next.js 16 gives us best-in-class AI SDK integration, Cache Components, and Vercel optimizations we will want

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (email magic link) |
| DB | Supabase Postgres (RLS enabled) |
| Storage | Supabase Storage (for future attachments) |
| AI | Vercel AI Gateway (`ai` SDK v6) with `"anthropic/claude-sonnet-4-6"` / `"anthropic/claude-haiku-4-5"` / `"openai/gpt-4.1-mini"` as needed |
| Radar pipeline | Claude Code CLI `/autoresearch` (local) + sync script |
| Deploy | Vercel (Fluid Compute, default Node 24 runtime) |
| Cron | Vercel Cron for lightweight periodic jobs (e.g., nightly progress aggregation) |
| Config | `vercel.ts` (TypeScript-typed config) |

No API key gating for now (user is sole user); usage visibility via AI Gateway observability. Add per-user quotas only if multi-user onboarding begins.

## 5. Module Breakdown

### 5.1 Auth & Profile

- Magic-link email sign-in (Supabase Auth)
- `user_profiles` table: `english_level`, `display_name`, `timezone`, `created_at`
- Onboarding flow: after first sign-in → English placement test → profile seeded

### 5.2 English Tutor

**UX**: `/english` shows a grid of six mode cards. Click → enters a chat surface pre-loaded with the mode's system prompt.

**Modes (system-prompt variants):**

| Mode | Trigger | System-prompt essence |
|---|---|---|
| 1. Native Speaker | "Разговор с носителем" | Act as a native speaker of a chosen country; topic conversation; correct every grammar/vocab mistake inline with explanation |
| 2. Personal Lesson | "Урок" | Produce a 30-min intensive lesson on grammar+conversation+listening with practical examples and a mini-test |
| 3. Translation + Logic | "Перевод" | Translate text; explain word-choice rationale + alternatives like a linguist |
| 4. Flashcards | "Карточки" | Generate digital flashcards for 20 user-supplied words with memorable hints + everyday-life usage examples |
| 5. Grammar for 5yo | "Грамматика" | Explain a grammar rule like to a 5-year-old; highlight 3 most common learner mistakes |
| 6. Quiz | "Квиз" | Build a 10-question quiz on topics from this week; never reveal answers until user responds |

Each system prompt accepts user's `english_level` (from placement) as a parameter, so tutor complexity matches the learner.

**Placement test**: 15-question adaptive test generated via Haiku on first entry. Result stored in `placement_tests` and `user_profiles.english_level`.

**Chat history**: every session persisted in `english_sessions` + `english_messages` for review, export, and mistake-tracking.

**Mistake tracker**: parallel extraction — after each corrective turn, the AI is asked in a second cheap call to return `{original, correction, category}`; stored in `english_mistakes`. Powers a personal "most common mistakes" view.

### 5.3 Skill Growth (Прокачка навыков)

**Two-level structure**: list of skills → per-skill roadmap tree → node → lessons inside node.

**UX:**
- `/skills` — grid of user's skills with progress % per skill
- `/skills/[slug]` — roadmap view: tree/DAG of nodes (React Flow)
- Click node → right-side drawer with node description + list of lessons + checkbox progress
- `/skills/[slug]/lessons/[lessonId]` — full lesson view (rendered markdown)

**Content source (hybrid)**: user writes base markdown for nodes; a "Generate Lesson with AI" button opens a dialog (topic, depth, include-examples?, include-quiz?) and streams AI-generated lesson markdown into the editor. User can save as-is or edit.

**Progress**: `lesson_progress` table tracks `not_started | in_progress | completed`. Per-node % = avg over its lessons; per-skill % = avg over its nodes.

**Gamification**: progress bars + percentages + simple checkmarks. No XP, no streaks, no badges.

### 5.4 Vibecoding Radar

**Pipeline (local, user-driven weekly):**

1. User runs `claude "/autoresearch autoresearch/prompts/weekly-radar.md"` on their machine
2. Claude Code agent follows the Goal/Metric/Verify/Guard/Protocol in the prompt: searches official blogs (Anthropic/OpenAI/Vercel/Claude Code docs), Reddit (r/ClaudeAI, r/LocalLLaMA, r/ChatGPTPromptGenius), and curated Twitter/X list. Writes one markdown file per item into `autoresearch/vault/radar-items/` with YAML frontmatter
3. User runs `pnpm sync:radar` — small Node script reads vault, upserts into Supabase `radar_items` and `radar_tags`

**Frontmatter format (per item):**

```yaml
---
type: radar-item
source: anthropic-blog
url: https://...
title: ...
tldr: 2-3 sentence summary
tags: [claude-code, agents, prompting]
published_at: 2026-04-19
relevance: strong
---
# Full markdown body (optional, for deep-dive items)
```

**Frontend (`/radar`)**: Twitter-style card feed sorted by `published_at desc`. Filters: tag chips (MCP / Agents / Prompts / Claude Code / Tooling / Other), source toggles, relevance (strong only).

**Why local autoresearch:**
- Zero server cost for long web research
- Reuses the user's existing autoresearch mental model
- Headless automation later = trivial (`claude -p` from Cron on a small VPS)

### 5.5 Journal

- Free-form markdown editor (via `@mdxeditor/editor` or Novel)
- Template picker on "new entry": Daily reflection / Weekly retro / Post-lesson reflection / Free note
- Optional backlink to `skill_id` and/or `lesson_id`
- Search by tag, skill, date range
- No E2E encryption (standard RLS for now); paranoia mode deferred to v2

## 6. Data Model (Supabase schema)

```sql
-- core
user_profiles        (user_id PK, english_level, display_name, timezone, created_at)

-- english tutor
english_sessions     (id PK, user_id, mode, started_at, last_activity_at)
english_messages     (id PK, session_id FK, role, content, tokens_in, tokens_out, created_at)
english_mistakes     (id PK, user_id, message_id FK, original, correction, category, created_at)
placement_tests      (id PK, user_id, score, assigned_level, answers_jsonb, completed_at)

-- skills
skills               (id PK, user_id, name, slug, icon, color, created_at, archived_at)
skill_nodes          (id PK, skill_id FK, title, description, parent_id FK, position_x, position_y, order_index)
skill_lessons        (id PK, node_id FK, title, content_md, generated_by_ai bool, order_index, created_at)
lesson_progress      (user_id, lesson_id FK, status enum, completed_at, PK (user_id, lesson_id))

-- radar
radar_items          (id PK, source, url UNIQUE, title, tldr, body_md, published_at, relevance, created_at)
radar_tags           (id PK, slug UNIQUE, name)
radar_item_tags      (item_id FK, tag_id FK, PK (item_id, tag_id))

-- journal
journal_entries      (id PK, user_id, title, content_md, template_type, skill_id FK nullable,
                      lesson_id FK nullable, created_at, updated_at)
journal_tags         (id PK, user_id, name)
journal_entry_tags   (entry_id FK, tag_id FK, PK (entry_id, tag_id))
```

All tables have RLS policies: owner-only read/write keyed by `auth.uid() = user_id`.

## 7. Repo Structure

```
apps/web/
├── app/
│   ├── (auth)/sign-in/page.tsx
│   ├── (app)/
│   │   ├── english/
│   │   │   ├── page.tsx                        # 6-mode grid
│   │   │   ├── [mode]/page.tsx                 # chat surface
│   │   │   └── placement/page.tsx
│   │   ├── skills/
│   │   │   ├── page.tsx                        # skill list
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                    # roadmap tree view
│   │   │       └── lessons/[lessonId]/page.tsx
│   │   ├── radar/page.tsx
│   │   └── journal/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── api/
│       ├── chat/route.ts                       # AI SDK streamText
│       ├── english/placement/route.ts
│       ├── skills/generate-lesson/route.ts
│       └── radar/sync/route.ts                 # invoked by sync script
├── components/
│   ├── ui/                                     # shadcn base
│   ├── english/                                # mode cards, chat, placement
│   ├── skills/                                 # roadmap (React Flow), lesson viewer
│   ├── radar/                                  # feed, card, filters
│   └── journal/                                # editor, template picker
├── lib/
│   ├── supabase/{client,server,admin}.ts
│   ├── ai/
│   │   ├── gateway.ts                          # AI SDK wrapper
│   │   └── prompts/
│   │       ├── english/{1-native,2-lesson,3-translate,4-flashcards,5-grammar,6-quiz}.ts
│   │       ├── english/placement.ts
│   │       └── skills/generate-lesson.ts
│   └── db/                                     # typed query helpers
├── autoresearch/
│   ├── prompts/
│   │   └── weekly-radar.md                     # Goal/Metric/Verify/Guard/Protocol
│   └── vault/
│       └── radar-items/                        # markdown files created by Claude Code
├── scripts/
│   └── sync-radar.ts                           # reads vault → upserts Supabase
├── vercel.ts
├── package.json
└── tsconfig.json
```

## 8. Weekly Radar Prompt (sketch)

```markdown
# Weekly Vibecoding Radar

## Autoresearch Configuration

**Goal**: Collect fresh (past 7 days) material on Claude Code, AI agents, prompting, MCP,
and vibecoding tooling from official blogs, Reddit, and curated Twitter accounts.
Write each as a markdown card into `vault/radar-items/` with YAML frontmatter.

**Metric**: Number of new, deduplicated radar items added with `relevance: strong` or `moderate`

**Direction**: Maximize (target 10-30 items per run)

**Verify**: For each added item, confirm: URL is reachable, `published_at` within 7 days,
content is genuinely about the topic (not a generic mention), no existing file has same URL.

**Guard**:
- Do not include items older than 7 days
- Do not include duplicates (check URL against existing files before creating)
- Do not invent content — every `tldr` must be extracted from the actual source
- Mark speculative relevance as `moderate`; reserve `strong` for concrete product/tool/pattern releases

**Iterations**: 3

**Protocol**:
1. Read existing `vault/radar-items/*.md` — extract known URLs into a blocklist
2. Search official blogs: Anthropic News, OpenAI Blog, Vercel Changelog, Claude Code docs changelog
3. Search Reddit via public JSON (`r/ClaudeAI/new`, `r/LocalLLaMA/top/?t=week`, `r/ChatGPTPromptGenius/top/?t=week`)
4. For each candidate: fetch, extract title/date/content, filter (< 7 days, not in blocklist,
   on-topic per Guard)
5. For each kept item, create `vault/radar-items/<slug>.md` with frontmatter (source, url,
   title, tldr, tags, published_at, relevance) and optional body
6. Update `vault/radar-items/_INDEX.md` — running index of items with counts per tag
7. Iterate: if new sources surface from referenced items (e.g., a blog post mentioning
   another tool), chase those too within time budget
```

## 9. API Contracts (sketch)

- `POST /api/chat` — AI SDK `streamText`, body: `{ mode, sessionId, messages[], userLevel }`
- `POST /api/english/placement` — body: `{ action: "start"|"answer", payload }` → returns next question or final level
- `POST /api/skills/generate-lesson` — body: `{ nodeId, topic, depth, includeQuiz }` → streams markdown
- `POST /api/radar/sync` — called by `scripts/sync-radar.ts`, accepts array of parsed frontmatter+body items, upserts into Supabase (service-role key)

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Placement test quality | Adaptive generation via Haiku + fallback to static CEFR question bank if AI flakes |
| React Flow learning curve for roadmap UI | Start with simple vertical list view as Phase 0; add tree view in Phase 1 |
| AI-generated lessons cost bloat | Cache every generated lesson permanently in `skill_lessons` — never re-generate unless user clicks "regenerate" |
| Local autoresearch requires Claude Code installed | Acceptable for single-user; document setup in README |
| Budget $10–50 accidentally blown | AI Gateway observability + hard-stop env var `MAX_DAILY_USD` checked before each call server-side |
| Supabase RLS bugs leaking data | Policy tests on every table; local pg_tap suite before deploy |

## 11. Rollout Plan (Phases)

### Phase 0 — Foundations (week 1)
- Project scaffold (`pnpm create next-app`, install Supabase + AI SDK + shadcn)
- `vercel.ts` config, env wiring
- Supabase schema migrations + RLS policies
- Auth flow (magic link)

### Phase 1 — English Tutor (week 2)
- 6 mode prompts, chat API, streaming UI
- Placement test flow
- Session/message/mistake persistence

### Phase 2 — Прокачка навыков (week 3)
- Skill CRUD, roadmap tree UI (React Flow)
- Lesson markdown rendering
- "Generate with AI" lesson flow
- Progress tracking

### Phase 3 — Radar (week 4)
- `autoresearch/prompts/weekly-radar.md` authored and tested
- `scripts/sync-radar.ts` syncs vault → Supabase
- Feed UI with tag filters

### Phase 4 — Journal (week 5)
- Markdown editor (Novel or @mdxeditor/editor)
- Templates
- Backlinks to skills/lessons
- Search

### Phase 5 — Polish (week 6)
- Mobile responsive pass
- Dark mode
- Empty-state illustrations
- `README.md` with setup for autoresearch radar

## 12. Open Questions

- **Roadmap visualization library**: React Flow vs own SVG-positioned tree. Default: React Flow for speed.
- **Markdown editor**: Novel (Notion-like) vs @mdxeditor/editor (power user). Default: Novel.
- **AI Gateway models**: default tutor = `anthropic/claude-sonnet-4-6`, lightweight tasks (placement, mistake extraction, lesson tagging) = `anthropic/claude-haiku-4-5`. Revisit after first week of usage metrics.
- **Radar local vs auto**: start local-user-driven; evaluate headless Cron in v2 only if pain appears.

## 13. Next Step

User reviews this spec. On approval, invoke the `superpowers:writing-plans` skill to produce a step-by-step implementation plan for Phase 0 + Phase 1.
