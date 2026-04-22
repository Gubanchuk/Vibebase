"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "w-full px-3 py-2 text-[13px] rounded-md",
      "bg-[color:var(--surface-2)] border border-[color:var(--border)]",
      "text-[color:var(--content)] placeholder:text-[color:var(--subtle)]",
      "outline-none transition focus:border-[color:var(--coral)] focus:ring-1 focus:ring-[color:var(--coral)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full px-3 py-2 text-[13px] rounded-md resize-none leading-relaxed",
      "bg-[color:var(--surface-2)] border border-[color:var(--border)]",
      "text-[color:var(--content)] placeholder:text-[color:var(--subtle)]",
      "outline-none transition focus:border-[color:var(--coral)] focus:ring-1 focus:ring-[color:var(--coral)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
