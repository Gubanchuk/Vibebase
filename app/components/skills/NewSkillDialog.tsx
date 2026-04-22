"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, RotateCw, Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import {
  generateRoadmapAction,
  commitSkillAction,
} from "@/app/(app)/skills/new/actions";
import type { Roadmap } from "@/lib/domains/skills/roadmap-schema";
import type { SkillTargetLevel } from "@/lib/domains/skills/types";
import { cn } from "@/lib/cn";

type Phase = "form" | "generating" | "preview" | "saving";

const LEVELS: Array<{ id: SkillTargetLevel; label: string; hint: string }> = [
  { id: "beginner",     label: "С нуля",        hint: "нет базы, старт" },
  { id: "intermediate", label: "Средний",       hint: "база есть, расту" },
  { id: "advanced",     label: "Продвинутый",   hint: "expert-нюансы" },
];

export function NewSkillDialog({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("form");
  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [level, setLevel] = React.useState<SkillTargetLevel>("intermediate");
  const [roadmap, setRoadmap] = React.useState<Roadmap | null>(null);
  const router = useRouter();

  const reset = () => {
    setPhase("form");
    setName("");
    setGoal("");
    setLevel("intermediate");
    setRoadmap(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  const generate = async () => {
    if (!name.trim() || !goal.trim()) {
      toast.error("Заполни название и цель");
      return;
    }
    setPhase("generating");
    const res = await generateRoadmapAction({
      name: name.trim(),
      goal: goal.trim(),
      targetLevel: level,
    });
    if (res.ok) {
      setRoadmap(res.roadmap);
      setPhase("preview");
    } else {
      toast.error(res.error);
      setPhase("form");
    }
  };

  const commit = async () => {
    if (!roadmap) return;
    setPhase("saving");
    const res = await commitSkillAction({
      name: name.trim(),
      description: roadmap.summary,
      targetLevel: level,
      emoji: roadmap.emoji,
      roadmap,
    });
    if (res.ok) {
      toast.success(`Навык «${name.trim()}» создан`);
      setOpen(false);
      reset();
      router.push(`/skills/${res.slug}`);
      router.refresh();
    } else {
      toast.error(res.error);
      setPhase("preview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent
        side="center"
        className="w-[min(680px,94vw)] max-h-[90dvh] flex flex-col"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Chip tone="coral" mono>
              <Sparkles size={10} strokeWidth={2} />
              greenfield
            </Chip>
            {phase === "generating" ? (
              <Chip tone="coral" mono>
                <span className="stream-dot" />
                AI собирает план…
              </Chip>
            ) : phase === "preview" ? (
              <Chip tone="success" mono>
                ● готов к сохранению
              </Chip>
            ) : phase === "saving" ? (
              <Chip mono>сохраняю…</Chip>
            ) : null}
          </div>
          <DialogTitle className="text-[22px] leading-tight tracking-tight">
            <span className="serif-italic text-[24px]">Новый</span> навык
          </DialogTitle>
          <DialogDescription>
            Опиши цель — AI соберёт первый roadmap. Сможешь отредактировать
            после сохранения.
          </DialogDescription>
        </DialogHeader>

        {(phase === "form" || phase === "generating") && (
          <div className="space-y-4 mt-4">
            <Field
              label="Название навыка"
              hint="короткое, 1–3 слова"
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Напр.: Public Speaking, SQL, Дзюдо"
                disabled={phase === "generating"}
                autoFocus
              />
            </Field>

            <Field
              label="Что ты хочешь в итоге уметь?"
              hint="1–3 строки — чем конкретнее, тем точнее план"
            >
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Напр.: Уверенно питчить идеи 5 минут без бумажки. Не заикаться, держать взгляд зала, управлять темпом."
                rows={4}
                disabled={phase === "generating"}
              />
            </Field>

            <Field label="Текущий уровень" hint="помогает подстроить глубину">
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id)}
                    disabled={phase === "generating"}
                    className={cn(
                      "card p-3 text-left transition",
                      level === l.id
                        ? "card-glow glow-ring"
                        : "card-hover"
                    )}
                    style={{
                      borderColor:
                        level === l.id ? "var(--coral)" : undefined,
                    }}
                  >
                    <div className="text-[13px] font-semibold">{l.label}</div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      {l.hint}
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={phase === "generating"}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={generate}
                disabled={phase === "generating" || !name.trim() || !goal.trim()}
              >
                {phase === "generating" ? (
                  <>
                    <RotateCw size={13} strokeWidth={2} className="animate-spin" />
                    Генерю план…
                  </>
                ) : (
                  <>
                    <Sparkles size={13} strokeWidth={2} />
                    Собрать roadmap
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {phase === "preview" && roadmap && (
          <div className="mt-4 flex-1 overflow-y-auto scrollbar-slim pr-1">
            <div
              className="card p-4 flex items-start gap-3 mb-3"
              style={{ background: "var(--surface-2)" }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-[22px] shrink-0"
                style={{ background: "var(--surface-3)" }}
              >
                {roadmap.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold mb-1">{name}</div>
                <p
                  className="text-[12.5px] leading-relaxed"
                  style={{ color: "var(--muted)" }}
                >
                  {roadmap.summary}
                </p>
              </div>
            </div>

            <div
              className="text-[10px] mono uppercase tracking-wider mb-2"
              style={{ color: "var(--subtle)" }}
            >
              // предложенный roadmap · {roadmap.nodes.length} разделов
            </div>

            <div className="space-y-1.5">
              {roadmap.nodes.map((node, i) => (
                <div key={i} className="card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="mono text-[10px]"
                      style={{ color: "var(--coral)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] font-semibold">{node.title}</span>
                  </div>
                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: "var(--muted)" }}
                  >
                    {node.description}
                  </p>
                  {node.children?.length ? (
                    <div className="mt-2 space-y-1 pl-4 border-l" style={{ borderColor: "var(--border-2)" }}>
                      {node.children.map((child, j) => (
                        <div key={j} className="text-[12px]">
                          <span className="font-medium">{child.title}</span>
                          <span style={{ color: "var(--muted)" }}> — {child.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "preview" && (
          <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: "var(--border-2)" }}>
            <Button
              variant="ghost"
              onClick={() => setPhase("form")}
            >
              <ArrowLeft size={13} strokeWidth={2} />
              Назад
            </Button>
            <Button
              variant="ghost"
              onClick={generate}
            >
              <RotateCw size={13} strokeWidth={2} />
              Перегенерить
            </Button>
            <div className="flex-1" />
            <Button variant="primary" onClick={commit}>
              <Check size={13} strokeWidth={2} />
              Создать навык
            </Button>
          </div>
        )}

        {phase === "saving" && (
          <div className="mt-8 mb-6 text-center">
            <div className="mono text-[13px]" style={{ color: "var(--muted)" }}>
              Сохраняю roadmap в Supabase…
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span
          className="text-[10.5px] mono uppercase tracking-wider"
          style={{ color: "var(--subtle)" }}
        >
          {label}
        </span>
        {hint ? (
          <span className="text-[11px]" style={{ color: "var(--subtle)" }}>
            · {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export { Plus as NewSkillPlusIcon };
