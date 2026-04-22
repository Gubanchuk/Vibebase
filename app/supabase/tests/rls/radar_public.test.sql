-- =====================================================================
-- radar_public.test.sql
-- pg_tap tests for radar_items / radar_tags / radar_item_tags:
--   - any authenticated user can SELECT
--   - no authenticated user can INSERT / UPDATE / DELETE
-- (Writes are intended for service role only, which bypasses RLS.)
-- =====================================================================

create extension if not exists pgtap;

\set user_a '11111111-1111-1111-1111-111111111111'

-- =====================================================================
-- radar_items
-- =====================================================================
begin;
select plan(4);

insert into radar_items (url, source, title) values
  ('https://example.com/a', 'claude-code', 'A'),
  ('https://example.com/b', 'agents-lab',  'B');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select cmp_ok(
  (select count(*)::int from radar_items),
  '>=', 2,
  'radar_items: authenticated user CAN SELECT all rows'
);

select throws_ok(
  $$ insert into radar_items (url, source, title) values ('https://example.com/c','x','C') $$,
  '42501', null, 'radar_items: authenticated cannot INSERT'
);
select throws_ok(
  $$ update radar_items set title = 'hacked' $$,
  '42501', null, 'radar_items: authenticated cannot UPDATE'
);
select throws_ok(
  $$ delete from radar_items $$,
  '42501', null, 'radar_items: authenticated cannot DELETE'
);

select finish();
rollback;

-- =====================================================================
-- radar_tags
-- =====================================================================
begin;
select plan(4);

insert into radar_tags (slug, name) values
  ('claude-code', 'Claude Code'),
  ('agents',      'Agents');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select cmp_ok(
  (select count(*)::int from radar_tags),
  '>=', 2,
  'radar_tags: authenticated user CAN SELECT all rows'
);

select throws_ok(
  $$ insert into radar_tags (slug, name) values ('mcp','MCP') $$,
  '42501', null, 'radar_tags: authenticated cannot INSERT'
);
select throws_ok(
  $$ update radar_tags set name = 'hacked' $$,
  '42501', null, 'radar_tags: authenticated cannot UPDATE'
);
select throws_ok(
  $$ delete from radar_tags $$,
  '42501', null, 'radar_tags: authenticated cannot DELETE'
);

select finish();
rollback;

-- =====================================================================
-- radar_item_tags
-- =====================================================================
begin;
select plan(4);

with it as (insert into radar_items (url, source, title) values ('https://example.com/z','src','Z') returning id),
     tg as (insert into radar_tags  (slug, name)          values ('z','Z') returning id)
insert into radar_item_tags (item_id, tag_id)
select it.id, tg.id from it, tg;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select cmp_ok(
  (select count(*)::int from radar_item_tags),
  '>=', 1,
  'radar_item_tags: authenticated user CAN SELECT'
);

select throws_ok(
  $$
    insert into radar_item_tags (item_id, tag_id)
    select ri.id, rt.id from radar_items ri, radar_tags rt limit 1
  $$,
  '42501', null, 'radar_item_tags: authenticated cannot INSERT'
);
select throws_ok(
  $$ update radar_item_tags set tag_id = tag_id $$,
  '42501', null, 'radar_item_tags: authenticated cannot UPDATE'
);
select throws_ok(
  $$ delete from radar_item_tags $$,
  '42501', null, 'radar_item_tags: authenticated cannot DELETE'
);

select finish();
rollback;
