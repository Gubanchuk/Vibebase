"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  Eye,
  Pencil,
  LayoutTemplate,
  Link2,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  getEntry,
  upsertEntry,
  removeEntry,
} from "@/lib/domains/journal/store";
import type { Backlink, JournalEntry } from "@/lib/domains/journal/types";
import { resolveTemplateBody, type JournalTemplate } from "@/lib/domains/journal/templates";
import { TemplatePicker } from "./TemplatePicker";
import { BacklinkPicker } from "./BacklinkPicker";
import { SavedIndicator, type SaveStatus } from "./SavedIndicator";
import { cn } from "@/lib/cn";

interface EditorProps {
  entryId: string;
  initialEdit?: boolean;
}

const AUTOSAVE_DEBOUNCE = 2000;

export function JournalEditor({ entryId, initialEdit = false }: EditorProps) {
  const router = useRouter();
  const [entry, setEntry] = React.useState<JournalEntry | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(initialEdit);
  // Split view removed from UX — оставлено только как internal флаг на случай
  // если захотим вернуть по ⌘-хоткею. По-умолчанию — просто одна колонка:
  // либо preview, либо textarea, без параллели.
  const [splitPreview] = React.useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [backlinkPickerOpen, setBacklinkPickerOpen] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [status, setStatus] = React.useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const debounceTimer = React.useRef<number | null>(null);

  // Load on mount
  React.useEffect(() => {
    const loaded = getEntry(entryId);
    setEntry(loaded);
    setLoaded(true);
    if (loaded) {
      setSavedAt(loaded.updatedAt);
      setStatus("saved");
    }
  }, [entryId]);

  const flushSave = React.useCallback(
    (draft: JournalEntry) => {
      setStatus("saving");
      const nextUpdatedAt = new Date().toISOString();
      const toSave: JournalEntry = { ...draft, updatedAt: nextUpdatedAt };
      upsertEntry(toSave);
      setEntry(toSave);
      setSavedAt(nextUpdatedAt);
      setStatus("saved");
    },
    []
  );

  const scheduleAutosave = React.useCallback(
    (draft: JournalEntry) => {
      setStatus("dirty");
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = window.setTimeout(() => {
        flushSave(draft);
        debounceTimer.current = null;
      }, AUTOSAVE_DEBOUNCE);
    },
    [flushSave]
  );

  // Clear timer on unmount; best-effort sync flush
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const updateEntry = (patch: Partial<JournalEntry>) => {
    setEntry((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      scheduleAutosave(next);
      return next;
    });
  };

  const handleSaveNow = () => {
    if (!entry) return;
    if (debounceTimer.current !== null) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    flushSave(entry);
  };

  const insertAtCursor = (textToInsert: string) => {
    if (!entry) return;
    const el = textareaRef.current;
    const current = entry.contentMd;
    let next: string;
    let caret: number;
    if (el) {
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
      next = current.slice(0, start) + textToInsert + current.slice(end);
      caret = start + textToInsert.length;
    } else {
      next = current + (current.endsWith("\n") ? "" : "\n") + textToInsert;
      caret = next.length;
    }
    updateEntry({ contentMd: next });
    // defer caret restore until after re-render
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (node) {
        node.focus();
        node.setSelectionRange(caret, caret);
      }
    });
  };

  const handlePickTemplate = (t: JournalTemplate) => {
    setTemplatePickerOpen(false);
    const body = resolveTemplateBody(t.body);
    const prefix = entry && entry.contentMd && !entry.contentMd.endsWith("\n") ? "\n\n" : "";
    insertAtCursor(prefix + body + "\n");
    if (entry && !entry.templatesUsed.includes(t.id)) {
      updateEntry({ templatesUsed: [...entry.templatesUsed, t.id] });
    }
  };

  const handlePickBacklink = (backlink: Backlink, md: string) => {
    setBacklinkPickerOpen(false);
    insertAtCursor(md);
    if (!entry) return;
    const exists = entry.backlinks.some(
      (b) => b.type === backlink.type && b.id === backlink.id
    );
    if (!exists) {
      updateEntry({ backlinks: [...entry.backlinks, backlink] });
    }
  };

  const handleDelete = () => {
    removeEntry(entryId);
    setConfirmDeleteOpen(false);
    router.replace("/journal");
  };

  if (!loaded) {
    return (
      <div className="px-4 md:px-6 py-10 text-[13px]" style={{ color: "var(--muted)" }}>
        Загрузка…
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="px-4 md:px-6 py-10 flex flex-col items-start gap-3">
        <p className="serif-italic text-[22px]">Запись не найдена</p>
        <Button variant="ghost" onClick={() => router.replace("/journal")}>
          <ArrowLeft size={14} strokeWidth={1.9} /> К списку
        </Button>
      </div>
    );
  }

  const title = entry.title;
  const firstChar = title.trim().charAt(0);
  const serifFirst = firstChar && /[A-Za-zА-Яа-яЁё]/.test(firstChar);

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div
        className="sticky top-[49px] z-10 px-4 md:px-6 py-3 flex items-center flex-wrap gap-2 border-b"
        style={{
          background: "rgba(10,10,10,0.82)",
          backdropFilter: "blur(14px)",
          borderColor: "var(--border-2)",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/journal")}
          aria-label="К списку"
        >
          <ArrowLeft size={14} strokeWidth={1.9} />
        </Button>

        <SavedIndicator status={status} savedAt={savedAt} />

        <div className="ml-auto flex items-center flex-wrap gap-1.5">
          <Button
            variant={isEditing ? "secondary" : "primary"}
            size="sm"
            onClick={() => setIsEditing((v) => !v)}
          >
            {isEditing ? <Eye size={13} strokeWidth={1.9} /> : <Pencil size={13} strokeWidth={1.9} />}
            {isEditing ? "Готово" : "Редактировать"}
          </Button>

          {isEditing ? (
            <Popover open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LayoutTemplate size={13} strokeWidth={1.9} />
                  Template <span aria-hidden>▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto">
                <TemplatePicker onPick={handlePickTemplate} />
              </PopoverContent>
            </Popover>
          ) : null}

          {isEditing ? (
            <Popover open={backlinkPickerOpen} onOpenChange={setBacklinkPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Link2 size={13} strokeWidth={1.9} />
                  Backlink <span aria-hidden>▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto">
                <BacklinkPicker onPick={handlePickBacklink} />
              </PopoverContent>
            </Popover>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
            aria-label="Удалить запись"
          >
            <Trash2 size={13} strokeWidth={1.9} />
          </Button>

          <Button variant="primary" size="sm" onClick={handleSaveNow}>
            Save
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 md:px-8 pt-6 md:pt-10">
        {isEditing ? (
          <input
            value={title}
            placeholder="Заголовок"
            onChange={(e) => updateEntry({ title: e.target.value })}
            className={cn(
              "w-full bg-transparent border-0 outline-none",
              "text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight",
              "placeholder:text-[color:var(--subtle)]",
              serifFirst ? "first-letter:font-[var(--font-instrument)] first-letter:italic first-letter:font-normal" : ""
            )}
          />
        ) : (
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight">
            {title || <span className="serif-italic" style={{ color: "var(--subtle)" }}>Без названия</span>}
          </h1>
        )}

        {entry.backlinks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.backlinks.map((b) => (
              <Chip key={`${b.type}-${b.id}`} tone="violet" className="text-[11px]">
                {b.label}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div
        className={cn(
          "px-4 md:px-8 pt-5 pb-24 flex-1 min-h-[60dvh]",
          isEditing && splitPreview
            ? "grid grid-cols-1 md:grid-cols-2 gap-6"
            : "max-w-[760px] w-full"
        )}
      >
        {isEditing ? (
          <EditorPane
            value={entry.contentMd}
            onChange={(v) => updateEntry({ contentMd: v })}
            textareaRef={textareaRef}
          />
        ) : null}
        {(!isEditing || splitPreview) && (
          <PreviewPane markdown={entry.contentMd} />
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Запись &laquo;{title || "Без названия"}&raquo; исчезнет из дневника.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="ghost">Отмена</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleDelete}
              className="bg-[color:var(--danger)] hover:opacity-90"
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditorPane({
  value,
  onChange,
  textareaRef,
}: {
  value: string;
  onChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck
      placeholder="Напиши что-нибудь. Markdown поддерживается."
      className="w-full min-h-[60dvh] bg-transparent outline-none resize-none border-0 p-0 text-[13.5px] leading-[1.7] placeholder:text-[color:var(--subtle)]"
      style={{ color: "var(--content)" }}
    />
  );
}

function PreviewPane({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return (
      <div
        className="text-[14px] serif-italic"
        style={{ color: "var(--subtle)" }}
      >
        Пусто — превью появится, когда будет текст.
      </div>
    );
  }
  return (
    <article className="prose-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
