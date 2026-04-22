"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/infra/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shell/Logo";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = getSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <Logo size={40} />
          <div className="text-[17px] font-semibold tracking-tight">Прокачка</div>
        </div>

        <h1 className="text-[26px] font-bold tracking-tight leading-tight mb-1">
          <span className="serif-italic text-[28px]" style={{ color: "var(--amber)" }}>
            Добро
          </span>{" "}
          пожаловать
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Логин по email и паролю. Сессия хранится в cookie.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span
              className="text-[10.5px] mono uppercase tracking-wider"
              style={{ color: "var(--subtle)" }}
            >
              Email
            </span>
            <Input
              type="email"
              value={email}
              required
              autoComplete="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </label>

          <label className="block">
            <span
              className="text-[10.5px] mono uppercase tracking-wider"
              style={{ color: "var(--subtle)" }}
            >
              Пароль
            </span>
            <Input
              type="password"
              value={password}
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </label>

          {error ? (
            <div
              className="text-[12.5px] p-2.5 rounded-md border"
              style={{
                color: "var(--danger)",
                borderColor: "rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.08)",
              }}
            >
              {error}
            </div>
          ) : null}

          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={submitting}>
            {submitting ? "Вхожу…" : "Войти"}
          </Button>
        </form>

      </div>
    </div>
  );
}
