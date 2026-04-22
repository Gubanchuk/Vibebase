"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RotateCw, Save, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Textarea } from "@/components/ui/input";
import { readTextStream } from "@/lib/core/stream-http";
import { saveSkillLessonAction } from "@/app/(app)/skills/lessons-actions";

type Status = "idle" | "streaming" | "ready" | "error";

export function LessonGenerateDialog({
  open,
  onOpenChange,
  skillId,
  skillSlug,
  skillName,
  nodeId,
  nodeTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  skillId: string;
  skillSlug: string;
  skillName: string;
  nodeId: string;
  nodeTitle: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);

  const run = React.useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setContent("");
    setStatus("streaming");
    setEditing(false);

    try {
      const res = await fetch(
        `/api/skills/${encodeURIComponent(skillId)}/lessons/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId, nodeTitle, skillName }),
          signal: ctrl.signal,
        }
      );
      if (!res.ok) {
        setStatus("error");
        setContent(`Error: ${res.status} ${res.statusText}`);
        return;
      }
      let acc = "";
      for await (const chunk of readTextStream(res)) {
        acc += chunk;
        setContent(acc);
      }
      setStatus("ready");
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setStatus("error");
      setContent((prev) => prev || "Что-то пошло не так при генерации.");
    }
  }, [skillId, skillName, nodeId, nodeTitle]);

  // Auto-start when the dialog opens for a fresh node.
  React.useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }
    if (status === "idle") {
      void run();
    }
    // We intentionally do not re-run on every render — only when `open` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset when the dialog closes so re-opening on a different node starts fresh.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      abortRef.current?.abort();
      setStatus("idle");
      setContent("");
      setEditing(false);
      setDraft("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        side="center"
        className="w-[min(760px,94vw)] max-h-[88dvh] flex flex-col"
        aria-describedby={undefined}
      >
        <div className="flex items-start gap-3 pr-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Chip tone="violet" mono>
                ✨ lesson-gen
              </Chip>
              <Chip mono>{skillName}</Chip>
              {status === "streaming" ? (
                <span className="chip chip-coral mono">
                  <span className="stream-dot" />
                  Streaming...
                </span>
              ) : status === "ready" ? (
                <Chip tone="success" mono>
                  ● Ready
                </Chip>
              ) : status === "error" ? (
                <Chip tone="danger" mono>
                  error
                </Chip>
              ) : null}
            </div>
            <DialogTitle className="text-[20px] leading-tight">
              <span className="serif-italic text-[22px]">{nodeTitle}</span>
            </DialogTitle>
            <DialogDescription>
              Сгенерированный AI урок. Правь, регенери или сохраняй.
            </DialogDescription>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={run}
            disabled={status === "streaming"}
          >
            <RotateCw size={13} strokeWidth={2} />
            Regenerate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!editing) setDraft(content);
              setEditing((v) => !v);
            }}
            disabled={status === "streaming"}
          >
            <Pencil size={13} strokeWidth={2} />
            {editing ? "Preview" : "Edit"}
          </Button>
          <div className="flex-1" />
          {status === "streaming" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                abortRef.current?.abort();
                setStatus("ready");
              }}
            >
              <X size={13} strokeWidth={2} />
              Stop
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            disabled={status === "streaming" || saving}
            onClick={async () => {
              const finalMd = editing ? draft : content;
              if (!finalMd.trim()) {
                toast.error("Урок пустой, нечего сохранять");
                return;
              }
              setSaving(true);
              try {
                const res = await saveSkillLessonAction({
                  skillSlug,
                  nodeId,
                  title: nodeTitle,
                  contentMd: finalMd,
                });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Урок сохранён");
                if (editing) setContent(draft);
                handleOpenChange(false);
                router.refresh();
              } finally {
                setSaving(false);
              }
            }}
          >
            <Save size={13} strokeWidth={2} />
            {saving ? "Сохраняю…" : "Сохранить"}
          </Button>
        </div>

        <div
          className="mt-3 flex-1 overflow-y-auto scrollbar-slim rounded-md border p-4"
          style={{
            borderColor: "var(--border-2)",
            background: "var(--surface-2)",
            minHeight: 240,
          }}
        >
          {editing ? (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={18}
              className="min-h-[320px] bg-transparent border-0 focus:ring-0 focus:border-0 mono text-[16px] md:text-[12.5px]"
            />
          ) : (
            <div className="prose-md">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p style={{ color: "var(--subtle)" }}>
                  Ожидание первых токенов...
                </p>
              )}
              {status === "streaming" ? (
                <span className="stream-caret" aria-hidden />
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
