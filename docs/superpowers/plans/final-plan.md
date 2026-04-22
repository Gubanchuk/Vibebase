# Personal Skills Platform — Final Implementation Plan

**Date:** 2026-04-21
**Status:** Definitive. This is the plan to execute.
**Owner:** An.guban79@gmail.com (solo, part-time)
**Source of truth:** merges spec + tournament consensus (jury-1/jury-2 archived).

---

## 🎨 Visual design — LOCKED

**Canonical mockup:** `docs/superpowers/design/v4-hybrid.html`

This is the single source of truth for visual language. Every component built in Phase 0–5 must read tokens from `globals.css` matching the v4 spec and follow its compositional patterns (sidebar shell, card density, chat surface, roadmap tree, journal editor).

### Design tokens to bake into `globals.css` (Phase 0)

```css
:root {
  /* Base — dense dark foundation */
  --bg: 0 0% 4%;              /* #0a0a0a */
  --bg-tinted: 270 10% 5%;    /* subtle purple tint for mesh gradient */
  --surface: 0 0% 7%;         /* #111111 */
  --surface-2: 0 0% 9%;       /* #161616 */
  --surface-3: 0 0% 10%;      /* #1a1a1a */
  --border: 0 0% 15%;         /* #262626 */
  --border-2: 0 0% 12%;       /* #1f1f1f */
  --border-hover: 0 0% 20%;   /* #333333 */
  --content: 0 0% 93%;        /* #ededed */
  --muted: 240 5% 65%;        /* #a1a1aa */
  --subtle: 240 4% 46%;       /* #71717a */

  /* Accent language — coral → amber gradient primary, violet secondary */
  --coral: 5 93% 68%;         /* #f97066 */
  --coral-soft: 5 93% 68% / 0.14;
  --amber: 43 96% 56%;        /* #fbbf24 */
  --violet: 271 91% 65%;      /* #a855f7 */
  --violet-soft: 271 91% 65% / 0.14;
  --success: 142 76% 64%;     /* #4ade80 */
  --danger: 0 84% 60%;        /* #ef4444 */
}

/* Primary gradient used on CTAs, streaming dot, progress bars, logo */
--gradient-hot: linear-gradient(135deg, hsl(var(--coral)) 0%, hsl(var(--amber)) 100%);
--gradient-cool: linear-gradient(135deg, hsl(var(--violet)) 0%, hsl(322 81% 60%) 100%);
```

### Typography stack

- **Body:** `Inter` weights 400/500/600/700/800, `letter-spacing: -0.005em`
- **Mono:** `JetBrains Mono` — for all metadata, timestamps, URLs, `// section-headers`, kbd chips
- **Italic accent:** `Instrument Serif` (italic 400) — used sparingly on key words in headings only (e.g., «*Андрей*», «*growth* стек», «*мысли* прирастают»). Never in body copy. Never more than one per heading.

### Component patterns (all documented in v4-hybrid.html)

- **Sidebar:** 240px, `bg: hsl(var(--surface))`, dense 13px nav items with 3px coral gradient left-bar on `.active`
- **Cards:** `bg: hsl(var(--surface))`, `border: 1px solid hsl(var(--border-2))`, `rounded-lg` (8px)
- **Chips:** compact 11px pill, border-based, semantic variants: `chip`, `chip-coral`, `chip-violet`, `chip-amber`, `chip-success`
- **Primary button:** coral→amber gradient background, `shadow: 0 2px 12px -4px rgba(249,112,102,.5)`, scale up on hover
- **Active node (roadmap):** `card-glow` (shadow `0 0 32px -16px rgba(249,112,102,.45)`) + `glow-ring::before` with masked gradient border
- **Streaming indicator:** `stream-dot` with coral box-shadow glow, 1.4s pulse
- **Chat:** user bubble = gradient-hot bg, white text; assistant = `surface-2` with border
- **Mistake pills:** coral-tinted background rounded-md, wavy-underline original, green-highlight correction
- **Background:** body-level radial mesh (coral at 18% 5%, violet at 85% 95%, opacity 0.06 and 0.05 respectively)
- **Tree lines:** 1px border for vertical, 12px horizontal connectors (`::before` pseudo on `.tree-child`)

### Non-negotiables

- Dark theme only in MVP. Light theme deferred (but token system must support `[data-theme="light"]` override for Phase 5).
- Coral gradient stays reserved for `active` / `streaming` / `primary action` states — do not sprinkle elsewhere.
- Mono is functional (data), Italic serif is expressive (one key word). Do not blur the roles.

---

## Executive summary

- **What:** a single-user Next.js 16 + Supabase web app bundling an AI English tutor (6 modes), Skill Growth (collapsible roadmap + AI-generated lessons), Vibecoding Radar (local autoresearch → Supabase), and a markdown Journal.
- **MVP scope:** all four subsystems at functional-complete level, desktop + mobile web, single-user in practice, invite-gate stub in place for v2.
- **Out of MVP:** TTS/STT, headless radar cron, multi-user quotas/billing, E2E journal crypto, React Flow roadmap, YouTube ingestion.
- **Architecture highlights:** one `AiKernel` seam for every AI call (budget + injection + usage log + `onFinish`); `lib/domains/{english,skills,radar,journal}` ownership; Zod `RadarItemSchema` as shared contract; pg_tap RLS + bundle-secret-grep in CI.
- **Total estimate:** 4–6 weeks part-time ≈ **18–21 effective working days** (20–25 calendar days depending on pace). Phase 0–1 is the riskiest third; Phases 2–5 are mostly predictable grind.

---

## The 8 pillars

1. **One `AiKernel` or nothing.** Every AI call in the codebase flows through `lib/core/ai-kernel.ts`. Only this file imports `streamText`/`generateText` from the `ai` SDK; an ESLint `no-restricted-imports` rule enforces it. The kernel owns the budget guard (4 layers), prompt-injection delimiters, token accounting via `onFinish`, and the `ai_usage_log` insert. Swapping the Gateway provider, tuning cost caps, or adding Sentry integration is a single-file change.

2. **Cost is a product feature, not an afterthought.** `BudgetGuard` enforces four layers on every call: pre-call hard gate (SUM cost today/month), soft-warning header at 80%, per-stream `maxOutputTokens` from `budget_config`, and a 90-second wall-clock `AbortController` watchdog. `/settings/usage` ships in Phase 0 — before any UI. If you can't see the burn, you can't stop it.

3. **Domain ownership, flat inside.** `lib/domains/{english,skills,radar,journal}` each own `types.ts`, `repository.ts`, `prompts.ts|schema.ts`. `lib/infra/` holds Supabase clients and generated DB types. `lib/core/` holds `AiKernel`, `BudgetGuard`, `requireAuth`, `pricing`, v2 stubs. Constructor injection by hand — no DI container. Domains never import from `infra/` directly; they consume typed interfaces.

4. **Zod at every trust boundary.** `RadarItemSchema` is the single shared contract between sync script, API, and feed. Every route handler parses its body through a Zod schema before auth. `lib/env.ts` Zod-validates `process.env` at boot and fails loudly on missing keys. Malformed data never reaches the database.

5. **Riskiest integration on Day 1.** Before UI, before auth guards, before prompt files: `curl` a streaming Sonnet turn through Vercel AI Gateway. If that doesn't work, nothing else matters. This was the single most-endorsed idea across all four plans.

