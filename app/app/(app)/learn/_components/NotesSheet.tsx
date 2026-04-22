"use client";

import * as React from "react";
import { StickyNote } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import { saveNotesAction } from "../annotations-actions";

/**
 * Кнопка «Заметка» + side-sheet с textarea. На мобиле диалог превращается
 * в bottom-sheet (side="right" из dialog.tsx уже так делает).
 */
export function NotesSheet({
  topicId,
  topicTitle,
  initial,
  className,
}: {
  topicId: string;
  topicTitle: string;
  initial: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(initial);
  const [saved, setSaved] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const hasNotes = saved.trim().length > 0;
  const dirty = notes !== saved;

  const onTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await saveNotesAction(topicId, notes);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSaved(res.annotation.personalNotes);
      toast.success("Заметка сохранена");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onTriggerClick}
        aria-label={hasNotes ? "Редактировать заметку" : "Добавить заметку"}
        className={cn(
          "inline-flex items-center gap-1 px-1.5 h-7 rounded-md transition text-[10.5px] mono",
          "hover:bg-[color:var(--surface-2)]",
          hasNotes ? "text-[color:var(--coral)]" : "text-[color:var(--subtle)]",
          className
        )}
      >
        <StickyNote
          size={13}
          strokeWidth={2}
          fill={hasNotes ? "var(--coral-soft)" : "none"}
        />
        {hasNotes ? "заметка" : "заметка"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          side="right"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col"
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Chip mono>
                <StickyNote size={10} strokeWidth={2} />
                заметка
              </Chip>
            </div>
            <DialogTitle>{topicTitle}</DialogTitle>
            <DialogDescription>
              Личная заметка к теме — видна только тебе. Что хочешь помнить,
              где зацепило, куда копать дальше.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Напр.: Present Perfect ломается на 'since' — разобрать примеры с datetime"
            rows={10}
            className="text-[16px] md:text-[13.5px] flex-1 min-h-[200px]"
            maxLength={5000}
            autoFocus
          />

          <div className="flex items-center justify-between pt-3 mt-auto">
            <span
              className="text-[11px] mono"
              style={{ color: "var(--subtle)" }}
            >
              {notes.length}/5000
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setNotes(saved);
                  setOpen(false);
                }}
                disabled={saving}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={onSave}
                disabled={saving || !dirty}
              >
                {saving ? "Сохраняю…" : "Сохранить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
