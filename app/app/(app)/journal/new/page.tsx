"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { upsertEntry } from "@/lib/domains/journal/store";
import { seedJournalOnce } from "@/lib/domains/journal/seed-once";
import { DAILY_REFLECTION, resolveTemplateBody } from "@/lib/domains/journal/templates";
import type { JournalEntry } from "@/lib/domains/journal/types";

export default function NewJournalPage() {
  const router = useRouter();
  const createdRef = React.useRef(false);

  React.useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    // Ensure seed has run at least once in this browser.
    seedJournalOnce();

    const now = new Date().toISOString();
    const id = makeId();
    const draft: JournalEntry = {
      id,
      title: "",
      contentMd: resolveTemplateBody(DAILY_REFLECTION),
      templatesUsed: ["daily-reflection"],
      backlinks: [],
      createdAt: now,
      updatedAt: now,
    };
    upsertEntry(draft);
    // Land in preview mode — user sees the rendered template nicely first.
    // When they want to fill it in, they click "Edit" in the toolbar.
    router.replace(`/journal/${id}`);
  }, [router]);

  return (
    <div className="px-4 md:px-6 py-10 text-[13px]" style={{ color: "var(--muted)" }}>
      Создаём черновик…
    </div>
  );
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