6. **90-second first win is the UX north star.** Magic-link → `/onboarding` → placement test → auto-seeded "Learning English" skill → streaming Mode-2 Personal Lesson greeting. No empty dashboard, no six-card grid staring back. The user gets a real AI output before making any decision beyond their placed level.

7. **Design tokens from Day 0, `next-themes` installed in Phase 0.** Three-tier HSL CSS variables (`--surface-*`, `--content-*`, `--accent`) in `globals.css`; dark mode is a `[data-theme="dark"]` override. Every component reads tokens via `hsl(var(--...))`. This prevents "Phase 5 dark mode has hardcoded `text-gray-600` everywhere."

8. **Security is schema + CI, not vibes.** pg_tap tests every owner-RLS policy via `supabase test db`; bundle-secret-grep CI step fails the build if `eyJ…`/`sk-…`/`sbp_…` appears in client chunks; `CRON_SECRET` bearer on every server-to-server endpoint; service-role key lives only in the sync script, never in a route. The public `/api/radar/sync` route is deleted — it's a script-only path.

---

## Phased plan

### Phase 0 — Foundations, Guards First (Days 1–4)

**Invariant:** no AI call can be made until `BudgetGuard` + `AiKernel` + `ai_usage_log` exist.

#### Files to create (Phase 0)

| Path | Purpose |
|---|---|
| `package.json` | Next.js 16 app, deps per tech table below |
| `tsconfig.json` | Strict TS, `@/*` alias to root |
| `next.config.ts` | Minimal; experimental cacheComponents enabled |
| `vercel.ts` | Typed Vercel config; cron stubs |
| `tailwind.config.ts` | `theme.extend.colors` reads CSS vars via `hsl(var(--...))` |
| `postcss.config.mjs` | Standard tailwind |
| `.env.example` | Every required env key with placeholder |
| `.gitignore` | `.env.local`, `vault/`, `visual/`, `.next` |
| `middleware.ts` | Supabase session refresh, matches `/(app)/**` |
| `app/layout.tsx` | Root layout, `<html lang="en" data-theme="">`, Sonner, skip-link, token stylesheet |
| `app/globals.css` | Three-tier token system (light + dark), reduced-motion media query, focus-ring base |
| `app/(auth)/sign-in/page.tsx` | Magic-link form, morphing button |
| `app/(auth)/auth/callback/route.ts` | Supabase code exchange, redirect to `/onboarding` if no profile, else `/english` |
| `app/(app)/layout.tsx` | Server auth guard; renders sidebar (desktop) + bottom tabs (mobile) + top bar with `⌘K` |
| `app/(app)/page.tsx` | Server redirect to last-used English mode or `/english` |
| `app/(app)/settings/usage/page.tsx` | Cost dashboard: today, MTD, domain breakdown, last 50 calls, editable caps |
| `app/api/settings/budget/route.ts` | PATCH `budget_config` |
| `components/ui/*` | shadcn primitives (see tech table) |
| `components/shell/Sidebar.tsx` | Desktop sidebar with `aria-current` |
| `components/shell/BottomTabs.tsx` | Mobile bottom tab bar, safe-area padded |
| `components/shell/TopBar.tsx` | Page title + `⌘K` button |
| `components/shell/CommandPalette.tsx` | shadcn `<CommandDialog>`; actions registered per-domain |
| `components/shell/ThemeToggle.tsx` | `next-themes` toggle in account popover |
| `lib/env.ts` | Zod schema over `process.env`; throws on boot if missing |
| `lib/infra/supabase/server.ts` | `createServerClient` from `@supabase/ssr` |
| `lib/infra/supabase/client.ts` | `createBrowserClient` singleton |
| `lib/infra/supabase/admin.ts` | Service-role client; only imported by `scripts/*` |
| `lib/infra/db-types.ts` | Generated via `supabase gen types typescript` |
| `lib/core/types.ts` | `UserId`, `ModelId`, `Domain` enum, `AuthContext` |
| `lib/core/auth.ts` | `requireAuth(req)` → `AuthContext`; v2 invite-gate seam lives here |
| `lib/core/pricing.ts` | `costFor(model, tokensIn, tokensOut): number`; pinned table for 3 Gateway models |
| `lib/core/budget-guard.ts` | Pre-call SUM check, soft-warning header, `maxOutputTokens` resolver, `AbortController` factory with 90s timeout |
| `lib/core/ai-kernel.ts` | `AiKernel` interface + `VercelGatewayKernel` impl; injection delimiters; `onFinish` writes `ai_usage_log` |
| `lib/core/quota.ts` | `QuotaService` interface + `noopQuota` MVP stub |
| `lib/core/speech.ts` | `SpeechProvider` interface + `noSpeech` stub (always rejects) |
| `lib/core/usage-repo.ts` | `insertUsageRow`, `sumCostToday`, `sumCostMonth`, `listRecent` |
| `supabase/migrations/0001_init.sql` | All tables per spec §6 + `ai_usage_log` + `budget_config` + `radar_sync_runs` |
| `supabase/migrations/0002_rls.sql` | Owner-RLS policies on every table |
| `supabase/tests/rls/*.test.sql` | pg_tap test per owner-keyed table |
| `scripts/gen-types.ts` | `supabase gen types typescript --local > lib/infra/db-types.ts` |
| `scripts/smoke-stream.ts` | **Day 1 smoke** — `curl`/fetch one streaming Sonnet turn through Gateway, prints tokens |
| `.github/workflows/ci.yml` | tsc → Vitest → supabase test db → build → bundle-secret-grep → Playwright smoke |
| `vitest.config.ts` | Node env, `test.include: ['lib/**/*.test.ts']` |
| `playwright.config.ts` | Chrome + mobile Safari viewport |

#### Phase 0 checklist

- [ ] `pnpm create next-app@16.2.4 superpowers --typescript --app --tailwind --no-src-dir --import-alias "@/*"`
- [ ] Install all deps from tech table.
- [ ] Write `.env.example`; wire Vercel + Supabase envs.
- [ ] Write `lib/env.ts` Zod validation; boot fails on missing.
- [ ] Write `scripts/smoke-stream.ts`; **run it, see tokens, do not proceed until green.**
- [ ] Write `0001_init.sql` + `0002_rls.sql`; run `supabase db push`.
- [ ] Author pg_tap tests for every owner-keyed table; `supabase test db` green.
- [ ] Implement `AiKernel` + `BudgetGuard` + `pricing.ts` with unit tests.
- [ ] Implement `requireAuth`, `quota`, `speech` stubs.
- [ ] Build app shell: sidebar + bottom tabs + top bar + `⌘K` palette.
- [ ] Build `/settings/usage` page with live data (initially empty).
- [ ] CI: tsc + Vitest + pg_tap + build + bundle-secret-grep pass on empty repo.
- [ ] Deploy to Vercel preview; magic-link sign-in reaches placeholder `/onboarding`.

---

### Phase 1 — English domain + onboarding (Days 5–9)

**Goal:** 90-second first-win onboarding, 6-mode chat surface with caret-pulse streaming and mobile keyboard handling.

#### Files to create (Phase 1)

