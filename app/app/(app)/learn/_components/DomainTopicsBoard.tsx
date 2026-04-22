"use client";

import * as React from "react";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  LearningDomain,
  TopicWithUserState,
} from "@/lib/domains/learning/types";
import {
  matchesLevel,
  pickNextStep,
  STAGE_ORDER,
} from "@/lib/domains/learning/roadmap";
import { NextStepCard } from "./NextStepCard";
import { StageSection } from "./StageSection";
import { TopicCard } from "./TopicCard";
import {
  TopicFilterTabs,
  type TabKey,
  type TabCount,
} from "./TopicFilterTabs";
import { TopicRoadmapTree } from "./TopicRoadmapTree";

type ViewMode = "tree" | "cards";

export function DomainTopicsBoard({
  domain,
  accent,
  topics,
  userLevel,
}: {
  domain: LearningDomain;
  accent: "coral" | "violet";
  topics: TopicWithUserState[];
  userLevel: string | null;
}) {
  const storageKeyTab = `learn.tab.${domain}`;
  const storageKeyView = `learn.view.${domain}`;
  const [tab, setTab] = React.useState<TabKey>("all");
  const [view, setView] = React.useState<ViewMode>("tree");

  React.useEffect(() => {
    try {
      const rawTab = window.localStorage.getItem(storageKeyTab);
      if (rawTab && isTabKey(rawTab)) setTab(rawTab);
      const rawView = window.localStorage.getItem(storageKeyView);
      if (rawView === "tree" || rawView === "cards") setView(rawView);
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(storageKeyTab, tab);
    } catch {
      /* noop */
    }
  }, [tab, storageKeyTab]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(storageKeyView, view);
    } catch {
      /* noop */
    }
  }, [view, storageKeyView]);

  const topicsBySlug = React.useMemo(
    () => new Map(topics.map((t) => [t.slug, t])),
    [topics]
  );

  const counts: TabCount = React.useMemo(() => {
    return {
      all: topics.length,
      bookmarked: topics.filter((t) => t.annotation?.isBookmarked).length,
      notes: topics.filter(
        (t) => (t.annotation?.personalNotes ?? "").length > 0
      ).length,
      level: topics.filter((t) => matchesLevel(t, userLevel, domain)).length,
      mastered: topics.filter((t) => t.mastery?.masteredAt).length,
    };
  }, [topics, userLevel, domain]);

  const nextStep = React.useMemo(() => pickNextStep(topics), [topics]);

  const filtered = React.useMemo(() => {
    switch (tab) {
      case "bookmarked":
        return topics.filter((t) => t.annotation?.isBookmarked);
      case "notes":
        return topics.filter(
          (t) => (t.annotation?.personalNotes ?? "").length > 0
        );
      case "level":
        return topics.filter((t) => matchesLevel(t, userLevel, domain));
      case "mastered":
        return topics.filter((t) => t.mastery?.masteredAt);
      default:
        return topics;
    }
  }, [tab, topics, userLevel, domain]);

  const showNextStep = tab !== "mastered" && nextStep !== null;

  // Tree view — только в табе "all" (компактный tree не режем по фильтру);
  // если фильтр активен и выбран tree — показываем плоское дерево без стейджей.
  const isFiltered = tab !== "all";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <TopicFilterTabs
          active={tab}
          onChange={setTab}
          counts={counts}
          userLevel={userLevel}
          showLevelTab={Boolean(userLevel)}
          className="flex-1 min-w-0"
        />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {showNextStep && nextStep ? (
        <NextStepCard domain={domain} topic={nextStep} accent={accent} />
      ) : null}

      {filtered.length === 0 ? (
        <div
          className="card p-5 text-center text-[13px]"
          style={{ color: "var(--muted)", borderStyle: "dashed" }}
        >
          {emptyMessage(tab)}
        </div>
      ) : view === "tree" ? (
        isFiltered ? (
          <FlatTree
            topics={filtered}
            domain={domain}
            accent={accent}
          />
        ) : (
          <TopicRoadmapTree
            domain={domain}
            topics={filtered}
            accent={accent}
          />
        )
      ) : isFiltered ? (
        <FlatCardGrid
          topics={filtered}
          domain={domain}
          topicsBySlug={topicsBySlug}
        />
      ) : (
        <StageCardGrid
          topics={filtered}
          domain={domain}
          topicsBySlug={topicsBySlug}
        />
      )}
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Вид"
      className="inline-flex items-center p-0.5 rounded-md border"
      style={{
        borderColor: "var(--border-2)",
        background: "var(--surface)",
      }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "tree"}
        onClick={() => onChange("tree")}
        title="Дерево (компактный список)"
        className={cn(
          "inline-flex items-center gap-1 px-2 h-7 min-h-[28px] rounded text-[11px] mono transition",
          view === "tree"
            ? "bg-[color:var(--surface-3)] text-[color:var(--content)]"
            : "text-[color:var(--subtle)] hover:text-[color:var(--content)]"
        )}
      >
        <List size={11} strokeWidth={2} />
        <span className="hidden sm:inline">дерево</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "cards"}
        onClick={() => onChange("cards")}
        title="Карточки (с деталями)"
        className={cn(
          "inline-flex items-center gap-1 px-2 h-7 min-h-[28px] rounded text-[11px] mono transition",
          view === "cards"
            ? "bg-[color:var(--surface-3)] text-[color:var(--content)]"
            : "text-[color:var(--subtle)] hover:text-[color:var(--content)]"
        )}
      >
        <LayoutGrid size={11} strokeWidth={2} />
        <span className="hidden sm:inline">карточки</span>
      </button>
    </div>
  );
}

