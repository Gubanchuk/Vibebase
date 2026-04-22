"use client";

import * as React from "react";
import { ChevronRight, Check, Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  buildTree,
  nodeProgress,
  type LessonProgress,
  type SkillLesson,
  type SkillNode,
  type SkillWithTree,
} from "@/lib/domains/skills/types";
import { NodeSheet } from "./NodeSheet";

function countLessons(
  node: SkillNode,
  lessons: SkillLesson[],
  progress: LessonProgress[]
): { total: number; done: number } {
  const ids = new Set<string>([node.id]);
  const stack: SkillNode[] = [...(node.children ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    ids.add(cur.id);
    if (cur.children?.length) stack.push(...cur.children);
  }
  const total = lessons.filter(
    (l) => ids.has(l.nodeId) && l.archivedAt === null
  ).length;
  const done = lessons.filter(
    (l) =>
      ids.has(l.nodeId) &&
      l.archivedAt === null &&
      progress.some((p) => p.lessonId === l.id && p.completedAt !== null)
  ).length;
  return { total, done };
}

function DotProgress({ total, done }: { total: number; done: number }) {
  const dots = 5;
  const filled = total === 0 ? 0 : Math.round((done / total) * dots);
  return (
    <span className="dot-progress" aria-label={`${done} of ${total} done`}>
      {Array.from({ length: dots }).map((_, i) => (
        <span key={i} className={i < filled ? "on" : undefined} />
      ))}
    </span>
  );
}

interface TreeNodeRowProps {
  node: SkillNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (node: SkillNode) => void;
  lessons: SkillLesson[];
  progress: LessonProgress[];
}

function TreeNodeRow({
  node,
  depth,
  expanded,
  toggle,
  selectedId,
  onSelect,
  lessons,
  progress,
}: TreeNodeRowProps) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const { total, done } = countLessons(node, lessons, progress);
  const ratio = total === 0 ? 0 : done / total;
  const isComplete = total > 0 && done === total;

  return (
    <div className={depth === 0 ? "relative" : "tree-child"}>
      <div
        className={cn(
          "group flex items-center gap-2 py-1.5 pl-1 pr-2 rounded-md cursor-pointer",
          "transition hover:bg-[color:var(--surface-2)]",
          isSelected && "glow-ring bg-[color:var(--surface-2)]"
        )}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (hasChildren) toggle(node.id);
          onSelect(node);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (hasChildren) toggle(node.id);
            onSelect(node);
          }
        }}
      >
        <button
          type="button"
          aria-label={isOpen ? "Свернуть" : "Развернуть"}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggle(node.id);
          }}
          className={cn(
            "w-4 h-4 flex items-center justify-center flex-shrink-0 transition-transform",
            hasChildren ? "" : "opacity-0 pointer-events-none",
            isOpen && "rotate-90"
          )}
          style={{ color: "var(--muted)" }}
        >
          <ChevronRight size={12} strokeWidth={2} />
        </button>

        <span
          className={cn(
            "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border",
            isComplete && "border-0"
          )}
          style={{
            background: isComplete
              ? "var(--success)"
              : ratio > 0
                ? "var(--surface-2)"
                : "transparent",
            borderColor: "var(--border)",
          }}
          aria-hidden
        >
          {isComplete ? (
            <Check size={10} strokeWidth={3} color="#0a0a0a" />
          ) : ratio > 0 ? (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--coral)",
                boxShadow: "0 0 6px var(--coral)",
              }}
            />
          ) : null}
        </span>

        <span
          className={cn(
            "flex-1 text-[13px] truncate",
            depth === 0 ? "font-semibold" : "",
            !isComplete && ratio === 0 ? "" : ""
          )}
          style={{
            color: isSelected || isComplete || ratio > 0 ? "var(--content)" : "var(--muted)",
          }}
        >
          {node.title}
        </span>

        {total > 0 ? (
          <>
            <span
              className="hidden sm:inline mono text-[10px]"
              style={{ color: "var(--subtle)" }}
            >
              {total} lessons, {done} done
            </span>
            <DotProgress total={total} done={done} />
            <span
              className={cn(
                "mono text-[11px]",
                isComplete ? "" : ratio > 0 ? "gradient-text font-bold" : ""
              )}
              style={{
                color: isComplete
                  ? "var(--success)"
                  : ratio > 0
                    ? undefined
                    : "var(--subtle)",
              }}
            >
              {done}/{total}
            </span>
          </>
        ) : (
          <span
            className="chip chip-violet mono"
            style={{ fontSize: 10 }}
            aria-label="Generate a lesson"
          >
            <Sparkles size={10} strokeWidth={2} />
            generate
          </span>
        )}
      </div>

      {hasChildren && isOpen ? (
        <div className="relative">
          {depth === 0 ? <div className="tree-line" /> : null}
          {node.children!.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
              lessons={lessons}
              progress={progress}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RoadmapTree({ skill }: { skill: SkillWithTree }) {
  const tree = React.useMemo(() => buildTree(skill.nodes), [skill.nodes]);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    // Expand all roots by default so the user sees the structure upfront.
    return new Set(tree.map((n) => n.id));
  });
  const [selected, setSelected] = React.useState<SkillNode | null>(null);

  const toggle = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const overall = skill.lessons.filter((l) => l.archivedAt === null).length;

  if (tree.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-2xl mb-2">🌱</div>
        <h3 className="text-[15px] font-semibold mb-1">
          Дерево ещё пустое
        </h3>
        <p
          className="text-[12.5px] mb-4"
          style={{ color: "var(--muted)" }}
        >
          Посади первый узел — остальное подтянется по мере прокачки.
        </p>
        <button type="button" className="btn btn-primary">
          Seed your first node
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl" aria-hidden>
            {skill.emoji}
          </span>
          <h2 className="text-[17px] font-bold">
            <span className="serif-italic text-[18px]">
              {skill.name.split(" ")[0]}
            </span>
            {skill.name.includes(" ")
              ? " " + skill.name.split(" ").slice(1).join(" ")
              : ""}{" "}
            <span
              className="serif-italic text-[15px]"
              style={{ color: "var(--muted)" }}
            >
              — roadmap
            </span>
          </h2>
          <span className="chip mono ml-auto">{skill.nodes.length} узлов</span>
        </div>

        <div className="space-y-0.5">
          {tree.map((root) => (
            <TreeNodeRow
              key={root.id}
              node={root}
              depth={0}
              expanded={expanded}
              toggle={toggle}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              lessons={skill.lessons}
              progress={skill.progress}
            />
          ))}
        </div>

        <div
          className="mt-4 pt-3 border-t text-[11px] mono flex items-center gap-2"
          style={{ borderColor: "var(--border-2)", color: "var(--muted)" }}
        >
          <span>{overall} уроков всего</span>
          <span style={{ color: "var(--subtle)" }}>·</span>
          <span>
            {
              skill.progress.filter((p) => p.completedAt !== null).length
            }{" "}
            завершено
          </span>
          {selected ? null : (
            <span className="ml-auto" style={{ color: "var(--subtle)" }}>
              Кликни по узлу для деталей →
            </span>
          )}
        </div>
      </div>

      <NodeSheet
        node={selected}
        skill={skill}
        nodeProgressRatio={
          selected
            ? nodeProgress(
                { ...selected, children: findChildren(selected.id, tree) },
                skill.lessons,
                skill.progress,
                skill.nodes
              )
            : 0
        }
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function findChildren(id: string, tree: SkillNode[]): SkillNode[] | undefined {
  for (const n of tree) {
    if (n.id === id) return n.children;
    if (n.children?.length) {
      const found = findChildren(id, n.children);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}