| Path | Purpose |
|---|---|
| `lib/domains/english/types.ts` | `EnglishMode`, `CEFRLevel`, `EnglishSession`, `Message`, `Mistake`, `PlacementResult` |
| `lib/domains/english/prompts/native.ts` | Mode-1 system prompt builder |
| `lib/domains/english/prompts/lesson.ts` | Mode-2 (hero card) system prompt builder |
| `lib/domains/english/prompts/translate.ts` | Mode-3 system prompt + `<user_input>` wrapping rule |
| `lib/domains/english/prompts/flashcards.ts` | Mode-4 prompt + 20-word input wrap |
| `lib/domains/english/prompts/grammar.ts` | Mode-5 prompt |
| `lib/domains/english/prompts/quiz.ts` | Mode-6 prompt |
| `lib/domains/english/prompts/placement.ts` | Adaptive placement prompt + Zod schema for AI JSON response |
| `lib/domains/english/prompts/index.ts` | `buildSystemPrompt(mode, level)` pure dispatcher |
| `lib/domains/english/placement-fallback.ts` | 15 hardcoded CEFR questions (static JSON) |
| `lib/domains/english/repository.ts` | `createSession`, `appendMessage`, `recordMistake`, `getMistakeSummary`, `savePlacementResult` |
| `lib/domains/english/mistake-extractor.ts` | Flagged-off Haiku second-pass; reads `ENABLE_MISTAKE_TRACKING` |
| `lib/domains/english/__tests__/prompts.test.ts` | Snapshot + length caps |
| `lib/domains/english/__tests__/placement.test.ts` | Scoring logic |
| `app/(app)/onboarding/page.tsx` | 3-step flow: intro → placement → result + CTA "Begin your first lesson" |
| `app/(app)/onboarding/actions.ts` | Server Actions: `startPlacement`, `submitAnswer`, `finishPlacement` (seeds `Learning English` skill + first node) |
| `app/(app)/english/page.tsx` | 6-mode grid, hero card layout, last-session meta per mode |
| `app/(app)/english/[mode]/page.tsx` | Server: creates/fetches session, renders `<ChatSurface>` |
| `app/(app)/english/placement/page.tsx` | Full placement flow (animated question cards, progress bar) |
| `app/api/english/chat/route.ts` | POST: Zod-parse body → auth → `kernel.stream()` → `toDataStreamResponse` |
| `app/api/english/placement/route.ts` | POST: state machine (`start` / `answer` / `finish`) |
| `app/api/english/mistakes/route.ts` | GET: aggregated mistake summary |
| `components/english/ModeCard.tsx` | Card variants: hero (Mode 2) / standard (1,3,5) / practice (4,6) |
| `components/english/ChatSurface.tsx` | `useChat`, optimistic bubble, caret pulse, jump-to-latest pill, stop button |
| `components/english/ChatHeader.tsx` | Mode switcher popover, level badge, "New session" button |
| `components/english/PlacementFlow.tsx` | RadioGroup with 56px tap targets, keyboard 1–4 / Enter |
| `components/english/MistakeSummary.tsx` | List view (renders empty while flag off) |

#### Key implementation — `AiKernel.stream` with the full contract

```ts
// lib/core/ai-kernel.ts (sketch)
export interface StreamParams {
  userId: UserId
  domain: Domain            // 'english.lesson' | 'skills.generate-lesson' | ...
  model: ModelId            // 'anthropic/claude-sonnet-4-6' | ...
  system: string            // system prompt from domain
  messages: UIMessage[]     // user turns; mode-3/4 user text already wrapped in <user_input>…</user_input>
  maxOutputTokensOverride?: number
  onFinishHook?: (ctx: OnFinishCtx) => Promise<void>  // domain-specific persistence
}

export class VercelGatewayKernel implements AiKernel {
  constructor(
    private gateway: GatewayProvider,
    private budget: BudgetGuard,
    private usage: UsageRepo,
    private scrubber: OutputScrubber,
  ) {}

  async stream(p: StreamParams) {
    await this.budget.preCallGate(p.userId)                    // layer 1 — hard gate
    const budgetCfg = await this.budget.config(p.userId)
    const maxTokens = Math.min(
      p.maxOutputTokensOverride ?? budgetCfg.per_call_max_tokens_out,
      budgetCfg.per_call_max_tokens_out,
    )
    const abort = this.budget.watchdog(90_000)                 // layer 4 — 90s abort

    const result = streamText({
      model: this.gateway(p.model),
      system: p.system,
      messages: p.messages,
      maxOutputTokens: maxTokens,                              // layer 3
      abortSignal: abort.signal,
      onFinish: async ({ text, usage, finishReason }) => {
        const safeText = this.scrubber.scrub(text)             // prompt-injection output scrub
        const cost = costFor(p.model, usage.promptTokens, usage.completionTokens)
        await this.usage.insertUsageRow({
          user_id: p.userId, domain: p.domain, model: p.model,
          tokens_in: usage.promptTokens, tokens_out: usage.completionTokens,
          cost_usd: cost, latency_ms: Date.now() - started,
          status: finishReason === 'stop' ? 'ok' : 'aborted',
          finish_reason: finishReason,
        })
        await p.onFinishHook?.({ text: safeText, usage, cost })
      },
    })

    // layer 2 — soft warning header set on response in route handler via result.response.headers
    return { result, softWarning: await this.budget.softWarning(p.userId) }
  }
}
```

Inside `app/api/english/chat/route.ts`, `onFinishHook` persists the assistant message into `english_messages`, touches `english_sessions.last_activity_at`, and — if `ENABLE_MISTAKE_TRACKING === 'true'` — calls `mistakeExtractor.extract()` against the last user+assistant pair using Haiku via the same kernel.

#### Phase 1 checklist

- [ ] Author all 6 mode prompts + placement prompt (one file each).
- [ ] Write `mistake-extractor.ts` with env-flag gate; interface ready, default off.
- [ ] Implement `/api/english/chat/route.ts` with full `onFinish` persistence.
- [ ] Implement `/api/english/placement/route.ts` state machine + static fallback branch.
- [ ] Build `<ChatSurface>`: optimistic bubble, caret pulse, AbortController stop, `100dvh` + safe-area, intent-detection auto-scroll.
- [ ] Build mode grid with hero-card hierarchy (Mode 2 2-col span, "Recommended" badge).
- [ ] Build `/onboarding` 3-step flow; last step seeds `Learning English` skill via Server Action.
- [ ] Wire `/auth/callback` to route first-time users to `/onboarding`.
- [ ] Register `⌘K` commands: "New session", "Switch mode", "Go to Skills/Radar/Journal", "Toggle theme".
- [ ] Vitest: `prompts.test.ts`, `placement.test.ts`, `pricing.test.ts`.
- [ ] Manual verify: magic-link → placement → streaming Mode-2 greeting inside 90 seconds on mobile Safari.
- [ ] Playwright smoke: sign in → complete placement → send one chat message → receive streamed reply.

---

### Phase 2 — Skills domain (Days 10–13)

**Goal:** skill CRUD (Server Actions), collapsible-list roadmap with `<Sheet>` node detail on all viewports, streaming AI lesson generation with permanent cache.

#### Deliverables checklist

