# Curated — чистый винд

The curated folder holds the highest-signal subset of the two raw vaults. An
item lands here only if:

1. It has `relevance: strong` in the raw vault
2. Source authority is high (official blog / peer-reviewed / canonical
   practitioner) — or it's a singular community pattern with heavy endorsement
3. Content is *actionable*: it either ships into code (radar feed, tutor
   prompt) or shapes a design decision directly
4. It's not redundant with another curated item on the same facet

## Criteria applied this pass

- **Radar (10 items):** prioritize concrete releases (Opus 4.7, AI SDK 6,
  Skills 2.0) + primary-source patterns (Anthropic docs, Karpathy quote,
  community skill pattern). Diverse tags so the feed isn't mono-topic.
- **English (6 items):** cover four must-have facets — comprehensible input
  theory, Russian-L1 specifics, placement methodology, tutor prompt craft.
  Prefer strongest empirical or canonical item per facet.

## Lifecycle

- When a radar item's URL goes 404 or its claim is contradicted by a newer
  strong item, demote it out of curated (move back to raw, remove from this
  folder).
- When running weekly autoresearch, after the new items are added to raw
  vault, re-run the curation filter — if a new item beats an existing
  curated item on same facet, swap.
