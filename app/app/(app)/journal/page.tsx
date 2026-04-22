"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { TopBar } from "@/components/shell/TopBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntryRow } from "@/components/journal/EntryRow";
import { groupEntries, listEntries, searchEntries } from "@/lib/domains/journal/store";
import { seedJournalOnce } from "@/lib/domains/journal/seed-once";
import type { JournalEntry } from "@/lib/domains/journal/types";

export default function JournalPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Seed + load on first client mount
  React.useEffect(() => {
    seedJournalOnce();
    setEntries(listEntries());
    setReady(true);
  }, []);

  // Debounce search input (200ms)
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const filtered = React.useMemo(() => {
    if (!ready) return [];
    if (!debouncedQuery.trim()) return entries;
    return searchEntries(debouncedQuery);
  }, [ready, entries, debouncedQuery]);

  const groups = React.useMemo(() => groupEntries(filtered), [filtered]);
  const isEmpty = ready && entries.length === 0;
  const isFilteredEmpty = ready && !isEmpty && filtered.length === 0;

  return (
    <>
      <TopBar breadcrumb={[{ label: "Дневник", active: true }]} />
      <div className="px-4 md:px-6 py-6 max-w-[920px] mx-auto">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-[420px]">
            <Search
              size={13}
              strokeWidth={1.9}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--subtle)" }}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по записям"
              className="pl-8 text-[16px] md:text-[13px]"
              aria-label="Поиск по записям"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/journal/new")}
            className="ml-auto"
          >
            <Plus size={14} strokeWidth={1.9} />
            Новая запись
          </Button>
        </div>

        {/* Content */}
        {!ready ? (
          <div className="text-[13px]" style={{ color: "var(--muted)" }}>
            Загрузка…
          </div>
        ) : isEmpty ? (
          <EmptyState onCreate={() => router.push("/journal/new")} />
        ) : isFilteredEmpty ? (
          <div className="card px-5 py-10 text-center">
            <p
              className="serif-italic text-[20px]"
              style={{ color: "var(--muted)" }}
            >
              Ничего не <em>нашлось</em>
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--subtle)" }}>
              Попробуй другое слово или очисти поиск.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <section key={group.label} className="flex flex-col gap-2">
                <h2
                  className="mono text-[11px] uppercase tracking-wider"
                  style={{ color: "var(--subtle)" }}
                >
                  {group.label}
                </h2>
                <div className="flex flex-col gap-2">
                  {group.entries.map((entry) => (
                    <EntryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card px-4 md:px-6 py-10 md:py-14 flex flex-col items-center text-center gap-4">
      <p className="serif-italic text-[22px] md:text-[34px] leading-tight">
        Пустой <em>дневник</em>
      </p>
      <p
        className="text-[13.5px] max-w-[420px]"
        style={{ color: "var(--muted)" }}
      >
        Первая запись — самая трудная. Начни с чего угодно: мысль, план на день, или просто «так»_.
      </p>
      <Button variant="primary" onClick={onCreate}>
        <Plus size={14} strokeWidth={1.9} />
        Создать первую запись
      </Button>
      <span className="mono text-[11px]" style={{ color: "var(--subtle)" }}>
        <Link href="/journal/new" className="underline-offset-2 hover:underline">
          /journal/new
        </Link>
      </span>
    </div>
  );
}
