"use client";

import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Compass, GraduationCap, Radar } from "lucide-react";
import type { Backlink } from "@/lib/domains/journal/types";

interface LinkableItem {
  id: string;
  label: string;
  hint?: string;
}

const SKILLS: LinkableItem[] = [
  { id: "learning-english", label: "Английский", hint: "B1+ · активный" },
  { id: "claude-code", label: "Claude Code", hint: "еженедельно" },
  { id: "design-systems", label: "Design systems", hint: "на паузе" },
  { id: "product-writing", label: "Продуктовое письмо", hint: "раз в неделю" },
];

const LESSONS: LinkableItem[] = [
  { id: "past-perfect-lesson", label: "Past Perfect", hint: "грамматика" },
  { id: "phrasal-verbs-up", label: "Phrasal verbs: up", hint: "лексика" },
  { id: "claude-hooks-101", label: "Hooks 101", hint: "Claude Code" },
];

const RADAR: LinkableItem[] = [
  { id: "radar-claude-code-2-7", label: "Claude Code 2.7", hint: "свежий релиз" },
  { id: "radar-next-16", label: "Next.js 16", hint: "следить" },
  { id: "radar-wxt-dev", label: "WXT", hint: "оценить" },
];

const PATHS: Record<Backlink["type"], string> = {
  skill: "/skills",
  lesson: "/lessons",
  radar: "/radar",
};

export function BacklinkPicker({
  onPick,
}: {
  onPick: (backlink: Backlink, insertMarkdown: string) => void;
}) {
  const pick = (type: Backlink["type"], item: LinkableItem) => {
    const href = `${PATHS[type]}/${item.id}`;
    const md = `[${item.label}](${href})`;
    onPick({ type, id: item.id, label: item.label }, md);
  };

  return (
    <div className="min-w-[320px]">
      <Tabs.Root defaultValue="skill" className="flex flex-col gap-2">
        <Tabs.List
          className="flex items-center gap-1 p-1 rounded-md"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}
        >
          <TabTrigger value="skill" icon={<Compass size={12} strokeWidth={1.9} />}>
            Навыки
          </TabTrigger>
          <TabTrigger value="lesson" icon={<GraduationCap size={12} strokeWidth={1.9} />}>
            Уроки
          </TabTrigger>
          <TabTrigger value="radar" icon={<Radar size={12} strokeWidth={1.9} />}>
            Радар
          </TabTrigger>
        </Tabs.List>
        <TabBody value="skill" items={SKILLS} onPick={(i) => pick("skill", i)} />
        <TabBody value="lesson" items={LESSONS} onPick={(i) => pick("lesson", i)} />
        <TabBody value="radar" items={RADAR} onPick={(i) => pick("radar", i)} />
      </Tabs.Root>
    </div>
  );
}

function TabTrigger({
  value,
  children,
  icon,
}: {
  value: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[12px] transition data-[state=active]:bg-[color:var(--surface)] data-[state=active]:text-[color:var(--content)] text-[color:var(--muted)]"
    >
      {icon}
      {children}
    </Tabs.Trigger>
  );
}

function TabBody({
  value,
  items,
  onPick,
}: {
  value: string;
  items: LinkableItem[];
  onPick: (i: LinkableItem) => void;
}) {
  return (
    <Tabs.Content value={value} className="flex flex-col gap-0.5">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onPick(it)}
          className="flex items-center justify-between gap-3 px-2 py-2 rounded-md text-left transition hover:bg-[color:var(--surface-2)]"
        >
          <span className="text-[13px] font-medium">{it.label}</span>
          {it.hint ? (
            <span
              className="mono text-[11px]"
              style={{ color: "var(--subtle)" }}
            >
              {it.hint}
            </span>
          ) : null}
        </button>
      ))}
    </Tabs.Content>
  );
}
