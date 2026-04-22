-- =====================================================================
-- seed.sql
-- Idempotent local-dev seed. Run AFTER `supabase db push`.
-- Safe to run multiple times: every insert uses `on conflict do nothing`.
-- =====================================================================

-- Hardcoded dev user uuid. Matches a user you must also create in auth
-- (e.g. via `supabase auth signup` or the Studio UI) with this same id.
-- If the user does not exist in auth.users, we still try to insert a
-- placeholder row so downstream seeds work under local dev service role.
-- =====================================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-0000000000aa';
  v_skill_id uuid;
begin
  -- Ensure auth.users row exists (best effort; service role only).
  begin
    insert into auth.users (id, email)
    values (v_user_id, 'dev@local.test')
    on conflict (id) do nothing;
  exception when others then
    -- auth.users may be managed and reject direct inserts; ignore.
    null;
  end;

  -- User profile.
  insert into user_profiles (user_id, display_name, english_level, timezone)
  values (v_user_id, 'Dev User', 'B1', 'Europe/Moscow')
  on conflict (user_id) do nothing;

  -- Budget config.
  insert into budget_config (user_id, daily_cost_cap_usd, monthly_cost_cap_usd, per_call_max_tokens_out)
  values (v_user_id, 2.00, 30.00, 2048)
  on conflict (user_id) do nothing;

  -- Seed skill "Learning English" with 5 nodes.
  insert into skills (user_id, slug, name, description, target_level, emoji)
  values (
    v_user_id,
    'learning-english',
    'Learning English',
    'Foundational English roadmap covering grammar, vocabulary, listening, speaking and writing.',
    'B2',
    E'\U0001F1EC\U0001F1E7'
  )
  on conflict (user_id, slug) do nothing;

  select id into v_skill_id
  from skills
  where user_id = v_user_id and slug = 'learning-english';

  if v_skill_id is not null then
    insert into skill_nodes (skill_id, title, description, sort_order)
    select v_skill_id, t.title, t.description, t.sort_order
    from (values
      ('Grammar foundations', 'Tenses, articles, conditionals, modals.',       10),
      ('Core vocabulary',     'High-frequency words and collocations.',        20),
      ('Listening',           'Podcasts, interviews, natural speech tempo.',   30),
      ('Speaking',            'Free-talk, pronunciation, fluency drills.',     40),
      ('Writing',             'Emails, short essays, journaling in English.',  50)
    ) as t(title, description, sort_order)
    where not exists (
      select 1 from skill_nodes n
      where n.skill_id = v_skill_id and n.title = t.title
    );
  end if;
end $$;

-- Radar seed tags (global; service role by default in dev).
insert into radar_tags (slug, name) values
  ('claude-code', 'Claude Code'),
  ('agents',      'Agents'),
  ('mcp',         'MCP')
on conflict (slug) do nothing;
