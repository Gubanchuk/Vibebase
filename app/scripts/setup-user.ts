#!/usr/bin/env tsx
/**
 * Creates or resets the primary user account via Supabase admin API.
 * Run: `npx tsx scripts/setup-user.ts`
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local. Does not require the DB password.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const EMAIL = "An.guban79@gmail.com";
  const PASSWORD = "Admin1488";
  const DISPLAY_NAME = "Андрей";

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`→ Setting up user ${EMAIL}`);

  // Try to find existing user by email.
  const { data: listed, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    console.error("✗ Could not list users:", listErr.message);
    process.exit(1);
  }

  const existing = listed.users.find(
    (u) => u.email?.toLowerCase() === EMAIL.toLowerCase()
  );

  let userId: string;

  if (existing) {
    console.log(`  user already exists (id=${existing.id}); resetting password…`);
    const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: DISPLAY_NAME },
    });
    if (updateErr) {
      console.error("✗ Could not update user:", updateErr.message);
      process.exit(1);
    }
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: DISPLAY_NAME },
    });
    if (createErr || !created.user) {
      console.error("✗ Could not create user:", createErr?.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`  created user id=${userId}`);
  }

  // Seed user_profiles + budget_config idempotently.
  // english_level намеренно НЕ выставляется — его определит placement-тест,
  // который юзер пройдёт на сайте. Пересдача перезапишет значение.
  const { error: profileErr } = await admin.from("user_profiles").upsert({
    user_id: userId,
    display_name: DISPLAY_NAME,
    timezone: "Europe/Moscow",
  });
  if (profileErr) {
    console.warn("  ! user_profiles upsert failed:", profileErr.message);
    console.warn("    (если таблица ещё не создана — запусти миграцию в SQL Editor)");
  } else {
    console.log("  ✓ user_profiles seeded");
  }

  const { error: budgetErr } = await admin.from("budget_config").upsert({
    user_id: userId,
    daily_cost_cap_usd: 2.0,
    monthly_cost_cap_usd: 30.0,
    per_call_max_tokens_out: 2048,
  });
  if (budgetErr) {
    console.warn("  ! budget_config upsert failed:", budgetErr.message);
  } else {
    console.log("  ✓ budget_config seeded");
  }

  console.log("\n✓ Done.");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  User ID:  ${userId}`);
  console.log(`\n  Зайди на http://localhost:3000/sign-in и логинься.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
