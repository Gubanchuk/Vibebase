import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "coral" | "violet" | "amber" | "success" | "danger";

export function Chip({
  tone = "neutral",
  className,
  mono = false,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; mono?: boolean }) {
  return (
    <span
      className={cn(
        "chip",
        tone === "coral" && "chip-coral",
        tone === "violet" && "chip-violet",
        tone === "amber" && "chip-amber",
        tone === "success" && "chip-success",
        tone === "danger" && "chip-danger",
        mono && "mono",
        className
      )}
      {...props}
    />
  );
}
