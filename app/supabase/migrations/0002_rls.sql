-- =====================================================================
-- 0002_rls.sql
-- Row level security: strict per-owner on user tables;
-- global read for radar; service-role-only for radar writes + sync runs.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------
alter table user_profiles       enable row level security;
alter table budget_config       enable row level security;
alter table ai_usage_log        enable row level security;
alter table english_sessions    enable row level security;
alter table english_messages    enable row level security;
alter table english_mistakes    enable row level security;
alter table placement_results   enable row level security;
alter table skills              enable row level security;
alter table skill_nodes         enable row level security;
alter table skill_lessons       enable row level security;
alter table lesson_progress     enable row level security;
alter table journal_entries     enable row level security;
alter table radar_items         enable row level security;
alter table radar_tags          enable row level security;
alter table radar_item_tags     enable row level security;
alter table radar_sync_runs     enable row level security;

-- ---------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------
create policy owner_select_user_profiles on user_profiles
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_user_profiles on user_profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_user_profiles on user_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_user_profiles on user_profiles
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- budget_config
-- ---------------------------------------------------------------------
create policy owner_select_budget_config on budget_config
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_budget_config on budget_config
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_budget_config on budget_config
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_budget_config on budget_config
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- ai_usage_log
-- ---------------------------------------------------------------------
create policy owner_select_ai_usage_log on ai_usage_log
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_ai_usage_log on ai_usage_log
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_ai_usage_log on ai_usage_log
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_ai_usage_log on ai_usage_log
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- english_sessions
-- ---------------------------------------------------------------------
create policy owner_select_english_sessions on english_sessions
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_english_sessions on english_sessions
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_english_sessions on english_sessions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_english_sessions on english_sessions
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- english_messages (ownership via parent session)
-- ---------------------------------------------------------------------
create policy owner_select_english_messages on english_messages
  for select to authenticated
  using ((select user_id from english_sessions where id = english_messages.session_id) = auth.uid());

create policy owner_insert_english_messages on english_messages
  for insert to authenticated
  with check ((select user_id from english_sessions where id = english_messages.session_id) = auth.uid());

create policy owner_update_english_messages on english_messages
  for update to authenticated
  using ((select user_id from english_sessions where id = english_messages.session_id) = auth.uid())
  with check ((select user_id from english_sessions where id = english_messages.session_id) = auth.uid());

create policy owner_delete_english_messages on english_messages
  for delete to authenticated
  using ((select user_id from english_sessions where id = english_messages.session_id) = auth.uid());

-- ---------------------------------------------------------------------
-- english_mistakes (direct user_id + cross-check session ownership on insert)
-- ---------------------------------------------------------------------
create policy owner_select_english_mistakes on english_mistakes
  for select to authenticated using (user_id = auth.uid());

create policy owner_insert_english_mistakes on english_mistakes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      session_id is null
      or (select user_id from english_sessions where id = english_mistakes.session_id) = auth.uid()
    )
  );

create policy owner_update_english_mistakes on english_mistakes
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy owner_delete_english_mistakes on english_mistakes
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- placement_results
-- ---------------------------------------------------------------------
create policy owner_select_placement_results on placement_results
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_placement_results on placement_results
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_placement_results on placement_results
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_placement_results on placement_results
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------
create policy owner_select_skills on skills
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_skills on skills
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_skills on skills
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_skills on skills
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- skill_nodes (ownership via parent skill)
-- ---------------------------------------------------------------------
create policy owner_select_skill_nodes on skill_nodes
  for select to authenticated
  using ((select user_id from skills where id = skill_nodes.skill_id) = auth.uid());

create policy owner_insert_skill_nodes on skill_nodes
  for insert to authenticated
  with check ((select user_id from skills where id = skill_nodes.skill_id) = auth.uid());

create policy owner_update_skill_nodes on skill_nodes
  for update to authenticated
  using ((select user_id from skills where id = skill_nodes.skill_id) = auth.uid())
  with check ((select user_id from skills where id = skill_nodes.skill_id) = auth.uid());

create policy owner_delete_skill_nodes on skill_nodes
  for delete to authenticated
  using ((select user_id from skills where id = skill_nodes.skill_id) = auth.uid());

-- ---------------------------------------------------------------------
-- skill_lessons (direct user_id — lessons are per-user cache rows)
-- ---------------------------------------------------------------------
create policy owner_select_skill_lessons on skill_lessons
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_skill_lessons on skill_lessons
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_skill_lessons on skill_lessons
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_skill_lessons on skill_lessons
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------
create policy owner_select_lesson_progress on lesson_progress
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_lesson_progress on lesson_progress
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_lesson_progress on lesson_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_lesson_progress on lesson_progress
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------
create policy owner_select_journal_entries on journal_entries
  for select to authenticated using (user_id = auth.uid());
create policy owner_insert_journal_entries on journal_entries
  for insert to authenticated with check (user_id = auth.uid());
create policy owner_update_journal_entries on journal_entries
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_delete_journal_entries on journal_entries
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- radar_* read-only for authenticated users.
-- Writes happen only via service role, which bypasses RLS; we deliberately
-- do NOT create insert/update/delete policies here.
-- ---------------------------------------------------------------------
create policy read_all_radar_items on radar_items
  for select to authenticated using (true);

create policy read_all_radar_tags on radar_tags
  for select to authenticated using (true);

create policy read_all_radar_item_tags on radar_item_tags
  for select to authenticated using (true);

-- radar_sync_runs: no policies at all -> service role only.
