"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import {
  PLACEMENT_BANK,
  buildResultSummary,
  computeConfidence,
  scoreToLevel,
} from "@/lib/domains/vibecoding/placement-fallback";
import { LEVEL_LABEL } from "@/lib/domains/vibecoding/types";
import type { PlacementResult } from "@/lib/domains/vibecoding/types";
import { finishVibecodingPlacementAction } from "@/app/(app)/vibecoding/placement/actions";

type Phase = "idle" | "answering" | "done";

export function VibecodingPlacementFlow({
  compact = false,
  onDone,
}: {
  compact?: boolean;
  onDone?: (result: PlacementResult) => void;
}) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [results, setResults] = React.useState<boolean[]>([]);
  const [finalResult, setFinalResult] = React.useState<PlacementResult | null>(
    null
  );
  const [saveStatus, setSaveStatus] = React.useState<"saving" | "saved" | "error">(
    "saving"
  );
  const [createdSlug, setCreatedSlug] = React.useState<string | null>(null);

  const total = PLACEMENT_BANK.length;
  const current = PLACEMENT_BANK[index];

  const start = React.useCallback(() => {
    setPhase("answering");
    setIndex(0);
    setPicked(null);
    setResults([]);
    setFinalResult(null);
    setSaveStatus("saving");
    setCreatedSlug(null);
  }, []);

  const submit = React.useCallback(() => {
    if (phase !== "answering" || picked === null || !current) return;
    const isCorrect = picked === current.correctIndex;
    const nextResults = [...results, isCorrect];

    if (index + 1 >= total) {
      const correct = nextResults.filter(Boolean).length;
      const level = scoreToLevel(correct, total);
      const confidence = computeConfidence(correct, total);
      const result: PlacementResult = {
        level,
        confidence,
        summary: buildResultSummary(level),
        correct,
        total,
      };
      setResults(nextResults);
      setFinalResult(result);
      setPhase("done");
      onDone?.(result);

      setSaveStatus("saving");
      void finishVibecodingPlacementAction(result).then((res) => {
        if (res.ok) {
          setSaveStatus("saved");
          setCreatedSlug(res.skillSlug);
          toast.success(
            `Уровень сохранён: ${LEVEL_LABEL[result.level]}${
              res.skillSlug ? " · skill tree создан" : ""
            }`
          );
        } else {
          setSaveStatus("error");
          toast.error(`Не удалось сохранить: ${res.error}`);
        }
      });
      return;
    }

    setResults(nextResults);
    setIndex((i) => i + 1);
    setPicked(null);
  }, [phase, picked, current, results, index, total, onDone]);

  React.useEffect(() => {
    if (phase !== "answering") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") {
        const i = Number(e.key) - 1;
        if (current && i < current.options.length) {
          e.preventDefault();
          setPicked(i);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, current, submit]);

  if (phase === "idle") {
    return (
      <Card className={cn("flex flex-col gap-3", compact ? "p-5" : "p-6 md:p-8")}>
        <h2
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-[17px]" : "text-[22px]"
          )}
        >
          Vibecoding placement
        </h2>
        <p className="text-[13px]" style={{ color: "var(--muted)" }}>
          15 вопросов по Claude Code, AI SDK, MCP и агент-паттернам — от новичка
          до maintainer'а. Дадим честный уровень и соберём под него skill tree.
          Занимает около 7 минут.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Chip className="mono">15 items</Chip>
          <Chip className="mono">~7 min</Chip>
          <Chip tone="coral" className="mono">
            сохраняется в Supabase
          </Chip>
        </div>
        <div className="mt-2">
          <Button variant="primary" size="lg" onClick={start}>
            Начать
            <ArrowRight size={15} strokeWidth={1.9} />
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === "answering" && current) {
    const progress = (index + (picked !== null ? 1 : 0)) / total;
    return (
      <Card className={cn("flex flex-col gap-5", compact ? "p-5" : "p-6 md:p-8")}>
        <div className="flex items-center gap-3">
          <div
            className="h-1.5 flex-1 rounded-full overflow-hidden"
            style={{ background: "var(--border-2)" }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: "var(--gradient-hot)",
                boxShadow: "0 0 10px rgba(249, 112, 102, 0.45)",
              }}
            />
          </div>
          <span
            className="mono text-[10px] shrink-0"
            style={{ color: "var(--subtle)" }}
          >
            {index + 1}/{total}
          </span>
        </div>

        <fieldset>
          <legend className="sr-only">
            Question {index + 1} of {total}
          </legend>
          <p
            className={cn(
              "font-medium",
              compact ? "text-[15px]" : "text-[17px]"
            )}
          >
            {current.prompt}
          </p>

          <div
            role="radiogroup"
            aria-label="Answer options"
            className="mt-4 flex flex-col gap-2"
          >
            {current.options.map((opt, i) => {
              const selected = picked === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPicked(i)}
                  className={cn(
                    "w-full text-left px-4 rounded-md border transition flex items-center gap-3",
                    "min-h-[56px] text-[14px]",
                    selected
                      ? "border-[color:var(--coral)]"
                      : "border-[color:var(--border)] hover:border-[color:var(--border-hover)]"
                  )}
                  style={{
                    background: selected
                      ? "var(--coral-soft)"
                      : "var(--surface)",
                    color: "var(--content)",
                  }}
                >
                  <span
                    className={cn(
                      "kbd shrink-0",
                      selected && "border-[color:var(--coral)]"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1">{opt.label}</span>
                  {selected ? (
                    <Check size={14} strokeWidth={2} color="var(--coral)" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-[11px] mono" style={{ color: "var(--subtle)" }}>
            1–4 выбор · Enter дальше
          </span>
          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={picked === null}
          >
            {index + 1 === total ? "Завершить" : "Дальше"}
            <ArrowRight size={14} strokeWidth={1.9} />
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === "done" && finalResult) {
    return (
      <Card
        glow
        className={cn("flex flex-col gap-4", compact ? "p-5" : "p-6 md:p-8")}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Chip tone="coral" className="mono">
            placement complete
          </Chip>
          <span className="mono text-[10px]" style={{ color: "var(--subtle)" }}>
            {finalResult.correct}/{finalResult.total}
          </span>
        </div>

        <div>
          <div
            className="text-[11px] mono mb-1"
            style={{ color: "var(--subtle)" }}
          >
            твой уровень
          </div>
          <h2
            className={cn(
              "gradient-text font-bold tracking-tight",
              compact ? "text-[40px]" : "text-[56px] md:text-[72px]"
            )}
            style={{ lineHeight: 1 }}
          >
            {LEVEL_LABEL[finalResult.level]}
          </h2>
        </div>

        <p
          className={cn(compact ? "text-[13px]" : "text-[14px]")}
          style={{ color: "var(--muted)" }}
        >
          {finalResult.summary}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Chip className="mono">
            confidence {Math.round(finalResult.confidence * 100)}%
          </Chip>
          {saveStatus === "saving" ? (
            <Chip className="mono">сохраняю…</Chip>
          ) : saveStatus === "saved" ? (
            <Chip tone="success" className="mono">
              ✓ сохранено
            </Chip>
          ) : (
            <Chip tone="danger" className="mono">
              ошибка сохранения
            </Chip>
          )}
          {createdSlug ? (
            <Chip tone="violet" className="mono">
              skill tree готов
            </Chip>
          ) : null}
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          <Link href="/vibecoding/explain">
            <Button variant="primary" size="lg">
              Начать с Explain
              <ArrowRight size={15} strokeWidth={1.9} />
            </Button>
          </Link>
          {createdSlug ? (
            <Link href={`/skills/${createdSlug}`}>
              <Button variant="secondary" size="md">
                Открыть roadmap
              </Button>
            </Link>
          ) : null}
          <Button variant="ghost" size="md" onClick={start}>
            Пройти заново
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
