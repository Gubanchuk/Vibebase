-- =====================================================================
-- owner_tables.test.sql
-- pg_tap tests: for each user-owned table, verify that user A cannot
-- select/insert/update/delete user B's rows under RLS.
--
-- Pattern: each table wrapped in begin; plan(N); ...; select finish(); rollback;
-- We simulate Supabase auth by:
--   set local role authenticated;
--   set local "request.jwt.claims" = '{"sub":"<uuid>","role":"authenticated"}';
-- auth.uid() reads the `sub` claim.
--
-- Fixture uuids (stable):
--   user A = 11111111-1111-1111-1111-111111111111
--   user B = 22222222-2222-2222-2222-222222222222
--
-- Seed rows for both users are inserted via service role (default superuser
-- in pg_tap harness) before RLS is tested.
-- =====================================================================

create extension if not exists pgtap;

\set user_a '11111111-1111-1111-1111-111111111111'
\set user_b '22222222-2222-2222-2222-222222222222'

-- ---------------------------------------------------------------------
-- Helpers (inline each block): switch to user role.
-- ---------------------------------------------------------------------
-- Re-used snippet:
--   set local role authenticated;
--   set local "request.jwt.claims" = '{"sub":"<uuid>","role":"authenticated"}';

-- =====================================================================
-- user_profiles
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into user_profiles (user_id, display_name) values (:'user_a'::uuid, 'A'), (:'user_b'::uuid, 'B');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from user_profiles where user_id = :'user_b'::uuid),
  0,
  'user_profiles: A cannot SELECT B'
);

select throws_ok(
  $$ insert into user_profiles (user_id, display_name) values ('22222222-2222-2222-2222-222222222222','spoof') $$,
  '42501',
  null,
  'user_profiles: A cannot INSERT as B'
);

select is(
  (with upd as (
     update user_profiles set display_name = 'hacked' where user_id = :'user_b'::uuid returning 1
   ) select count(*)::int from upd),
  0,
  'user_profiles: A cannot UPDATE B rows'
);

select is(
  (with del as (
     delete from user_profiles where user_id = :'user_b'::uuid returning 1
   ) select count(*)::int from del),
  0,
  'user_profiles: A cannot DELETE B rows'
);

select finish();
rollback;