- [ ] `lib/domains/skills/types.ts` with `nodeProgress`, `skillProgress` pure helpers + exhaustive tests.
- [ ] `lib/domains/skills/repository.ts`: `getSkillWithNodes`, `upsertNode`, `archiveSkill`, `upsertLessonProgress`.
- [ ] `lib/domains/skills/lesson-generator.ts`: cache-check first (`generated_by_ai && content_md IS NOT NULL`), only then call `AiKernel.stream`; `onFinish` writes `skill_lessons` row with `generated_by_ai=true`.
- [ ] `app/(app)/skills/page.tsx` — grid with progress-ring `SkillCard` + empty state.
- [ ] `app/(app)/skills/[slug]/page.tsx` — single-pane tree + `<Sheet>` detail (both viewports).
- [ ] `app/(app)/skills/[slug]/lessons/[lessonId]/page.tsx` — `react-markdown` + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`, sticky "Mark complete" button.
- [ ] `app/api/skills/[skillId]/lessons/generate/route.ts` — streams markdown; `onFinish` saves to `skill_lessons`.
- [ ] Server Actions for skill/node CRUD (not API routes — CRUD is cheaper via actions).
- [ ] `<LessonGenerateDialog>` that streams preview in-place (no close-reopen), header: Regenerate / Edit / Save.
- [ ] "Regenerate" confirms approx cost and archives old row to `archived_at`.
- [ ] Progress computed at query time via single SQL aggregation; no triggers.
- [ ] Add `⌘K` actions for skill + lesson navigation.
- [ ] Vitest: `lesson-generator.test.ts` (cache-hit path never calls kernel), `progress.test.ts`.
- [ ] Playwright smoke: open seeded skill, generate a lesson, mark one complete.

---

### Phase 3 — Radar domain (Days 14–16)

**Goal:** local autoresearch → vault → `pnpm sync:radar` (service-role direct write) → feed with tag filters.

#### Deliverables checklist

- [ ] `lib/domains/radar/schema.ts` — `RadarItemSchema` (Zod) — the shared contract; Vitest against 5 malformed fixtures.
- [ ] `lib/domains/radar/repository.ts` — paginated `listItems(filters)`; upsert helpers.
- [ ] `lib/domains/radar/sync.ts` — `SyncService.upsertBatch(items)`: one transaction; per-item try-parse; writes `radar_sync_runs` row.
- [ ] `autoresearch/prompts/weekly-radar.md` — full Goal/Metric/Verify/Guard/Protocol per spec §8.
- [ ] `autoresearch/vault/radar-items/_INDEX.md` + `.gitkeep`.
- [ ] `scripts/sync-radar.ts` — reads vault; `gray-matter` parse; `RadarItemSchema.parse()`; direct Supabase service-role upsert (no HTTP route); nonzero exit on failures.
- [ ] `app/(app)/radar/page.tsx` — server component loads items; URL-synced filters (`?tags=…&src=…`).
- [ ] `<RadarFeed>` — tag chips, source static-icon map, relevance pips, animated filter transitions with `AnimatePresence`.
- [ ] Empty state with copy-able CLI block when vault is empty.
- [ ] No public `/api/radar/sync` route — **explicitly absent**. If a hosted cron arrives later, add it then with `CRON_SECRET` bearer.
- [ ] Playwright smoke: feed renders seeded items; filter chips update URL and list.

---

### Phase 4 — Journal + placeholder privacy page (Days 17–18)

**Goal:** textarea editor with live preview toggle, templates, backlinks, search — polished.

#### Deliverables checklist

- [ ] `lib/domains/journal/types.ts`, `repository.ts` (`search` via `ilike`, backlinks), `templates.ts` (4 string constants).
- [ ] `lib/domains/journal/crypto.ts` — `JournalCrypto` interface + `identityCrypto` stub; repository accepts via constructor.
- [ ] `app/(app)/journal/page.tsx` — grouped list (Today / Yesterday / This week / MMM YYYY), debounced search.
- [ ] `app/(app)/journal/new/page.tsx` — redirects to `/journal/[newId]?edit=1`.
- [ ] `app/(app)/journal/[id]/page.tsx` — read view + `?edit=1` toggle.
- [ ] `<JournalEditor>` — textarea auto-grow, debounced auto-save (2s), "Preview ▾" split, template picker, skill/lesson backlink dropdowns.
- [ ] Route handlers never log entry content; Sentry `beforeSend` scrubs.
- [ ] `app/privacy/page.tsx` — one-paragraph placeholder (full copy v1.1).
- [ ] Add `⌘K` commands: "New journal entry", "Today's reflection".
- [ ] Vitest: `templates.test.ts`, repository search-query construction.
- [ ] Playwright smoke: create entry from Daily Reflection template → autosave confirm → edit and re-save.

---

### Phase 5 — Polish, a11y sweep, deploy safety (Days 19–21)

- [ ] Mobile responsive audit across all 4 domains on real devices.
- [ ] Dark-mode walkthrough every page; fix any missed token.
- [ ] a11y: keyboard-only Playwright run per domain; `axe` per page; verified focus trap in all dialogs.
- [ ] Empty states inventoried per jury (English onboarded guarantee; Skills seeded prompt; Radar CLI card; Journal pre-filled CTA).
- [ ] Error states inventoried (stream fail / budget exceeded / gen fail / save fail — each with specific UI).
- [ ] Enable `ENABLE_MISTAKE_TRACKING=true` **only if** Phase 1 usage shows stable single-call cost < $0.01/turn.
- [ ] README with autoresearch setup instructions.
- [ ] `docs/runbooks/migrations.md`, `docs/runbooks/secrets-rotation.md`, `docs/runbooks/user-deletion.md` (short, skeletal).
- [ ] Nightly `pg_dump` GitHub Action (30-day artifact retention).
- [ ] Promote to prod Supabase; Vercel production deploy.

---

## 📡 Radar autoresearch runbook — ready-to-execute

This section contains everything needed to stand up the vibecoding radar pipeline without additional design work. The pipeline reuses the Karpathy autoresearch pattern from `E:/project/My work/autoresearch-genealogy-main` (which the user already owns and is comfortable with).

### Pipeline at a glance

```
┌─────────────────────────────────────────────────────────────────────┐
│  User runs weekly:                                                  │
│                                                                     │
│  $ cd E:/project/My work                                            │
│  $ claude "/autoresearch autoresearch/prompts/weekly-radar.md"      │
│                                                                     │
│  Claude Code agent autonomously:                                    │
│   • Reads existing vault/radar-items/*.md → URL blocklist           │
│   • Searches official blogs, Reddit, Twitter                        │
│   • Filters (<7 days, on-topic, not duplicate)                      │
│   • Writes one .md per item into vault/radar-items/                 │
│   • Updates vault/radar-items/_INDEX.md                             │
│                                                                     │
│  $ pnpm sync:radar                                                  │
│                                                                     │
│  scripts/sync-radar.ts:                                             │
│   • Reads all vault/radar-items/*.md                                │
│   • gray-matter parse → RadarItemSchema.parse()                     │
│   • Supabase service-role upsert → radar_items + radar_tags         │
│   • Writes radar_sync_runs row with success/failure summary         │
│                                                                     │
│  User opens /radar in the app → feed rendered from Supabase         │
└─────────────────────────────────────────────────────────────────────┘
```

### File: `autoresearch/prompts/weekly-radar.md` (full body — paste as-is)

```markdown
# Weekly Vibecoding Radar

## Autoresearch Configuration

**Goal**: Collect fresh (past 7 days) material about Claude Code, AI coding agents,
prompting techniques, MCP servers, and vibecoding tooling from official blogs,
Reddit, and curated Twitter accounts. Write each as a markdown card into
`autoresearch/vault/radar-items/` with YAML frontmatter conforming to the
RadarItemSchema. Update `_INDEX.md` after every iteration.

**Metric**: Number of new, deduplicated radar items added with `relevance: strong`
or `moderate`, published in the past 7 days.

**Direction**: Maximize (target 10–30 items per run, 3–8 marked `strong`).

**Verify**: For each new item, confirm: URL is reachable (HEAD 200), `published_at`
is within the past 7 days, content is genuinely about the topic (not a generic
mention), no existing file in `vault/radar-items/` has the same URL.

**Guard**:
- Do not include items older than 7 days
- Do not include duplicates — check URL against existing files BEFORE creating
- Do not invent content — every `tldr` must be grounded in the actual source
- Mark uncertain relevance as `moderate`; reserve `strong` for concrete
  product/tool/pattern releases or heavily-upvoted community patterns
- Do not emit frontmatter that fails the RadarItemSchema contract (defined below)
- Maximum 40 items per run; prefer quality over quantity

**Iterations**: 3

**Protocol**:

1. **Baseline**: Read every file under `vault/radar-items/`. Build a set of
   existing URLs. Record baseline counts in `_INDEX.md`.

2. **Search pass — Official sources** (highest trust):
   - Anthropic News: https://www.anthropic.com/news
   - Anthropic Engineering blog: https://www.anthropic.com/engineering
   - Claude Code changelog: https://docs.claude.com/en/docs/claude-code/changelog
   - OpenAI blog: https://openai.com/blog
   - Vercel changelog: https://vercel.com/changelog
   - Modelcontextprotocol.io blog (MCP)

3. **Search pass — Reddit** (via public JSON, last 7 days top):
   - `https://www.reddit.com/r/ClaudeAI/top.json?t=week`
   - `https://www.reddit.com/r/LocalLLaMA/top.json?t=week`
   - `https://www.reddit.com/r/ChatGPTPromptGenius/top.json?t=week`
   - Include only posts with score ≥ 50 and on-topic per Guard

4. **Search pass — Twitter/X** (curated list, via nitter/RSS bridges or direct):
   - @simonw, @swyx, @AnthropicAI, @karpathy
   - Include only tweets with ≥ 200 likes and links to substantial content

5. **Candidate evaluation** — for each discovered item:
   - Fetch the page and extract title + publish date + 2–3 representative sentences
   - Reject if: older than 7 days, duplicate URL, not about our topics, paywalled
     without a clear free excerpt
   - Score relevance:
     - `strong` — concrete product/feature release, novel technique with
       working code, consensus community pattern (upvotes > 200 / likes > 500)
     - `moderate` — useful discussion, partial insight, context-dependent
     - `weak` — tangential; skip entirely

6. **Write card** — for each kept item create
   `vault/radar-items/<yyyy-mm-dd>-<slug>.md`:

   ```markdown
   ---
   type: radar-item
   source: anthropic-blog
   url: https://www.anthropic.com/news/<slug>
   title: "Claude Code 2.7 — subagents as first-class primitives"
   tldr: |
     Anthropic released native subagent support in .claude/agents/ with
     frontmatter config, per-subagent tool allowlists, and auto-suggestion
     based on task description. Significant step toward composable agent
     pipelines.
   tags: [claude-code, agents, subagents]
   published_at: 2026-04-19
   relevance: strong
   related_skill: vibecoding
   ---
   # Optional deep-dive body (markdown)

   Full notes, code excerpts, interesting quotes. Leave empty for ultra-short
   signal items.
   ```

7. **Update `_INDEX.md`** — table of all items grouped by week:

   ```markdown
   # Radar index — last updated 2026-04-21

   ## Counts
   - Total: 47 items
   - This week: 14 new (3 strong, 9 moderate, 2 retro)
   - Tags: claude-code (18), agents (12), mcp (8), prompts (6), tooling (3)

   ## Week of 2026-04-15
   - [2026-04-19] [strong][anthropic-blog] Claude Code 2.7 — subagents as first-class primitives
   - [2026-04-18] [strong][r/ClaudeAI] "Skill files" — turning a prompt into a multi-step agent
   - ... (one line per item)
   ```

8. **Repeat up to 3 iterations**: if a referenced item leads to another
   on-topic source (e.g., a blog post citing a GitHub repo), chase it within
   the budget.

## Tips

- **Log negative results**: if you searched a source and found nothing fresh,
  note it in `_INDEX.md` under a "Searched, found nothing" section.
- **Prefer canonical URLs**: if a tweet links a blog post, cite the blog post
  directly (higher signal, longer-lived).
- **Deduplicate aggressively by URL**: the sync script will also dedup, but
  keeping the vault clean makes diffs easier.
```

### File: `scripts/sync-radar.ts` (skeleton — ~120 lines)

```typescript
#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import matter from 'gray-matter'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { RadarItemSchema, type RadarItem } from '../lib/domains/radar/schema'

const VAULT_DIR = join(process.cwd(), 'autoresearch/vault/radar-items')

function loadEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  return { url, key }
}

type ParseResult =
  | { ok: true; file: string; item: RadarItem; body: string }
  | { ok: false; file: string; error: string }

function parseVault(): ParseResult[] {
  const files = readdirSync(VAULT_DIR)
    .filter((f) => f.endsWith('.md') && f !== '_INDEX.md')
    .sort()

  return files.map((file): ParseResult => {
    const fullPath = join(VAULT_DIR, file)
    try {
      const raw = readFileSync(fullPath, 'utf8')
      const { data, content } = matter(raw)
      const item = RadarItemSchema.parse(data)
      return { ok: true, file, item, body: content.trim() }
    } catch (err) {
      return {
        ok: false,
        file,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  })
}

async function upsertItems(
  supabase: ReturnType<typeof createClient>,
  parsed: Extract<ParseResult, { ok: true }>[]
) {
  let itemsUpserted = 0
  let tagLinksUpserted = 0

  for (const { item, body } of parsed) {
    const { data: row, error } = await supabase
      .from('radar_items')
      .upsert(
        {
          url: item.url,
          source: item.source,
          title: item.title,
          tldr: item.tldr,
          body_md: body || null,
          published_at: item.published_at,
          relevance: item.relevance,
        },
        { onConflict: 'url' }
      )
      .select('id')
      .single()

    if (error || !row) {
      console.error(`  ✗ upsert failed for ${item.url}:`, error?.message)
      continue
    }
    itemsUpserted++

    for (const slug of item.tags) {
      const { data: tag } = await supabase
        .from('radar_tags')
        .upsert({ slug, name: slug }, { onConflict: 'slug' })
        .select('id')
        .single()
      if (!tag) continue
      const { error: linkErr } = await supabase
        .from('radar_item_tags')
        .upsert(
          { item_id: row.id, tag_id: tag.id },
          { onConflict: 'item_id,tag_id' }
        )
      if (!linkErr) tagLinksUpserted++
    }
  }

  return { itemsUpserted, tagLinksUpserted }
}

async function main() {
  const { url, key } = loadEnv()
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  console.log(`→ Reading vault at ${VAULT_DIR}`)
  const parsed = parseVault()
  const ok = parsed.filter((p): p is Extract<ParseResult, { ok: true }> => p.ok)
  const failed = parsed.filter((p): p is Extract<ParseResult, { ok: false }> => !p.ok)

  console.log(`  parsed ${ok.length} items, ${failed.length} failed`)
  for (const f of failed) console.error(`  ✗ ${f.file}: ${f.error}`)

  console.log(`→ Upserting to Supabase...`)
  const { itemsUpserted, tagLinksUpserted } = await upsertItems(supabase, ok)

  const status = failed.length === 0 ? 'success' : 'partial'
  await supabase.from('radar_sync_runs').insert({
    items_total: parsed.length,
    items_upserted: itemsUpserted,
    items_failed: failed.length,
    tag_links: tagLinksUpserted,
    status,
    failed_files: failed.map((f) => ({ file: f.file, error: f.error })),
  })

  console.log(
    `✓ Synced ${itemsUpserted} items, ${tagLinksUpserted} tag links. Status: ${status}`
  )
  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(2)
})
```

### File: `lib/domains/radar/schema.ts`

```typescript
import { z } from 'zod'

export const RELEVANCE = ['strong', 'moderate', 'weak'] as const

export const RadarItemSchema = z.object({
  type: z.literal('radar-item'),
  source: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  tldr: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  published_at: z.coerce.date(),
  relevance: z.enum(RELEVANCE),
  related_skill: z.string().optional(),
})
export type RadarItem = z.infer<typeof RadarItemSchema>
```

### Additional Supabase table (add to Phase 0 migration)

```sql
create table radar_sync_runs (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz default now(),
  items_total int not null,
  items_upserted int not null,
  items_failed int not null,
  tag_links int not null,
  status text not null check (status in ('success','partial','failed')),
  failed_files jsonb
);
alter table radar_sync_runs enable row level security;
-- service-role only; no user-facing RLS policy needed
```

### First-time setup (one-pager for the README)

1. **Install Claude Code CLI** (if not already):
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude login
   ```

2. **Initialize the vault directory**:
   ```bash
   mkdir -p autoresearch/vault/radar-items
   echo "# Radar index — empty" > autoresearch/vault/radar-items/_INDEX.md
   touch autoresearch/vault/radar-items/.gitkeep
   ```

3. **First autoresearch run** (~3–8 minutes):
   ```bash
   claude "/autoresearch autoresearch/prompts/weekly-radar.md"
   ```
   Expect 10–30 new `.md` files appearing in `vault/radar-items/`.

4. **Sync to Supabase** (seconds):
   ```bash
   pnpm sync:radar
   ```

5. **Open the app** at `/radar` → feed should render with tag filters.

### Weekly cadence (after first run)

- Monday 9:00 — `claude "/autoresearch autoresearch/prompts/weekly-radar.md"`
- Monday 9:10 — `pnpm sync:radar`
- Review feed at `/radar`, mark interesting items in journal as needed.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Script exits 1 with "Missing env" | `.env.local` not sourced for node process | Use `tsx --env-file=.env.local scripts/sync-radar.ts` or add to package.json `sync:radar` script |
| Many items fail `RadarItemSchema.parse` | Claude wrote malformed YAML | Check `_INDEX.md` for recent iteration notes; manually fix frontmatter; re-run sync |
| `duplicate key` on `radar_items_url_key` | Not an error — upsert handles it | Ignore; `onConflict: 'url'` resolves silently |
| Feed empty after sync | `radar_items` inserted but RLS blocks reads | Confirm `read_all` policy on `radar_items` / `radar_tags` / `radar_item_tags` in migration |
| Autoresearch produces 0 items | Source URLs changed / rate-limited | Check prompt, adjust URLs; Reddit has no auth but may 429 — add `User-Agent` header if using WebFetch direct |

### v2 evolution (headless)

When ready to automate:

1. Add `POST /api/radar/sync` route secured by `CRON_SECRET` bearer
2. `SyncService.upsertBatch(items)` is unchanged — route wraps it
3. Move to a small VPS / GitHub Action scheduled weekly:
   ```yaml
   - run: claude -p "/autoresearch autoresearch/prompts/weekly-radar.md"
   - run: curl -X POST $APP_URL/api/radar/sync \
            -H "Authorization: Bearer $CRON_SECRET" \
            --data @<(pnpm sync:radar --stdout-json)
   ```

No domain code changes. Radar doesn't know where it's invoked from.

---

## Tech choices table

| Dependency | Version | Purpose | Phase |
|---|---|---|---|
| `next` | 16.2.4 | Framework | 0 |
| `react` / `react-dom` | 19.x | UI | 0 |
| `typescript` | 5.7+ | Typing | 0 |
| `tailwindcss` | 4.x | Styling | 0 |
| `@supabase/supabase-js` | 2.104.0 | DB client | 0 |
| `@supabase/ssr` | 0.10.2 | Cookie-safe server client | 0 |
| `ai` | 6.0.168 | AI SDK (kernel only) | 0 |
| `@ai-sdk/react` | 3.0.170 | `useChat` hook | 1 |
| `zod` | 4.3.6 | Schemas + env validation | 0 |
| `gray-matter` | 4.0.3 | Frontmatter parse | 3 |
| `react-markdown` | 10.1.0 | Markdown render | 2 |
| `remark-gfm` | 4.x | GFM support | 2 |
| `rehype-slug` | 6.x | Heading IDs | 2 |
| `rehype-autolink-headings` | 7.x | Header anchors | 2 |
| `next-themes` | 0.4.x | Dark-mode toggle | 0 |
| `lucide-react` | 1.8.0 | Icons | 0 |
| `shadcn` primitives | latest | `button, card, dialog, drawer, sheet, input, label, textarea, badge, progress, separator, skeleton, sonner, tooltip, command, popover, tabs, toggle-group, scroll-area, avatar, radio-group` | 0–1 |
| `framer-motion` | 12.x | Micro-interactions (constrained set) | 0 |
| `vitest` | 3.x | Unit tests | 0 |
| `@playwright/test` | 1.x | E2E smoke | 0 |
| `tsx` | 4.21.0 | Run TS scripts | 0 |
| Supabase CLI + pg_tap | latest | Migrations + RLS tests | 0 |

No React Flow, no MSW, no Novel, no mdxeditor, no Turborepo, no Redis, no ElevenLabs. All v2.

---

## Supabase schema (`0001_init.sql`)

```sql
-- core
create table user_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  english_level text,
  display_name text,
  timezone text,
  created_at timestamptz default now()
);

-- english tutor
create table english_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  started_at timestamptz default now(),
  last_activity_at timestamptz default now(),
  archived_at timestamptz
);

create table english_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references english_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  tokens_in int,
  tokens_out int,
  finish_reason text,
  created_at timestamptz default now()
);

create table english_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid references english_messages(id) on delete set null,
  original text not null,
  correction text not null,
  category text,
  created_at timestamptz default now()
);

create table placement_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int,
  assigned_level text,
  answers_jsonb jsonb default '[]'::jsonb,
  completed_at timestamptz
);

-- skills
create table skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text,
  color text,
  created_at timestamptz default now(),
  archived_at timestamptz,
  unique(user_id, slug)
);

create table skill_nodes (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  title text not null,
  description text,
  parent_id uuid references skill_nodes(id) on delete cascade,
  position_x numeric,         -- nullable; reserved for v2 React Flow
  position_y numeric,
  order_index int default 0
);

create table skill_lessons (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references skill_nodes(id) on delete cascade,
  title text not null,
  content_md text,
  generated_by_ai boolean default false,
  order_index int default 0,
  created_at timestamptz default now(),
  archived_at timestamptz
);

create table lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references skill_lessons(id) on delete cascade,
  status text not null check (status in ('not_started','in_progress','completed')),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

-- radar
create table radar_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  url text unique not null,
  title text not null,
  tldr text,
  body_md text,
  published_at date,
  relevance text check (relevance in ('strong','moderate','weak')),
  created_at timestamptz default now()
);

create table radar_tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table radar_item_tags (
  item_id uuid references radar_items(id) on delete cascade,
  tag_id uuid references radar_tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create table radar_sync_runs (
  id bigserial primary key,
  started_at timestamptz default now(),
  finished_at timestamptz,
  items_total int,
  items_inserted int,
  items_updated int,
  items_failed int,
  error_jsonb jsonb,
  status text check (status in ('running','ok','partial','failed'))
);

-- journal
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content_md text not null default '',
  template_type text,
  skill_id uuid references skills(id) on delete set null,
  lesson_id uuid references skill_lessons(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table journal_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique(user_id, name)
);

create table journal_entry_tags (
  entry_id uuid references journal_entries(id) on delete cascade,
  tag_id uuid references journal_tags(id) on delete cascade,
  primary key (entry_id, tag_id)
);

-- cost / budget
create table ai_usage_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  model text not null,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,6),
  latency_ms int,
  status text check (status in ('ok','aborted','error','blocked-by-budget')),
  request_id text,
  stream_id text,
  finish_reason text,
  created_at timestamptz default now()
);
create index on ai_usage_log (user_id, created_at desc);
create index on ai_usage_log (domain, created_at desc);

create table budget_config (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_hard_cap_usd numeric(6,2) default 3.00,
  daily_soft_cap_usd numeric(6,2) default 2.00,
  monthly_hard_cap_usd numeric(6,2) default 40.00,
  per_call_max_tokens_out int default 4000,
  alerts_email text,
  updated_at timestamptz default now()
);
```

### RLS policies (`0002_rls.sql`)

Template applied to every owner-keyed table — `user_profiles`, `english_sessions`, `english_messages` (via session join), `english_mistakes`, `placement_tests`, `skills`, `skill_nodes` (via skill join), `skill_lessons` (via node→skill join), `lesson_progress`, `journal_entries`, `journal_tags`, `journal_entry_tags` (via entry join), `ai_usage_log`, `budget_config`:

```sql
alter table <t> enable row level security;
create policy "<t>_owner_select" on <t> for select using (auth.uid() = user_id);
create policy "<t>_owner_insert" on <t> for insert with check (auth.uid() = user_id);
create policy "<t>_owner_update" on <t> for update using (auth.uid() = user_id);
create policy "<t>_owner_delete" on <t> for delete using (auth.uid() = user_id);
```

For join-keyed tables (e.g., `english_messages`), the policy checks ownership via the parent session's `user_id`. `radar_items`, `radar_tags`, `radar_item_tags`, `radar_sync_runs` have permissive `select` for authenticated users (single-user app; multi-user radar privacy is a v2 concern), and **no** insert/update/delete policies — writes go through service role only.

pg_tap tests in `supabase/tests/rls/` simulate two users, assert `user_a` can't `select`/`update` `user_b`'s rows for each table.

---

## `AiKernel` interface — canonical shape

```ts
// lib/core/ai-kernel.ts
export type Domain =
  | `english.${'native'|'lesson'|'translate'|'flashcards'|'grammar'|'quiz'|'placement'|'mistake-extractor'}`
  | `skills.${'generate-lesson'}`
  | `radar.${string}`

export interface OnFinishCtx {
  text: string
  usage: { promptTokens: number; completionTokens: number }
  cost: number
  finishReason: string
}

export interface StreamParams {
  userId: UserId
  domain: Domain
  model: ModelId
  system: string
  messages: UIMessage[]
  maxOutputTokensOverride?: number
  onFinishHook?: (ctx: OnFinishCtx) => Promise<void>
}

export interface CompleteParams extends Omit<StreamParams, 'onFinishHook'> {
  responseSchema?: z.ZodTypeAny   // for placement / mistake-extractor structured output
}

export interface AiKernel {
  stream(p: StreamParams): Promise<{ result: StreamTextResult; softWarning: boolean }>
  complete<T = string>(p: CompleteParams): Promise<{ value: T; cost: number }>
}

/**
 * Injection contract: the kernel NEVER concatenates untrusted text into `system`.
 * Domain prompts place user-pasted text inside `<user_input>…</user_input>` within
 * a user role message. The kernel scrubs output via OutputScrubber before calling
 * onFinishHook (blocks leaked secrets: sk-…, eyJ…, sbp_…, SUPABASE_…).
 */
