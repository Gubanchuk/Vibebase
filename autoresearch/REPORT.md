# Autoresearch run — 2026-04-22 · seed pass

## Summary

Initial seed-pass for the Personal Skills Platform. Two tracks ran in the
same pass:

- **Vibecoding radar:** past ~3-month window (broader than the weekly
  cadence will use) — 24 items in raw vault, 10 in curated.
- **English-learning methodology:** past ~12-month window (matches the
  planned monthly cadence) — 12 items in raw vault, 6 in curated.

Total files written: **2 prompts + 24 radar + 12 english + 2 curated
indexes + 2 vault indexes + this report = 43 markdown files.**

## Top 5 discoveries

1. **Claude Opus 4.7 GA (2026-04-16)** with SWE-bench Pro 64.3% — biggest
   single-release coding-benchmark jump of the cycle. Reshapes our model
   picker defaults.
2. **AI SDK 6 ships Agent abstraction + ToolLoopAgent** — clean migration
   target for our `AiKernel`, with non-breaking API for existing
   `streamText` callers.
3. **Claude Code Skills 2.0** — skills now spawn isolated subagents with
   their own context + evals via skill-creator. Opens real optionality for
   how we structure English modes (skills vs. static system prompts).
4. **Empirical Krashen+LLM study** (Frontiers 2025-11) — calibrated-input
   hypothesis holds with AI tutors, but requires <5% level-overshoot.
   Quantifies the calibration accuracy budget.
5. **Karpathy's "vibe coding is passé"** reframing — our radar's taxonomy
   should emphasize "agentic engineering" (orchestration + oversight)
   rather than "AI writes code". Keep `vibecoding` as a product tag since
   it's our brand vocabulary, but content coverage shifts.

## What we could not find / deferred

- **TTS/STT tutor empirical work** — little 2025 literature surfaced;
  consistent with TTS/STT being deferred to v2 in the product spec.
- **OpenAI / Codex coding-agent crosspost to Claude space** — some, but
  none in-window that warranted a strong-tagged entry. Revisit next pass.
- **@rauchg vibecoding posts** — searched; mostly Next.js/Vercel infra
  content, not radar-relevant this pass.
- **r/LocalLLaMA** — searched; lots of open-weights news but little Claude
  Code crossover meriting an entry here.

## How to use what's here

### For the radar feature (live in the app)
- The 10 items in `vault/curated/radar/` are the seed feed — the Radar
  domain in the app will hydrate from here (or from the sync script, once
  Supabase is connected).
- Re-run `claude /autoresearch autoresearch/prompts/weekly-radar.md` weekly
  (Monday 9:00 suggested). Raw items pile into `vault/radar-items/`; re-run
  curation by hand or via a future skill.

### For the English tutor prompts
- The 6 curated English items should be cross-referenced from the system
  prompt files at `app/lib/domains/english/prompts/*.ts`. When tomorrow's
  session audits those prompts for the AI Gateway wiring, these curated
  references give the operative principles.

### For future autoresearch runs
- `autoresearch/prompts/weekly-radar.md` — weekly cadence, 7-day window
- `autoresearch/prompts/english-research.md` — monthly cadence, 12-month
  window at the first run, shorter windows thereafter

## Integrity notes

- Every `tldr` is grounded in a search-result excerpt I read directly
  before writing. Where claims are interpretive ("this reshapes model
  defaults"), they're marked as interpretation under the `# Why this
  matters` sections, not in `tldr` frontmatter.
- Where the search surfaced a URL redirect or slight source URL drift, I
  used the canonical URL the result page resolved to. A later sync-run
  HEAD check will re-validate all URLs.
- I did **not** invent any URLs or publication dates. Where a date was
  ambiguous in the source, I conservatively used the most recent date
  visible.
