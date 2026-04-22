-- =====================================================================
-- 0003_vibecoding.sql
-- Добавляет vibecoding_level в user_profiles и расширяет placement_results
-- доменом (english / vibecoding). Запускать в SQL Editor после 0001 + 0002.
-- =====================================================================

alter table user_profiles
  add column if not exists vibecoding_level text;
comment on column user_profiles.vibecoding_level is
  'Уровень владения vibecoding-стеком: newbie / practitioner / architect / maintainer.';

-- Опциональный домен у placement_results, по умолчанию english для старых
-- записей. Новые записи указывают domain явно.
alter table placement_results
  add column if not exists domain text not null default 'english';

-- Полезный индекс: чаще всего берём последнюю попытку по домену.
create index if not exists placement_results_user_domain_answered_idx
  on placement_results (user_id, domain, answered_at desc);