-- =====================================================================
-- budget_config
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into budget_config (user_id) values (:'user_a'::uuid), (:'user_b'::uuid);

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from budget_config where user_id = :'user_b'::uuid),
  0, 'budget_config: A cannot SELECT B'
);
select throws_ok(
  $$ insert into budget_config (user_id) values ('22222222-2222-2222-2222-222222222222') $$,
  '42501', null, 'budget_config: A cannot INSERT as B'
);
select is(
  (with upd as (update budget_config set daily_cost_cap_usd = 99.99 where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'budget_config: A cannot UPDATE B'
);
select is(
  (with del as (delete from budget_config where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'budget_config: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- ai_usage_log
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into ai_usage_log (user_id, domain, model, status) values
  (:'user_a'::uuid, 'english.native', 'm', 'ok'),
  (:'user_b'::uuid, 'english.native', 'm', 'ok');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from ai_usage_log where user_id = :'user_b'::uuid),
  0, 'ai_usage_log: A cannot SELECT B'
);
select throws_ok(
  $$ insert into ai_usage_log (user_id, domain, model, status) values ('22222222-2222-2222-2222-222222222222','x','m','ok') $$,
  '42501', null, 'ai_usage_log: A cannot INSERT as B'
);
select is(
  (with upd as (update ai_usage_log set status = 'error' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'ai_usage_log: A cannot UPDATE B'
);
select is(
  (with del as (delete from ai_usage_log where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'ai_usage_log: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- english_sessions
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into english_sessions (user_id, mode) values
  (:'user_a'::uuid, 'native'),
  (:'user_b'::uuid, 'native');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from english_sessions where user_id = :'user_b'::uuid),
  0, 'english_sessions: A cannot SELECT B'
);
select throws_ok(
  $$ insert into english_sessions (user_id, mode) values ('22222222-2222-2222-2222-222222222222','native') $$,
  '42501', null, 'english_sessions: A cannot INSERT as B'
);
select is(
  (with upd as (update english_sessions set mode = 'quiz' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'english_sessions: A cannot UPDATE B'
);
select is(
  (with del as (delete from english_sessions where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'english_sessions: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- english_messages (join-keyed via english_sessions)
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;

with sa as (insert into english_sessions (user_id, mode) values (:'user_a'::uuid,'native') returning id),
     sb as (insert into english_sessions (user_id, mode) values (:'user_b'::uuid,'native') returning id)
insert into english_messages (session_id, role, content)
select id, 'user', 'a-msg' from sa
union all
select id, 'user', 'b-msg' from sb;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from english_messages m
     join english_sessions s on s.id = m.session_id
     where s.user_id = :'user_b'::uuid),
  0, 'english_messages: A cannot SELECT B messages'
);

select throws_ok(
  $$
    insert into english_messages (session_id, role, content)
    select id, 'user', 'spoof' from english_sessions where user_id = '22222222-2222-2222-2222-222222222222'
  $$,
  '42501', null, 'english_messages: A cannot INSERT into B session'
);

select is(
  (with upd as (
     update english_messages set content = 'hacked'
     where session_id in (select id from english_sessions where user_id = :'user_b'::uuid)
     returning 1
   ) select count(*)::int from upd),
  0, 'english_messages: A cannot UPDATE B messages'
);

select is(
  (with del as (
     delete from english_messages
     where session_id in (select id from english_sessions where user_id = :'user_b'::uuid)
     returning 1
   ) select count(*)::int from del),
  0, 'english_messages: A cannot DELETE B messages'
);

select finish();
rollback;

-- =====================================================================
-- english_mistakes
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into english_mistakes (user_id, original, correction) values
  (:'user_a'::uuid, 'I has', 'I have'),
  (:'user_b'::uuid, 'he go',  'he goes');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from english_mistakes where user_id = :'user_b'::uuid),
  0, 'english_mistakes: A cannot SELECT B'
);
select throws_ok(
  $$ insert into english_mistakes (user_id, original, correction) values ('22222222-2222-2222-2222-222222222222','x','y') $$,
  '42501', null, 'english_mistakes: A cannot INSERT as B'
);
select is(
  (with upd as (update english_mistakes set correction = 'hacked' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'english_mistakes: A cannot UPDATE B'
);
select is(
  (with del as (delete from english_mistakes where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'english_mistakes: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- placement_results
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into placement_results (user_id, level) values
  (:'user_a'::uuid, 'B1'),
  (:'user_b'::uuid, 'B2');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from placement_results where user_id = :'user_b'::uuid),
  0, 'placement_results: A cannot SELECT B'
);
select throws_ok(
  $$ insert into placement_results (user_id, level) values ('22222222-2222-2222-2222-222222222222','C1') $$,
  '42501', null, 'placement_results: A cannot INSERT as B'
);
select is(
  (with upd as (update placement_results set level = 'A1' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'placement_results: A cannot UPDATE B'
);
select is(
  (with del as (delete from placement_results where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'placement_results: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- skills
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into skills (user_id, slug, name) values
  (:'user_a'::uuid, 'english', 'English'),
  (:'user_b'::uuid, 'english', 'English');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from skills where user_id = :'user_b'::uuid),
  0, 'skills: A cannot SELECT B'
);
select throws_ok(
  $$ insert into skills (user_id, slug, name) values ('22222222-2222-2222-2222-222222222222','spoof','X') $$,
  '42501', null, 'skills: A cannot INSERT as B'
);
select is(
  (with upd as (update skills set name = 'hacked' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'skills: A cannot UPDATE B'
);
select is(
  (with del as (delete from skills where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'skills: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- skill_nodes (via parent skill)
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;

with sa as (insert into skills (user_id, slug, name) values (:'user_a'::uuid, 'english','English') returning id),
     sb as (insert into skills (user_id, slug, name) values (:'user_b'::uuid, 'english','English') returning id)
insert into skill_nodes (skill_id, title)
select id, 'a-root' from sa
union all
select id, 'b-root' from sb;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from skill_nodes n
     join skills s on s.id = n.skill_id
     where s.user_id = :'user_b'::uuid),
  0, 'skill_nodes: A cannot SELECT B nodes'
);
select throws_ok(
  $$
    insert into skill_nodes (skill_id, title)
    select id, 'spoof' from skills where user_id = '22222222-2222-2222-2222-222222222222'
  $$,
  '42501', null, 'skill_nodes: A cannot INSERT into B skill'
);
select is(
  (with upd as (
     update skill_nodes set title = 'hacked'
     where skill_id in (select id from skills where user_id = :'user_b'::uuid)
     returning 1
   ) select count(*)::int from upd),
  0, 'skill_nodes: A cannot UPDATE B nodes'
);
select is(
  (with del as (
     delete from skill_nodes
     where skill_id in (select id from skills where user_id = :'user_b'::uuid)
     returning 1
   ) select count(*)::int from del),
  0, 'skill_nodes: A cannot DELETE B nodes'
);

select finish();
rollback;

-- =====================================================================
-- skill_lessons (direct user_id)
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;

with sa as (insert into skills (user_id, slug, name) values (:'user_a'::uuid,'english','E') returning id),
     sb as (insert into skills (user_id, slug, name) values (:'user_b'::uuid,'english','E') returning id),
     na as (insert into skill_nodes (skill_id, title) select id,'n' from sa returning id, 'a' as owner),
     nb as (insert into skill_nodes (skill_id, title) select id,'n' from sb returning id, 'b' as owner)
insert into skill_lessons (node_id, user_id, title)
select id, :'user_a'::uuid, 'la' from na
union all
select id, :'user_b'::uuid, 'lb' from nb;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from skill_lessons where user_id = :'user_b'::uuid),
  0, 'skill_lessons: A cannot SELECT B'
);
select throws_ok(
  $$ insert into skill_lessons (node_id, user_id, title)
     select id, '22222222-2222-2222-2222-222222222222', 'spoof' from skill_nodes limit 1 $$,
  '42501', null, 'skill_lessons: A cannot INSERT as B'
);
select is(
  (with upd as (update skill_lessons set title = 'hacked' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'skill_lessons: A cannot UPDATE B'
);
select is(
  (with del as (delete from skill_lessons where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'skill_lessons: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- lesson_progress
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;

with sa as (insert into skills (user_id, slug, name) values (:'user_a'::uuid,'e','E') returning id),
     sb as (insert into skills (user_id, slug, name) values (:'user_b'::uuid,'e','E') returning id),
     na as (insert into skill_nodes (skill_id, title) select id,'n' from sa returning id),
     nb as (insert into skill_nodes (skill_id, title) select id,'n' from sb returning id),
     la as (insert into skill_lessons (node_id, user_id, title) select id, :'user_a'::uuid, 'l' from na returning id),
     lb as (insert into skill_lessons (node_id, user_id, title) select id, :'user_b'::uuid, 'l' from nb returning id)
insert into lesson_progress (user_id, lesson_id)
select :'user_a'::uuid, id from la
union all
select :'user_b'::uuid, id from lb;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from lesson_progress where user_id = :'user_b'::uuid),
  0, 'lesson_progress: A cannot SELECT B'
);
select throws_ok(
  $$ insert into lesson_progress (user_id, lesson_id)
     select '22222222-2222-2222-2222-222222222222', id from skill_lessons limit 1 $$,
  '42501', null, 'lesson_progress: A cannot INSERT as B'
);
select is(
  (with upd as (update lesson_progress set notes = 'hacked' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'lesson_progress: A cannot UPDATE B'
);
select is(
  (with del as (delete from lesson_progress where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'lesson_progress: A cannot DELETE B'
);

select finish();
rollback;

-- =====================================================================
-- journal_entries
-- =====================================================================
begin;
select plan(4);

insert into auth.users (id) values (:'user_a'::uuid), (:'user_b'::uuid) on conflict do nothing;
insert into journal_entries (user_id, title, content_md) values
  (:'user_a'::uuid, 'A diary', 'a-body'),
  (:'user_b'::uuid, 'B diary', 'b-body');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from journal_entries where user_id = :'user_b'::uuid),
  0, 'journal_entries: A cannot SELECT B'
);
select throws_ok(
  $$ insert into journal_entries (user_id, content_md) values ('22222222-2222-2222-2222-222222222222','spoof') $$,
  '42501', null, 'journal_entries: A cannot INSERT as B'
);
select is(
  (with upd as (update journal_entries set title = 'hacked' where user_id = :'user_b'::uuid returning 1) select count(*)::int from upd),
  0, 'journal_entries: A cannot UPDATE B'
);
select is(
  (with del as (delete from journal_entries where user_id = :'user_b'::uuid returning 1) select count(*)::int from del),
  0, 'journal_entries: A cannot DELETE B'
);

select finish();
rollback;
