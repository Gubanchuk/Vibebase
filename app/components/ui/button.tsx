"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "secondary";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "ghost" && "btn-ghost",
          variant === "secondary" && "btn-secondary",
          size === "sm" && "btn-sm",
          size === "lg" && "btn-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
