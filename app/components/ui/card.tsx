import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  hover = false,
  glow = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; glow?: boolean }) {
  return (
    <div
      className={cn("card", hover && "card-hover", glow && "card-glow", className)}
      {...props}
    />
  );
}
