"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { RadarItemView } from "@/lib/domains/radar/types";
import { allKnownSources } from "@/lib/domains/radar/types";
import { RadarItemCard } from "./RadarItemCard";
import { FilterBar, type SortMode } from "./FilterBar";
import { EmptyCli } from "./EmptyCli";

const RELEVANCE_WEIGHT: Record<string, number> = {
  strong: 3,
  moderate: 2,
  weak: 1,
};

const DEBOUNCE_MS = 120;

function parseSet(raw: string | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export function RadarFeed({ items }: { items: RadarItemView[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  // ---- Initialize state from URL ----
  const initialTags = useMemo(
    () => parseSet(searchParams.get("tags")),
    // Only on mount — subsequent URL syncs are driven by our own writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const initialSources = useMemo(
    () => parseSet(searchParams.get("src")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const initialSort = useMemo<SortMode>(() => {
    const raw = searchParams.get("sort");
    return raw === "relevance" ? "relevance" : "recent";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTags, setActiveTags] = useState<Set<string>>(initialTags);
  const [activeSources, setActiveSources] =
    useState<Set<string>>(initialSources);
  const [sort, setSort] = useState<SortMode>(initialSort);

  // ---- URL sync (debounced) ----
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (activeTags.size > 0) {
        params.set("tags", Array.from(activeTags).join(","));
      }
      if (activeSources.size > 0) {
        params.set("src", Array.from(activeSources).join(","));
      }
      if (sort !== "recent") {
        params.set("sort", sort);
      }
      const qs = params.toString();
      const next = qs ? `/radar?${qs}` : `/radar`;
      router.replace(next, { scroll: false });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeTags, activeSources, sort, router]);

  // ---- Derived: tag universe + source universe ----
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) for (const t of it.tags) set.add(t);
    return Array.from(set).sort();
  }, [items]);

  const allSources = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.source);
    // Preserve registry ordering where possible, then append unknowns.
    const registryOrder = allKnownSources().map((s) => s.slug);
    const ordered = registryOrder.filter((s) => set.has(s));
    for (const s of set) if (!ordered.includes(s)) ordered.push(s);
    return ordered;
  }, [items]);

  // ---- Filter + sort ----
  const filtered = useMemo(() => {
    let out = items;
    if (activeTags.size > 0) {
      out = out.filter((it) => it.tags.some((t) => activeTags.has(t)));
    }
    if (activeSources.size > 0) {
      out = out.filter((it) => activeSources.has(it.source));
    }
    if (sort === "recent") {
      out = [...out].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      );
    } else {
      out = [...out].sort((a, b) => {
        const rw =
          (RELEVANCE_WEIGHT[b.relevance] ?? 0) -
          (RELEVANCE_WEIGHT[a.relevance] ?? 0);
        if (rw !== 0) return rw;
        return (
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
        );
      });
    }
    return out;
  }, [items, activeTags, activeSources, sort]);

  // ---- Counts for filter bar ----
  const counts = useMemo(() => {
    const byTag: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const it of items) {
      for (const t of it.tags) byTag[t] = (byTag[t] ?? 0) + 1;
      bySource[it.source] = (bySource[it.source] ?? 0) + 1;
    }
    return {
      total: items.length,
      filtered: filtered.length,
      byTag,
      bySource,
    };
  }, [items, filtered]);

  // ---- Handlers ----
  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return setsEqual(next, prev) ? prev : next;
    });
  }
  function toggleSource(src: string) {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return setsEqual(next, prev) ? prev : next;
    });
  }
  function reset() {
    setActiveTags(new Set());
    setActiveSources(new Set());
    setSort("recent");
  }

  // ---- Motion config ----
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex flex-col gap-5">
      <FilterBar
        allTags={allTags}
        allSources={allSources}
        activeTags={activeTags}
        activeSources={activeSources}
        sort={sort}
        onToggleTag={toggleTag}
        onToggleSource={toggleSource}
        onSort={setSort}
        onReset={reset}
        counts={counts}
      />

      {filtered.length === 0 ? (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          <EmptyCli />
        </motion.div>
      ) : (
        <motion.div
          layout={!reducedMotion}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout={!reducedMotion}
                initial={
                  reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6, scale: 0.98 }
                }
                transition={transition}
              >
                <RadarItemCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
