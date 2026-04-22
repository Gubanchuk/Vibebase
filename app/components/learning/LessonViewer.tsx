"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  RotateCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  markExerciseDoneAction,
  regenerateLessonAction,
  submitQuizAction,
} from "@/app/(app)/learn/actions";
import type {
  LearningDomain,
  LessonContent,
  LessonMastery,
} from "@/lib/domains/learning/types";

type SectionId = "intro" | "concept" | "example" | "exercise" | "quiz";

interface QuizResult {
  score: number;
  total: number;
  perQuestion: Array<{
    correct: boolean;
    correctIndex: number;
    explanation: string;
  }>;
  mastered: boolean;
}

export function LessonViewer({
  domain,
  slug,
  lesson,
  initialMastery,
}: {
  domain: LearningDomain;
  slug: string;
  lesson: LessonContent;
  initialMastery: LessonMastery | null;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState<Record<SectionId, boolean>>({
    intro: true,
    concept: true,
    example: true,
    exercise: true,
    quiz: true,
  });
  const [showSolution, setShowSolution] = React.useState(false);
  const [exerciseDone, setExerciseDone] = React.useState<boolean>(
    initialMastery?.exercisePassed ?? false
  );
  const [answers, setAnswers] = React.useState<(number | null)[]>(
    () => lesson.quiz.map(() => null)
  );
  const [quizResult, setQuizResult] = React.useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);

  const toggle = (s: SectionId) =>
    setOpen((prev) => ({ ...prev, [s]: !prev[s] }));

  const mastered = quizResult?.mastered ?? Boolean(initialMastery?.masteredAt);

  const submitQuiz = async () => {
    const filled = answers.filter((a) => a !== null).length;
    if (filled < lesson.quiz.length) {
      toast.error("Ответь на все вопросы");
      return;
    }
    setSubmitting(true);
    const res = await submitQuizAction({
      domain,
      slug,
      answers: answers as number[],
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setQuizResult({
      score: res.score,
      total: res.total,
      perQuestion: res.perQuestion,
      mastered: res.mastered,
    });
    if (res.mastered) {
      toast.success("Тема освоена 🎯");
    } else if (res.score >= Math.ceil(res.total * 0.67)) {
      toast.success(
        `Квиз пройден ${res.score}/${res.total}. Отметь упражнение как выполненное, чтобы освоить тему.`
      );
    } else {
      toast(`Квиз: ${res.score}/${res.total}. Попробуй ещё раз — нужно ≥${Math.ceil(res.total * 0.67)}.`);
    }
    router.refresh();
  };

  const markExercise = async (passed: boolean) => {
    const res = await markExerciseDoneAction({ domain, slug, passed });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setExerciseDone(passed);
    if (passed && res.mastered) {
      toast.success("Тема освоена 🎯");
    }
    router.refresh();
  };

  const regenerate = async () => {
    setRegenerating(true);
    const res = await regenerateLessonAction({ domain, slug });
    setRegenerating(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Урок сброшен — сейчас сгенерирую свежий");
    router.refresh();
  };

  const retryQuiz = () => {
    setAnswers(lesson.quiz.map(() => null));
    setQuizResult(null);
  };

  return (
    <div className="space-y-4">
      {mastered ? <MasteredBanner /> : null}

      <Section
        id="intro"
        label="Зачем эту тему знать"
        step="1"
        isOpen={open.intro}
        onToggle={() => toggle("intro")}
      >
        <Markdown md={lesson.introMd} />
      </Section>

      <Section
        id="concept"
        label="Ядро"
        step="2"
        isOpen={open.concept}
        onToggle={() => toggle("concept")}
      >
        <Markdown md={lesson.conceptMd} />
      </Section>

      <Section
        id="example"
        label="Пример"
        step="3"
        isOpen={open.example}
        onToggle={() => toggle("example")}
      >
        <Markdown md={lesson.exampleMd} />
      </Section>

      <Section
        id="exercise"
        label="Твой ход"
        step="4"
        isOpen={open.exercise}
        onToggle={() => toggle("exercise")}
        status={
          exerciseDone ? (
            <Chip tone="success" mono>
              ✓ выполнено
            </Chip>
          ) : null
        }
      >
        <Markdown md={lesson.exerciseMd} />

        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-2)" }}>
          {!showSolution ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSolution(true)}
            >
              <Eye size={13} strokeWidth={2} />
              Показать решение
            </Button>
          ) : (
            <>
              <div
                className="mb-4 text-[10px] mono uppercase tracking-wider"
                style={{ color: "var(--subtle)" }}
              >
                // эталонное решение
              </div>
              <div
                className="p-4 rounded-md"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                }}
              >
                <Markdown md={lesson.exerciseSolutionMd} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant={exerciseDone ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => void markExercise(true)}
                  disabled={exerciseDone}
                >
                  <Check size={13} strokeWidth={2} />
                  {exerciseDone ? "Отмечено" : "У меня получилось"}
                </Button>
                {exerciseDone ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void markExercise(false)}
                  >
                    Снять отметку
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </Section>

      <Section
        id="quiz"
        label="Квиз"
        step="5"
        isOpen={open.quiz}
        onToggle={() => toggle("quiz")}
        status={
          quizResult ? (
            <Chip
              tone={quizResult.score >= Math.ceil(quizResult.total * 0.67) ? "success" : "amber"}
              mono
            >
              {quizResult.score}/{quizResult.total}
            </Chip>
          ) : initialMastery && initialMastery.quizBestScore > 0 ? (
            <Chip mono>
              лучший: {initialMastery.quizBestScore}/{initialMastery.quizBestTotal}
            </Chip>
          ) : null
        }
      >
        <div className="space-y-5">
          {lesson.quiz.map((q, qi) => {
            const answerIndex = answers[qi];
            const result = quizResult?.perQuestion[qi];
            return (
              <fieldset key={qi}>
                <legend className="text-[14px] font-semibold mb-2">
                  {qi + 1}. {q.prompt}
                </legend>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answerIndex === oi;
                    const showResult = !!result;
                    const isCorrect = showResult && oi === result.correctIndex;
                    const isWrongChoice =
                      showResult && selected && !result.correct;

                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={showResult}
                        onClick={() => {
                          if (showResult) return;
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[qi] = oi;
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-md border transition flex items-center gap-3 text-[13px]",
                          !showResult && selected && "border-[color:var(--coral)]",
                          !showResult && !selected && "border-[color:var(--border)] hover:border-[color:var(--border-hover)]",
                          isCorrect && "border-[color:var(--success)]",
                          isWrongChoice && "border-[color:var(--danger)]"
                        )}
                        style={{
                          background: isCorrect
                            ? "rgba(74, 222, 128, 0.1)"
                            : isWrongChoice
                              ? "rgba(239, 68, 68, 0.08)"
                              : selected
                                ? "var(--coral-soft)"
                                : "var(--surface)",
                          color: "var(--content)",
                        }}
                      >
                        <span className="kbd shrink-0">{oi + 1}</span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect ? (
                          <Check size={14} strokeWidth={2} color="var(--success)" />
                        ) : isWrongChoice ? (
                          <X size={14} strokeWidth={2} color="var(--danger)" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {result ? (
                  <div
                    className="mt-2.5 px-3 py-2 rounded-md text-[12.5px] leading-relaxed"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                    }}
                  >
                    <strong style={{ color: "var(--content)" }}>
                      {result.correct ? "✓ Правильно." : "✗ Разбор:"}
                    </strong>{" "}
                    {q.explanation}
                  </div>
                ) : null}
              </fieldset>
            );
          })}

          <div className="flex items-center gap-2 pt-2">
            {!quizResult ? (
              <Button
                variant="primary"
                onClick={() => void submitQuiz()}
                disabled={submitting || answers.some((a) => a === null)}
              >
                {submitting ? (
                  <>
                    <RotateCw size={13} strokeWidth={2} className="animate-spin" />
                    Проверяю…
                  </>
                ) : (
                  <>
                    <Sparkles size={13} strokeWidth={2} />
                    Проверить квиз
                  </>
                )}
              </Button>
            ) : (
              <Button variant="secondary" onClick={retryQuiz}>
                <RotateCw size={13} strokeWidth={2} />
                Пройти ещё раз
              </Button>
            )}
          </div>
        </div>
      </Section>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
          Урок сгенерирован{" "}
          <span className="mono" style={{ color: "var(--content)" }}>
            {new Date(lesson.generatedAt).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {lesson.costUsd ? (
            <>
              {" · стоил "}
              <span className="mono" style={{ color: "var(--content)" }}>
                ${lesson.costUsd.toFixed(4)}
              </span>
            </>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => void regenerate()} disabled={regenerating}>
          {regenerating ? (
            <>
              <RotateCw size={13} strokeWidth={2} className="animate-spin" />
              Сбрасываю…
            </>
          ) : (
            <>
              <RotateCw size={13} strokeWidth={2} />
              Перегенерить урок
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}

function Section({
  id,
  label,
  step,
  isOpen,
  onToggle,
  status,
  children,
}: {
  id: SectionId;
  label: string;
  step: string;
  isOpen: boolean;
  onToggle: () => void;
  status?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center gap-3 text-left"
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <span
          className="mono text-[10px]"
          style={{ color: "var(--subtle)" }}
        >
          // step {step}
        </span>
        <span className="text-[15px] font-semibold flex-1">{label}</span>
        {status}
        {isOpen ? (
          <ChevronDown size={15} strokeWidth={1.9} style={{ color: "var(--muted)" }} />
        ) : (
          <ChevronRight size={15} strokeWidth={1.9} style={{ color: "var(--muted)" }} />
        )}
      </button>
      {isOpen ? (
        <div
          id={`section-${id}`}
          className="px-5 pb-5 pt-1 border-t"
          style={{ borderColor: "var(--border-2)" }}
        >
          {children}
        </div>
      ) : null}
    </Card>
  );
}

function Markdown({ md }: { md: string }) {
  return (
    <div className="prose-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </div>
  );
}

function MasteredBanner() {
  return (
    <Card
      className="p-4 flex items-center gap-3"
      style={{
        background: "rgba(74, 222, 128, 0.08)",
        borderColor: "rgba(74, 222, 128, 0.35)",
      }}
    >
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center"
        style={{
          background: "rgba(74, 222, 128, 0.15)",
          color: "var(--success)",
        }}
      >
        <Trophy size={18} strokeWidth={1.9} />
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold">Тема освоена</div>
        <div className="text-[12.5px]" style={{ color: "var(--muted)" }}>
          Квиз ≥ 2/3 + упражнение выполнено. Можешь возвращаться как к
          справочнику или идти дальше по плану.
        </div>
      </div>
    </Card>
  );
}
