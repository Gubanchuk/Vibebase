-- =====================================================================
-- 0001_init.sql
-- Personal skills platform — initial schema.
-- Domains: English tutor, Skills, Radar, Journal + shared AI cost/budget.
-- All tables use lowercase snake_case; all timestamps are timestamptz.
-- Strict per-owner data model; every user-owned row references auth.users.
-- =====================================================================

-- Required for gen_random_uuid().
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enum types (referenced from TypeScript, hence real enums).
-- ---------------------------------------------------------------------
do $$ begin
  create type english_mode as enum ('native','lesson','translate','flashcards','grammar','quiz');
exception when duplicate_object then null; end $$;

do $$ begin
  create type relevance as enum ('strong','moderate','weak');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role as enum ('user','assistant','system');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- Core: user profile + budget config + AI usage log
-- =====================================================================

create table user_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  english_level text,                               -- e.g. 'A2','B1','B2','C1'
  display_name  text,
  timezone      text,                               -- IANA tz, e.g. 'Europe/Moscow'
  created_at    timestamptz not null default now()
);
comment on column user_profiles.english_level is 'CEFR level tag, set via placement or manually.';

create table budget_config (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  daily_cost_cap_usd      numeric(6,2) not null default 2.00,
  monthly_cost_cap_usd    numeric(6,2) not null default 30.00,
  per_call_max_tokens_out int          not null default 2048,
  updated_at              timestamptz  not null default now()
);
comment on table budget_config is 'Per-user hard caps for AI spend; enforced in AiKernel before each call.';

create table ai_usage_log (
  id             bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  domain         text not null,                      -- e.g. 'english.lesson','skills.generate-lesson'
  model          text not null,                      -- canonical model id
  tokens_in      int,
  tokens_out     int,
  cost_usd       numeric(10,6),
  latency_ms     int,
  status         text check (status in ('ok','aborted','error','blocked-by-budget')),
  finish_reason  text,
  created_at     timestamptz not null default now()
);
create index ai_usage_log_user_created_idx on ai_usage_log (user_id, created_at desc);
create index ai_usage_log_domain_created_idx on ai_usage_log (domain, created_at desc);

-- =====================================================================
-- English tutor
-- =====================================================================

create table english_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  mode              english_mode not null,
  level             text,                            -- snapshot of english level at session start
  started_at        timestamptz not null default now(),
  last_activity_at  timestamptz not null default now()
);
create index english_sessions_user_started_idx on english_sessions (user_id, started_at desc);

create table english_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references english_sessions(id) on delete cascade,
  role        message_role not null,
  content     text not null,
  created_at  timestamptz not null default now()
);
create index english_messages_session_created_idx on english_messages (session_id, created_at);

create table english_mistakes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  session_id   uuid references english_sessions(id) on delete set null,
  message_id   uuid references english_messages(id) on delete set null,
  category     text,                                 -- e.g. 'grammar','lexical','collocation'
  original     text not null,
  correction   text not null,
  explanation  text,
  created_at   timestamptz not null default now()
);
create index english_mistakes_user_created_idx on english_mistakes (user_id, created_at desc);

create table placement_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  level        text not null,                        -- assigned CEFR level
  confidence   numeric(4,3),                         -- 0..1 model confidence
  answered_at  timestamptz not null default now(),
  raw_jsonb    jsonb not null default '{}'::jsonb    -- full answers/signals payload
);
create index placement_results_user_answered_idx on placement_results (user_id, answered_at desc);

-- =====================================================================
-- Skills (user-owned roadmaps + lessons)
-- =====================================================================

create table skills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  slug          text not null,                       -- unique per user, url-safe
  name          text not null,
  description   text,
  target_level  text,                                -- free-form, e.g. 'pro','daily-use','B2'
  emoji         text,                                -- single emoji identifier
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (user_id, slug)
);

create table skill_nodes (
  id           uuid primary key default gen_random_uuid(),
  skill_id     uuid not null references skills(id) on delete cascade,
  parent_id    uuid references skill_nodes(id) on delete cascade,  -- nullable self-ref for tree
  title        text not null,
  description  text,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);
create index skill_nodes_skill_idx on skill_nodes (skill_id);
create index skill_nodes_parent_idx on skill_nodes (parent_id);

create table skill_lessons (
  id               uuid primary key default gen_random_uuid(),
  node_id          uuid not null references skill_nodes(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  content_md       text,
  generated_by_ai  boolean not null default false,
  archived_at      timestamptz,
  created_at       timestamptz not null default now()
);
-- Cache lookup: one active lesson per (node, user).
create unique index skill_lessons_active_node_user_idx
  on skill_lessons (node_id, user_id)
  where archived_at is null;
create index skill_lessons_user_created_idx on skill_lessons (user_id, created_at desc);

create table lesson_progress (
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references skill_lessons(id) on delete cascade,
  completed_at  timestamptz,
  notes         text,
  primary key (user_id, lesson_id)
);

-- =====================================================================
-- Radar (globally readable feed, populated by service role)
-- =====================================================================

create table radar_items (
  id            uuid primary key default gen_random_uuid(),
  url           text unique not null,
  source        text not null,                       -- e.g. 'claude-code','agents-lab'
  title         text not null,
  tldr          text,
  body_md       text,
  published_at  date,
  relevance     relevance,
  created_at    timestamptz not null default now()
);
create index radar_items_published_idx on radar_items (published_at desc);
create index radar_items_relevance_idx on radar_items (relevance);

create table radar_tags (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  name  text not null
);

create table radar_item_tags (
  item_id  uuid not null references radar_items(id) on delete cascade,
  tag_id   uuid not null references radar_tags(id)  on delete cascade,
  primary key (item_id, tag_id)
);
create index radar_item_tags_tag_idx on radar_item_tags (tag_id);

create table radar_sync_runs (
  id             bigserial primary key,
  run_at         timestamptz not null default now(),
  items_total    int,
  items_upserted int,
  items_failed   int,
  tag_links      int,
  status         text check (status in ('running','ok','partial','failed')),
  failed_files   jsonb not null default '[]'::jsonb
);
create index radar_sync_runs_run_at_idx on radar_sync_runs (run_at desc);

-- =====================================================================
-- Journal
-- =====================================================================

create table journal_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text,
  content_md      text not null default '',
  templates_used  text[] not null default '{}',      -- e.g. ARRAY['daily','gratitude']
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index journal_entries_user_created_idx on journal_entries (user_id, created_at desc);
-- Full-text search index over content_md (simple config; per-lang can be added later).
create index journal_entries_content_fts_idx
  on journal_entries
  using gin (to_tsvector('simple', coalesce(content_md, '')));

-- Keep updated_at honest.
create or replace function set_journal_entries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger journal_entries_set_updated_at
  before update on journal_entries
  for each row execute function set_journal_entries_updated_at();
