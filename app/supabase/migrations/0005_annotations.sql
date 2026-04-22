-- =====================================================================
-- 0005_annotations.sql
-- Закладки + персональные заметки на curriculum-топиках.
-- Одна строка на (user_id, topic_id). Если строки нет — нет аннотации.
-- =====================================================================

create table if not exists topic_annotations (
  user_id         uuid not null references auth.users(id)         on delete cascade,
  topic_id        uuid not null references curriculum_topics(id)  on delete cascade,
  is_bookmarked   boolean not null default false,
  personal_notes  text    not null default '',
  updated_at      timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index if not exists topic_annotations_user_bm_idx
  on topic_annotations (user_id, is_bookmarked) where is_bookmarked = true;

create index if not exists topic_annotations_user_notes_idx
  on topic_annotations (user_id) where length(personal_notes) > 0;

alter table topic_annotations enable row level security;

do $$ begin
  create policy topic_annotations_owner on topic_annotations
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create or replace function touch_topic_annotation() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists topic_annotations_touch on topic_annotations;
create trigger topic_annotations_touch
  before update on topic_annotations
  for each row execute function touch_topic_annotation();

comment on table topic_annotations is
  'Персональные закладки и заметки юзера на curriculum-топиках. Отдельная концепция от lesson_mastery.notes (там deprecated поле, пустое).';
