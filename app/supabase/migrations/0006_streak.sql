-- =====================================================================
-- 0006_streak.sql
-- Реальный streak: колонки в user_profiles + таблица дней активности.
-- Стрик считается по first-activity-per-UTC-day.
-- =====================================================================

alter table user_profiles
  add column if not exists last_activity_at timestamptz,
  add column if not exists streak_days      int not null default 0,
  add column if not exists streak_best      int not null default 0;

create table if not exists activity_days (
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null,
  events     int  not null default 1,
  primary key (user_id, day)
);

create index if not exists activity_days_user_idx
  on activity_days (user_id, day desc);

alter table activity_days enable row level security;

do $$ begin
  create policy activity_days_owner on activity_days
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

comment on table activity_days is
  'Дни, когда юзер совершил хотя бы одно обучающее действие (UTC). Используется для календаря активности и верификации стрика.';
