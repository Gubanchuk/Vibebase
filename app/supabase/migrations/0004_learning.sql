-- =====================================================================
-- 0004_learning.sql
-- Структурный курс: топики (куратор из vault), уроки (teacher per-user),
-- прогресс (mastery через quiz). Ядро новой обучающей механики.
-- Запускать в SQL Editor после 0001..0003.
-- =====================================================================

-- ─── curriculum_topics — глобальный справочник тем ─────────────────────
-- Domain-specific (english / vibecoding). Куратор строит из vault,
-- обновляется periodically. Для всех юзеров один и тот же набор.
create table if not exists curriculum_topics (
  id            uuid primary key default gen_random_uuid(),
  domain        text not null check (domain in ('english','vibecoding')),
  slug          text not null,
  title         text not null,
  summary       text not null,
  importance    int  not null default 3 check (importance between 1 and 5),
  popularity    int  not null default 0,
  level_min     text,       -- e.g. 'A2','B1' / 'newbie','practitioner'
  level_max     text,
  tags          text[] not null default '{}',
  vault_refs    text[] not null default '{}',
  prerequisites uuid[] not null default '{}',
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (domain, slug)
);
create index if not exists curriculum_topics_domain_rank_idx
  on curriculum_topics (domain, importance desc, popularity desc);

comment on table curriculum_topics is
  'Глобальный справочник обучающих тем. Строится Curator-агентом из autoresearch vault.';

-- ─── lesson_content — персонализированная лекция (per user per topic) ──
-- Генерируется Teacher-агентом лениво при открытии и кешируется.
create table if not exists lesson_content (
  id                    uuid primary key default gen_random_uuid(),
  topic_id              uuid not null references curriculum_topics(id) on delete cascade,
  user_id               uuid not null references auth.users(id)         on delete cascade,
  level_snapshot        text,
  intro_md              text not null,
  concept_md            text not null,
  example_md            text not null,
  exercise_md           text not null,
  exercise_solution_md  text not null,
  quiz_jsonb            jsonb not null,  -- [{ prompt, options[], correctIndex, explanation }, ...]
  generated_at          timestamptz not null default now(),
  model_used            text,
  tokens_in             int,
  tokens_out            int,
  cost_usd              numeric(10,6),
  unique (topic_id, user_id)
);
create index if not exists lesson_content_user_idx on lesson_content (user_id);

comment on table lesson_content is
  'Кеш сгенерированных уроков per-user. Teacher-agent создаёт при первом открытии.';

-- ─── lesson_mastery — прогресс юзера по каждому топику ─────────────────
create table if not exists lesson_mastery (
  user_id          uuid not null references auth.users(id)         on delete cascade,
  topic_id         uuid not null references curriculum_topics(id)  on delete cascade,
  attempts         int  not null default 0,
  quiz_best_score  int  not null default 0,   -- 0..3
  quiz_best_total  int  not null default 3,
  exercise_passed  boolean not null default false,
  mastered_at      timestamptz,               -- NULL если ещё не mastered
  last_attempt_at  timestamptz,
  notes            text,
  primary key (user_id, topic_id)
);
create index if not exists lesson_mastery_user_mastered_idx
  on lesson_mastery (user_id, mastered_at);

comment on table lesson_mastery is
  'Прогресс юзера по топикам: mastered_at != null ⇒ топик освоен (quiz ≥ 2/3 + exercise passed).';

-- ─── RLS ───────────────────────────────────────────────────────────────
alter table curriculum_topics enable row level security;
alter table lesson_content    enable row level security;
alter table lesson_mastery    enable row level security;

-- Топики — глобальные, любой authenticated читает; пишет только service role.
do $$ begin
  create policy topics_read on curriculum_topics
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- lesson_content / lesson_mastery — strict owner-scope.
do $$ begin
  create policy lesson_content_owner on lesson_content
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy lesson_mastery_owner on lesson_mastery
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- ─── Trigger: auto-update updated_at on topics ─────────────────────────
create or replace function touch_updated_at_topic() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists curriculum_topics_touch on curriculum_topics;
create trigger curriculum_topics_touch
  before update on curriculum_topics
  for each row execute function touch_updated_at_topic();
