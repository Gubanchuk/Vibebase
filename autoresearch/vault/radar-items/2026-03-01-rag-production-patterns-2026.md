---
type: radar-item
source: redis-blog
url: https://redis.io/blog/rag-at-scale/
title: "RAG at Scale — production patterns 2026"
tldr: |
  72% организаций к Q1 2026 гоняют RAG в продакшене. Пилоты упали до 16%
  — команды либо закоммитились, либо отказались. Planning-фаза сжалась
  с 6-12 месяцев до 4-6 недель благодаря reference-архитектурам. Hybrid
  search (dense + sparse) — стандарт: 91% recall@10 vs 78% dense-only,
  +6ms p50 latency. Voyage-3-large обгоняет OpenAI и Cohere на 9-20%.
tags: [rag, vector-db, embeddings, production, patterns]
published_at: 2026-03-01
relevance: moderate
related_skill: vibecoding
---

# Стандарты 2026

| Компонент | Статус-кво |
|-----------|------------|
| Search | Hybrid (dense + BM25) — must-have |
| Vector DB | Pinecone / Weaviate / Milvus / Qdrant — консолидация |
| Embedding | Voyage-3-large лидер качества, Gemini Embedding 2 для multimodal |
| Latency | <50ms p99 целевой для UX |
| Chunking | Semantic > fixed-size, overlap 10-20% |
| Observability | Query embeddings + retrieved IDs + user feedback в логах |

# Production-только infra

Production-системы логируют **query embeddings** чтобы отслеживать drift:
если распределение query-embeddings сместилось — пора переиндексировать.

# Применимо у нас

Autoresearch vault по сути — это документная база. Пока 45 items, search
не нужен (prompt-injection всего vault в Curator справляется). Когда
доберёмся до 500+ items, понадобится RAG: Qdrant self-hosted или Pinecone
serverless, hybrid search, voyage-3-large для embeddings.