function FlatTree({
  topics,
  domain,
  accent,
}: {
  topics: TopicWithUserState[];
  domain: LearningDomain;
  accent: "coral" | "violet";
}) {
  // Просто переиспользуем TopicRoadmapTree, но со всеми темами в одной
  // «виртуальной» группе. Для простоты — рендерим как отдельную карточку
  // без стейджей, передавая все темы сразу.
  return (
    <TopicRoadmapTree domain={domain} topics={topics} accent={accent} />
  );
}

function StageCardGrid({
  topics,
  domain,
  topicsBySlug,
}: {
  topics: TopicWithUserState[];
  domain: LearningDomain;
  topicsBySlug: ReadonlyMap<string, TopicWithUserState>;
}) {
  const byStage = new Map<string, TopicWithUserState[]>();
  for (const stage of STAGE_ORDER) byStage.set(stage, []);
  for (const t of topics) byStage.get(t.stage)!.push(t);

  const startIndexes = new Map<string, number>();
  let idx = 0;
  for (const stage of STAGE_ORDER) {
    startIndexes.set(stage, idx);
    idx += byStage.get(stage)!.length;
  }

  return (
    <>
      {STAGE_ORDER.map((stage) => {
        const stageTopics = byStage.get(stage)!;
        if (stageTopics.length === 0) return null;
        return (
          <StageSection
            key={stage}
            stage={stage}
            domain={domain}
            topics={stageTopics}
            topicsBySlug={topicsBySlug}
            startIndex={startIndexes.get(stage) ?? 0}
            defaultOpen={stage !== "optional"}
          />
        );
      })}
    </>
  );
}

function FlatCardGrid({
  topics,
  domain,
  topicsBySlug,
}: {
  topics: TopicWithUserState[];
  domain: LearningDomain;
  topicsBySlug: ReadonlyMap<string, TopicWithUserState>;
}) {
  return (
    <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mt-3">
      {topics.map((t, i) => (
        <TopicCard
          key={t.id}
          domain={domain}
          topic={t}
          index={i}
          topicsBySlug={topicsBySlug}
        />
      ))}
    </div>
  );
}

function isTabKey(v: string): v is TabKey {
  return (
    v === "all" ||
    v === "bookmarked" ||
    v === "notes" ||
    v === "level" ||
    v === "mastered"
  );
}

function emptyMessage(tab: TabKey): string {
  switch (tab) {
    case "bookmarked":
      return "В избранном пока пусто. Нажми 🔖 на теме — сохранится сюда.";
    case "notes":
      return "Заметок ещё нет. На карточке темы есть кнопка «заметка» — пиши туда всё что важно.";
    case "level":
      return "Под твой уровень нет подходящих тем в этом домене. Посмотри другие табы или пересдай плейсмент.";
    case "mastered":
      return "Пока ничего не освоено до конца. Прошёл квиз ≥2/3 + упражнение → тема в архиве.";
    default:
      return "Темы ещё не собраны.";
  }
}
