import { z } from "zod";

/**
 * Boot-time env validation. During MVP (pre-Supabase/Gateway wiring) every
 * production key is optional with a visible `MOCK` fallback so the app can
 * render and run with only in-memory data. When the user adds real secrets
 * tomorrow, Zod will start enforcing shape.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Supabase — optional for MVP, required once DB wired
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // OpenAI — primary LLM provider
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL_DEFAULT: z.string().default("gpt-5.4"),
  OPENAI_MODEL_CHEAP: z.string().default("gpt-5.4-mini"),

  // AI Gateway (optional second provider) — keep slots for later
  AI_GATEWAY_API_KEY: z.string().min(1).optional(),
  AI_GATEWAY_BASE_URL: z.string().url().optional(),

  // Feature flags (always optional)
  ENABLE_MISTAKE_TRACKING: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  // Script-only
  CRON_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

function readEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid env:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}

export const env = readEnv();

export const isMockMode =
  !env.NEXT_PUBLIC_SUPABASE_URL ||
  !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !env.OPENAI_API_KEY;
