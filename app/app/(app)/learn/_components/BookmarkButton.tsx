"use client";

import * as React from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { toggleBookmarkAction } from "../annotations-actions";

/**
 * Кнопка-закладка с оптимистичным апдейтом. Клик не всплывает к Link
 * родителя (stopPropagation).
 */
export function BookmarkButton({
  topicId,
  initial,
  className,
}: {
  topicId: string;
  initial: boolean;
  className?: string;
}) {
  const [isBookmarked, setIsBookmarked] = React.useState(initial);
  const [pending, setPending] = React.useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
    setPending(true);
    try {
      const res = await toggleBookmarkAction(topicId);
      if (!res.ok) {
        setIsBookmarked(!next);
        toast.error(res.error);
      } else {
        setIsBookmarked(res.annotation.isBookmarked);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Убрать из избранного" : "Добавить в избранное"}
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-md transition",
        "hover:bg-[color:var(--surface-2)]",
        pending && "opacity-60",
        className
      )}
      title={isBookmarked ? "В избранном" : "Добавить в избранное"}
    >
      <Bookmark
        size={14}
        strokeWidth={2}
        fill={isBookmarked ? "var(--amber)" : "none"}
        color={isBookmarked ? "var(--amber)" : "var(--subtle)"}
      />
    </button>
  );
}
