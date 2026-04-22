"use client";

import * as React from "react";
import { Send, Square, ArrowDown, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { readTextStream } from "@/lib/core/stream-http";
import { cn } from "@/lib/cn";
import type {
  VibecodingLevel,
  VibecodingMode,
  VMessage,
} from "@/lib/domains/vibecoding/types";

interface Props {
  mode: VibecodingMode;
  level: VibecodingLevel;
  initialMessages: VMessage[];
  sessionId?: string;
  /** Предзаполненное сообщение юзера — используется в debrief, когда открываем
   * из radar-карточки с заранее сформированным контекстом item'а. */
  prefill?: string;
}

type Status = "idle" | "streaming" | "error";

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function VibecodingChatSurface({
  mode,
  level,
  initialMessages,
  sessionId = "vc-session",
  prefill,
}: Props) {
  const [messages, setMessages] = React.useState<VMessage[]>(initialMessages);
  const [streamBuffer, setStreamBuffer] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [input, setInput] = React.useState(prefill ?? "");
  const [showJumpPill, setShowJumpPill] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const streamBufferRef = React.useRef("");

  React.useEffect(() => {
    streamBufferRef.current = streamBuffer;
  }, [streamBuffer]);

  const isStreaming = status === "streaming";

  const isNearBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    },
    []
  );

  React.useEffect(() => {
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isStreaming) return;
    if (isNearBottom()) scrollToBottom("auto");
  }, [streamBuffer, isStreaming, isNearBottom, scrollToBottom]);

  const handleScroll = React.useCallback(() => {
    setShowJumpPill(!isNearBottom());
  }, [isNearBottom]);

  React.useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(260, Math.max(42, ta.scrollHeight));
    ta.style.height = `${next}px`;
  }, [input]);

  const send = React.useCallback(
    async (overrideContent?: string) => {
      const trimmed = (overrideContent ?? input).trim();
      if (!trimmed || isStreaming) return;

      const userMsg: VMessage = {
        id: uid("u"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setStatus("streaming");
      setStreamBuffer("");
      requestAnimationFrame(() => scrollToBottom("smooth"));

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/vibecoding/chat", {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            mode,
            level,
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let accumulated = "";
        for await (const chunk of readTextStream(res)) {
          accumulated += chunk;
          setStreamBuffer(accumulated);
        }

        const finalMsg: VMessage = {
          id: uid("a"),
          role: "assistant",
          content: accumulated,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, finalMsg]);
        setStreamBuffer("");
        setStatus("idle");
      } catch (err) {
        const isAbort =
          err instanceof DOMException && err.name === "AbortError";
        if (isAbort && streamBufferRef.current) {
          const partial: VMessage = {
            id: uid("a"),
            role: "assistant",
            content: streamBufferRef.current + " …(прервано)",
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, partial]);
          setStreamBuffer("");
          setStatus("idle");
          return;
        }
        console.error("[vc-chat] stream error:", err);
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [input, isStreaming, messages, mode, level, sessionId, scrollToBottom]
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send();
      }
    },
    [send]
  );

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-60px)]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-slim px-4 md:px-8 py-6 relative min-h-0"
        role="log"
        aria-live="polite"
        style={{ paddingBottom: "144px" }}
      >
        {!hasMessages ? (
          <EmptyState mode={mode} onPick={(p) => void send(p)} />
        ) : (
          <ol className="mx-auto max-w-3xl flex flex-col gap-4">
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} content={m.content} />
            ))}
            {isStreaming ? (
              <Bubble role="assistant" content={streamBuffer} streaming />
            ) : null}
            {status === "error" ? (
              <div className="chip chip-danger self-start">
                Не удалось получить ответ. Попробуй ещё раз.
              </div>
            ) : null}
          </ol>
        )}
        <div ref={bottomRef} />
      </div>

      {showJumpPill ? (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          className="chip chip-coral mono absolute left-1/2 -translate-x-1/2 bottom-[120px] z-10 cursor-pointer"
          aria-label="Jump to latest message"
        >
          <ArrowDown size={11} strokeWidth={2} />
          новое сообщение
        </button>
      ) : null}

      <div
        className="sticky bottom-0 z-30 border-t px-3 md:px-6 py-3 flex gap-2 items-end"
        style={{
          borderColor: "var(--border-2)",
          background: "var(--bg)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholderFor(mode)}
          rows={1}
          className={cn(
            "flex-1 resize-none px-3 py-2.5 text-[16px] md:text-[13px] leading-relaxed rounded-md",
            "bg-[color:var(--surface-2)] border border-[color:var(--border)]",
            "text-[color:var(--content)] placeholder:text-[color:var(--subtle)]",
            "outline-none transition focus:border-[color:var(--coral)] focus:ring-1 focus:ring-[color:var(--coral)]",
            "scrollbar-slim"
          )}
          style={{ minHeight: 44, maxHeight: 260 }}
          aria-label="Message input"
        />
        {isStreaming ? (
          <Button
            variant="secondary"
            size="md"
            onClick={stop}
            aria-label="Stop generation"
            className="h-[44px]"
          >
            <Square size={14} strokeWidth={1.9} />
            Стоп
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={() => void send()}
            disabled={!input.trim()}
            aria-label="Send message"
            className="h-[44px]"
          >
            <Send size={14} strokeWidth={1.9} />
            Отправить
          </Button>
        )}
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming = false,
}: {
  role: VMessage["role"];
  content: string;
  streaming?: boolean;
}) {
  if (role === "system") return null;
  const isUser = role === "user";
  return (
    <li className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "chat-bubble max-w-[85%] md:max-w-[640px]",
          isUser ? "chat-bubble-user whitespace-pre-wrap" : "chat-bubble-assistant",
          streaming && !content && "stream-caret"
        )}
      >
        {isUser ? (
          content
        ) : (
          <div className={cn("prose-md chat-md", streaming && "stream-caret")}>
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <span className="opacity-60">…</span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

const STARTERS: Record<
  VibecodingMode,
  { title: string; subtitle: string; suggestions: string[] }
> = {
  explain: {
    title: "Объясни концепт",
    subtitle:
      "Кинь термин или механизм — получишь идею в строку, механику, gotcha и self-check. Под твой уровень.",
    suggestions: [
      "Объясни разницу между Skill, Subagent и MCP server",
      "Что такое ToolLoopAgent и когда его использовать?",
      "Разница между streamText и generateObject в AI SDK",
      "Как работают хуки в Claude Code — PreToolUse / PostToolUse / Stop",
    ],
  },
  chat: {
    title: "Думаю вслух",
    subtitle:
      "Принеси задачу, идею или сомнение. Буду зеркалить, уточнять, предлагать варианты с trade-off'ами. Не соглашаюсь ради вежливости.",
    suggestions: [
      "Думаю делать agent-pipeline для сбора журнала, но сомневаюсь",
      "Не могу понять, когда нужен subagent vs просто /fork",
      "У меня скилл стал толстым — разбить или оставить",
      "Стоит ли переводить существующий скрипт на AI SDK 6?",
    ],
  },
  review: {
    title: "Ревью артефакта",
    subtitle:
      "Кинь код / скилл / агент / промпт — верну severity-ranked ревью (BLOCKER / SMELL / POLISH) и «как бы сделал я».",
    suggestions: [
      "Вот мой скилл для pre-push — что чинить",
      "Посмотри на этот route handler с streamText",
      "Ревью моего агент-конфига .claude/agents/reviewer.md",
      "Оцени мой промпт для tutor-режима — можно жёстко",
    ],
  },
  recipe: {
    title: "Рецепт за 5 шагов",
    subtitle:
      "Расскажи что хочешь построить — верну пошаговый рецепт с кодом и gotcha'ми. Один путь, самый короткий.",
    suggestions: [
      "Как сделать MCP сервер для моего Notion за 5 шагов",
      "Рецепт tool approval flow с useChat в Next.js",
      "Как подключить AI Gateway с failover между двумя провайдерами",
      "Рецепт скилла с evals через skill-creator",
    ],
  },
  debrief: {
    title: "Debrief radar-item",
    subtitle:
      "Прочитал статью / релиз — превращу в конкретные действия на неделю. Кинь URL или название — либо заходи сюда с /radar через кнопку «обсудить».",
    suggestions: [
      "Разберём релиз Claude Opus 4.7 — что для меня поменяется",
      "AI SDK 6 Agent abstraction — что мне попробовать на этой неделе",
      "Что Skills 2.0 меняет в моём текущем .claude/skills/",
      "Карпаты про agentic engineering — как это влияет на мои привычки",
    ],
  },
  challenge: {
    title: "Мини-квест",
    subtitle:
      "Задача на 15-20 минут с acceptance criteria. Решил — проверю строго. Не прошёл — разберём вместе.",
    suggestions: [
      "Дай квест на написание первого скилла",
      "Квест на работу с субагентом под узкий allowlist",
      "Мини-задача на streamText с onFinish-логикой",
      "Сложный квест: написать MCP сервер за 20 минут",
    ],
  },
};

function EmptyState({
  mode,
  onPick,
}: {
  mode: VibecodingMode;
  onPick: (p: string) => void;
}) {
  const starter = STARTERS[mode];
  return (
    <div className="mx-auto max-w-2xl pt-10 md:pt-16 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center justify-center rounded-md"
          style={{
            width: 28,
            height: 28,
            background: "var(--gradient-hot)",
            boxShadow: "0 2px 10px -2px rgba(249,112,102,0.55)",
          }}
        >
          <Sparkles size={14} strokeWidth={2} color="white" />
        </span>
        <div
          className="text-[11px] mono uppercase tracking-wider"
          style={{ color: "var(--subtle)" }}
        >
          // vibecoding · {mode} · с чего начнём
        </div>
      </div>

      <h2 className="text-[22px] md:text-[26px] font-bold tracking-tight leading-tight mb-2">
        {starter.title}
      </h2>
      <p
        className="text-[13.5px] leading-relaxed mb-6"
        style={{ color: "var(--muted)" }}
      >
        {starter.subtitle}
      </p>

      <div
        className="text-[10px] mono uppercase tracking-wider mb-2"
        style={{ color: "var(--subtle)" }}
      >
        попробуй с этого:
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {starter.suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(s)}
            className={cn(
              "card card-hover text-left p-3 text-[13px] leading-relaxed transition group"
            )}
            style={{ color: "var(--content)" }}
          >
            <span className="opacity-90 group-hover:opacity-100">{s}</span>
          </button>
        ))}
      </div>

      <p className="text-[11px] mt-6 mono" style={{ color: "var(--subtle)" }}>
        или напиши что-то своё внизу ↓
      </p>
    </div>
  );
}

function placeholderFor(mode: VibecodingMode): string {
  switch (mode) {
    case "explain":
      return "Какой концепт объяснить? Например: Subagents vs Skills.";
    case "chat":
      return "Что на столе — задача, идея или сомнение?";
    case "review":
      return "Кинь код / скилл / промпт для ревью…";
    case "recipe":
      return "Что хочешь построить? Опиши результат.";
    case "debrief":
      return "URL radar-item или название…";
    case "challenge":
      return "Квест на что? Или просто «дай квест под мой уровень».";
  }
}