```

Budget guard wiring lives inside `stream()` (all 4 layers, as shown in the Phase 1 sketch). The kernel is the **only** file in the repo that imports from `'ai'`. An ESLint rule enforces this:

```json
"no-restricted-imports": ["error", {
  "patterns": [{
    "group": ["ai", "@ai-sdk/*"],
    "message": "AI SDK must be accessed only through lib/core/ai-kernel.ts"
  }]
}]
```

---

## Testing strategy (the middle path)

| Layer | Tool | Scope |
|---|---|---|
| Pure domain logic | Vitest | `prompts`, `pricing`, `nodeProgress/skillProgress`, `RadarItemSchema`, `BudgetGuard` thresholds, `templates` |
| RLS policies | pg_tap via `supabase test db` | Every owner-keyed table; two-user leakage assertions |
| Flow smoke | Playwright | One per domain: English sign-in→placement→chat; Skills generate→mark complete; Radar feed renders seeded items; Journal save+autosave |
| Env contract | Vitest + stub harness | `lib/env.ts` Zod parses `process.env` fixtures; fails on missing |
| Cost drift | Vitest | `costFor()` matches pinned pricing table; warning logged when Gateway `usage` diverges |

CI order (fail fast): `pnpm tsc --noEmit` → `pnpm vitest --run` → `supabase test db` → `pnpm build` → bundle-secret-grep → Playwright. No MSW, no Vitest full coverage, no visual diff, no quarterly drills — all v2.

---

## Observability & deploy safety

### Dashboards

- **`/settings/usage`** (user-facing, Phase 0): today's spend bar vs hard cap, MTD, per-domain breakdown, last 50 calls table (cost/latency/status), editable caps.
- **AI Gateway dashboard** (Vercel built-in): cross-checked weekly vs `ai_usage_log`.
- **Supabase dashboard**: slow-query (>500ms) email digest weekly.
- **Sentry** (env-gated): `beforeSend` scrubs journal content + prompt bodies + mistake text.
- **Vercel logs**: structured JSON per route handler — `{ ts, level, domain, user_id, request_id, duration_ms, status }`.

### CI gates (hard-fail)

1. `pnpm tsc --noEmit`
2. `pnpm vitest --run` (pure functions only)
3. `supabase test db` (pg_tap RLS)
4. `pnpm build`
5. **Bundle-secret-grep**: `grep -RE 'eyJ[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,}|sbp_[A-Za-z0-9]{20,}' .next/static` — nonzero matches → fail.
6. Playwright smoke (one per domain).
7. `lib/env.ts` Zod parse against a stub env fixture.

### Migration safety rules (`docs/runbooks/migrations.md`)

- Never drop a column the currently-deployed code reads in a single migration.
- Two-step for breaking changes: add new → ship code using both → backfill → drop old in a follow-up.
- Destructive SQL (`DROP`, `ALTER … DROP`, `RENAME`) detected by a CI grep requires a manual approval gate on the GitHub Actions job.
- Every migration file has a reversible counterpart or a documented rollback SQL.

### Deploy preview strategy

- Single shared staging Supabase project. Every Vercel preview hits staging env.
- `main` → prod Supabase. Migrations run via `supabase db push` in the merge workflow behind the manual-approval gate for destructive ops.
- Rollback: Vercel one-click previous-deployment promotion; Supabase via nightly `pg_dump` artifact restore (PITR = v2 if Supabase Pro is ever adopted).

---

## v2 seams (stubbed interfaces, ship-ready to swap)

| Seam | Interface | MVP impl | v2 swap |
|---|---|---|---|
| Quotas | `QuotaService { check(userId, domain): Promise<Allowed> }` | `noopQuota` always allows | `SupabaseQuotaService` with per-plan tables |
| Speech | `SpeechProvider { tts(text): Blob; stt(audio): text }` | `noSpeech` always rejects | `ElevenLabsSpeech` + Whisper client |
| Journal crypto | `JournalCrypto { encrypt; decrypt }` | `identityCrypto` passthrough | `LibsodiumCrypto` with user-derived key |
| Invite gate | inside `requireAuth(req)` — returns `AuthContext` or throws `InviteRequiredError` | pass-through (single user) | reads `invites` table + flag |
| Radar headless sync | `SyncService.upsertBatch(items)` | called from `scripts/sync-radar.ts` locally | add `POST /api/radar/sync` with `CRON_SECRET` bearer + Vercel Cron |
| Mistake tracker | `MistakeExtractor.extract(turn)` called in `onFinishHook` | gated by `ENABLE_MISTAKE_TRACKING=false` | flip env flag after cost validation |

Every swap is a constructor change or a flag flip — no domain code edits.

---

## Risk register (consolidated)

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Runaway Sonnet loop blows monthly budget | High | 4-layer `BudgetGuard`: pre-call gate, soft warning, `maxOutputTokens=4000`, 90s watchdog abort. `/settings/usage` visible day 1. |
| 2 | Prompt injection via Mode 3/4 user-pasted text | High | `<user_input>` delimiter contract in kernel; 8000-char input cap; output scrubber regex for `eyJ/sk-/sbp_/SUPABASE_`; redact + log `prompt_injection_suspected`. |
| 3 | Supabase service-role key leaks | Critical | Key used only in `scripts/sync-radar.ts`; no public sync route; bundle-secret-grep CI; env-drift detector; 90-day rotation runbook. |
| 4 | RLS policy bug leaks data at multi-user v2 | High | pg_tap per owner-keyed table in CI; hard CI fail on failure; two-user leakage assertions. |
| 5 | AI Gateway streaming breaks | Medium | **Day 1 smoke script**; AI SDK retry (2 attempts, exp backoff) on 5xx; friendly error UI; persist user message regardless. |
| 6 | Placement test quality flaky | Medium | 15-question static CEFR JSON fallback; Zod-parse AI response; fallback engages on parse fail or timeout; log `placement_degraded`. |
| 7 | AI lesson gen cost regresses over time | Medium | Permanent cache in `skill_lessons`; regenerate requires explicit confirmation with cost estimate; old row archived, not deleted. |
| 8 | Sync script breaks on malformed frontmatter | Low | Per-item try-parse via `RadarItemSchema`; one bad file doesn't abort; `radar_sync_runs` exposes first 100 errors; nonzero exit. |
| 9 | Mobile chat UX broken by iOS keyboard | Medium | `100dvh` + `env(safe-area-inset-bottom)`; scroll-lock while streaming; tested on real iOS Safari before MVP sign-off. |
| 10 | Dark mode ships with hardcoded grays | Low | Design tokens from day 0; `next-themes` installed Phase 0; dark walkthrough every page in Phase 5. |
| 11 | User data loss on stream abort mid-turn | Medium | `onError` writes partial message row with `finish_reason='aborted'`; `ai_usage_log` always written before `english_messages`. |
| 12 | Accidental destructive migration on prod | High | CI grep detects `DROP`/`ALTER…DROP`/`RENAME`; requires manual approval gate; two-step rule documented. |
| 13 | Onboarding fails → user bounces | High | Auto-seed "Learning English" skill regardless of placement outcome; primary CTA streams Mode-2 greeting within 90s; static fallback if AI down. |
| 14 | Claude Code CLI absent on user's machine for radar | Low | Accepted single-user constraint; README documents install; headless cron is v2. |
| 15 | Bundle bloat from Framer Motion / shadcn / markdown | Low | Framer Motion used only for 5 specific micro-interactions; code-split radar + journal routes; bundle report in CI output. |

---

## Execution checklist — first-day "open editor, do this"

1. [ ] `mkdir superpowers && cd superpowers`
2. [ ] `pnpm create next-app@16.2.4 . --typescript --app --tailwind --no-src-dir --import-alias "@/*"`
3. [ ] `git init && git add -A && git commit -m "chore: scaffold Next.js 16 app"`
4. [ ] Install core deps: `pnpm add ai@6.0.168 @ai-sdk/react@3.0.170 @supabase/supabase-js@2.104.0 @supabase/ssr@0.10.2 zod@4.3.6 gray-matter@4.0.3 react-markdown@10.1.0 remark-gfm rehype-slug rehype-autolink-headings lucide-react next-themes framer-motion`
5. [ ] `pnpm dlx shadcn@latest init -t next` then add the Phase 0 primitive set.
6. [ ] Install dev deps: `pnpm add -D tsx vitest @playwright/test supabase`.
7. [ ] Copy `.env.example` to `.env.local`, fill Supabase URL + keys + `AI_GATEWAY_API_KEY` + `MAX_DAILY_USD=3` + `CRON_SECRET`.
8. [ ] Write `lib/env.ts` Zod validation; verify `pnpm dev` boots.
9. [ ] **Write `scripts/smoke-stream.ts`. Run `pnpm tsx scripts/smoke-stream.ts`. See tokens stream. DO NOT PROCEED until this is green.**
10. [ ] Write `supabase/migrations/0001_init.sql` + `0002_rls.sql`; `supabase db push` locally.
11. [ ] Author pg_tap test for `journal_entries` as a template; `supabase test db` green.
12. [ ] Write `lib/core/pricing.ts` + unit tests.
13. [ ] Write `lib/core/budget-guard.ts` + unit tests for all 4 layers.
14. [ ] Write `lib/core/ai-kernel.ts` wrapping guard + usage log + scrubber.
15. [ ] Wire `ESLint no-restricted-imports` rule for `ai`/`@ai-sdk/*`.
16. [ ] Write `app/globals.css` tokens; install `next-themes`; wrap root layout in `<ThemeProvider>`.
17. [ ] Build app shell: sidebar + bottom tabs + top bar + `⌘K` palette (at least opens).
18. [ ] Build `/settings/usage` with live `ai_usage_log` query (initially empty).
19. [ ] Deploy to Vercel preview; magic-link through to placeholder `/onboarding`.
20. [ ] Commit, push, get CI green. That's Phase 0 done.

From here, walk Phase 1 → 5 in order. Ship what you have at the end of each phase on a preview URL, gut-check it in your own browser before starting the next.

---

*End of final plan.*
