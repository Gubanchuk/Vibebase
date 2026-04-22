"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import type {
  LessonProgress,
  SkillLesson,
  SkillNode,
  SkillWithTree,
} from "@/lib/domains/skills/types";
import { LessonGenerateDialog } from "./LessonGenerateDialog";

function splitSerifWord(s: string) {
  const parts = s.trim().split(/\s+/);
  if (parts.length === 1) return { serif: parts[0], rest: "" };
  return { serif: parts[0], rest: " " + parts.slice(1).join(" ") };
}

function LessonRow({
  skillSlug,
  lesson,
  progress,
}: {
  skillSlug: string;
  lesson: SkillLesson;
  progress: LessonProgress[];
}) {
  const completed = progress.some(
    (p) => p.lessonId === lesson.id && p.completedAt !== null
  );
  return (
    <Link
      href={`/skills/${skillSlug}/lessons/${lesson.id}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md group",
        "border transition card-hover"
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-2)",
      }}
    >
      <span
        className="text-[14px] w-4 flex-shrink-0 text-center"
        style={{ color: completed ? "var(--success)" : "var(--subtle)" }}
        aria-hidden
      >
        {completed ? "●" : "○"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{lesson.title}</div>
        <div
          className="text-[10.5px] mono mt-0.5 flex items-center gap-1.5"
          style={{ color: "var(--subtle)" }}
        >
          {lesson.generatedByAi ? (
            <span className="flex items-center gap-1">
              <Sparkles size={9} strokeWidth={2} /> ai
            </span>
          ) : (
            <span>hand-crafted</span>
          )}
          <span>·</span>
          <span>{completed ? "completed" : "todo"}</span>
        </div>
      </div>
      <ArrowRight
        size={13}
        strokeWidth={1.8}
        style={{ color: "var(--subtle)" }}
        className="opacity-0 group-hover:opacity-100 transition"
      />
    </Link>
  );
}

export function NodeSheet({
  node,
  skill,
  nodeProgressRatio,
  onClose,
}: {
  node: SkillNode | null;
  skill: SkillWithTree;
  nodeProgressRatio: number;
  onClose: () => void;
}) {
  const [genOpen, setGenOpen] = React.useState(false);

  const open = node !== null;
  const lessons = React.useMemo(
    () =>
      node
        ? skill.lessons.filter(
            (l) => l.nodeId === node.id && l.archivedAt === null
          )
        : [],
    [node, skill.lessons]
  );

  if (!node) return null;

  const { serif, rest } = splitSerifWord(node.title);
  const percent = Math.round(nodeProgressRatio * 100);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <DialogContent
          side="right"
          aria-describedby={undefined}
          className="flex flex-col gap-0"
        >
          <div className="flex items-center gap-2 mb-2">
            <Chip tone="coral" mono>
              node
            </Chip>
            <span
              className="mono text-[10px]"
              style={{ color: "var(--subtle)" }}
            >
              {percent}% progress
            </span>
          </div>

          <DialogTitle className="text-[22px] leading-tight tracking-tight">
            <span className="serif-italic text-[24px]">{serif}</span>
            {rest}
          </DialogTitle>
          <DialogDescription>{node.description}</DialogDescription>

          <div
            className="my-4 h-px"
            style={{ background: "var(--border-2)" }}
          />

          <div className="flex items-center justify-between mb-2">
            <div
              className="text-[10px] mono uppercase tracking-wider"
              style={{ color: "var(--subtle)" }}
            >
              // lessons
            </div>
            <span
              className="mono text-[10.5px]"
              style={{ color: "var(--muted)" }}
            >
              {lessons.length} всего
            </span>
          </div>

          {lessons.length === 0 ? (
            <div
              className="rounded-md border border-dashed p-4 text-center text-[12.5px]"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted)",
                background: "var(--surface-2)",
              }}
            >
              Пока пусто. Сгенерируй первый урок AI-тьютором.
            </div>
          ) : (
            <div className="space-y-1.5">
              {lessons.map((l) => (
                <LessonRow
                  key={l.id}
                  skillSlug={skill.slug}
                  lesson={l}
                  progress={skill.progress}
                />
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t flex items-center gap-2" style={{ borderColor: "var(--border-2)" }}>
            <Button
              variant="primary"
              onClick={() => setGenOpen(true)}
              className="flex-1 justify-center"
            >
              <Sparkles size={14} strokeWidth={2} />
              Generate lesson
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LessonGenerateDialog
        open={genOpen}
        onOpenChange={setGenOpen}
        skillId={skill.id}
        skillSlug={skill.slug}
        skillName={skill.name}
        nodeId={node.id}
        nodeTitle={node.title}
      />
    </>
  );
}
