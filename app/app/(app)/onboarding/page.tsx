"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { PlacementFlow } from "@/components/english/PlacementFlow";
import { cn } from "@/lib/cn";
import type { PlacementResult } from "@/lib/domains/english/types";

type Step = 0 | 1 | 2;

export default function OnboardingPage() {
  const [step, setStep] = React.useState<Step>(0);
  const [result, setResult] = React.useState<PlacementResult | null>(null);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Step indicator */}
      <header className="px-4 md:px-8 py-5 flex justify-center">
        <StepDots active={step} />
      </header>

      <main className="flex-1 px-4 md:px-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] flex items-start justify-center">
        <div className="w-full max-w-2xl">
          {step === 0 ? <IntroStep onNext={() => setStep(1)} /> : null}
          {step === 1 ? (
            <PlacementStep
              onDone={(r) => {
                setResult(r);
                setStep(2);
              }}
            />
          ) : null}
          {step === 2 && result ? <ResultStep result={result} /> : null}
        </div>
      </main>
    </div>
  );
}

function StepDots({ active }: { active: Step }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-1.5 rounded-full transition-all",
              isActive ? "w-8" : "w-3"
            )}
            style={{
              background: isActive
                ? "var(--gradient-hot)"
                : isDone
                  ? "var(--coral)"
                  : "var(--border)",
              boxShadow: isActive
                ? "0 0 10px rgba(249, 112, 102, 0.5)"
                : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="p-5 md:p-10 flex flex-col gap-5">
      <Chip tone="coral" className="mono self-start">
        <Sparkles size={11} strokeWidth={2} />
        шаг 1 из 3
      </Chip>

      <h1 className="text-[24px] md:text-[38px] font-bold tracking-tight leading-tight break-words">
        Собираем твой персональный{" "}
        <span className="serif-italic gradient-text">английский</span>
      </h1>

      <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
        Пара минут — и у тебя будет свой маршрут. Мы проверим уровень коротким
        тестом, настроим персональные уроки, подцепим словарь ошибок и подберём
        первую тему.
      </p>

      <ul
        className="text-[13px] flex flex-col gap-1.5"
        style={{ color: "var(--muted)" }}
      >
        <li>· 15 вопросов placement — ~5 минут.</li>
        <li>· Определим CEFR уровень: A1 → C2.</li>
        <li>· Предложим первый урок под твои пробелы.</li>
      </ul>

      <div className="pt-2">
        <Button variant="primary" size="lg" onClick={onNext}>
          Начать
          <ArrowRight size={15} strokeWidth={1.9} />
        </Button>
      </div>
    </Card>
  );
}

function PlacementStep({ onDone }: { onDone: (r: PlacementResult) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Chip tone="coral" className="mono self-start">
        <Sparkles size={11} strokeWidth={2} />
        шаг 2 из 3 · placement
      </Chip>
      <PlacementFlow compact onDone={onDone} />
    </div>
  );
}

function ResultStep({ result }: { result: PlacementResult }) {
  return (
    <Card glow className="p-5 md:p-10 flex flex-col gap-5">
      <Chip tone="coral" className="mono self-start">
        <Sparkles size={11} strokeWidth={2} />
        шаг 3 из 3 · готово
      </Chip>

      <h1 className="text-[22px] md:text-[32px] font-bold tracking-tight leading-tight break-words">
        Ты говоришь на{" "}
        <span className="gradient-text">{result.level}</span>. Создал твой
        первый навык{" "}
        <span className="serif-italic">«Learning English»</span>. Начнём с
        персонального урока про{" "}
        <span className="gradient-text">Past Perfect</span>?
      </h1>

      <p className="text-[14px]" style={{ color: "var(--muted)" }}>
        {result.summary}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <Chip className="mono">
          {result.correct}/{result.total} верно
        </Chip>
        <Chip tone="coral" className="mono">
          confidence {Math.round(result.confidence * 100)}%
        </Chip>
      </div>

      <div className="pt-2 flex flex-wrap gap-2">
        <Link href="/english/lesson">
          <Button variant="primary" size="lg">
            Begin your first lesson
            <ArrowRight size={15} strokeWidth={1.9} />
          </Button>
        </Link>
        <Link href="/english">
          <Button variant="ghost" size="md">
            Посмотреть все режимы
          </Button>
        </Link>
      </div>
    </Card>
  );
}
