"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "center" | "right";
  }
>(({ className, side = "center", children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in"
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 card scrollbar-slim",
        // center: on mobile take almost full width (16px gutter), becomes clamped on sm+
        side === "center" &&
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-16px)] sm:w-[min(640px,92vw)] max-h-[85dvh] overflow-y-auto p-4 sm:p-5 rounded-xl",
        // right: on mobile becomes a bottom sheet (easier one-hand reach),
        // on sm+ reverts to the original right-side drawer
        side === "right" &&
          "right-0 bottom-0 top-auto h-[85dvh] w-full rounded-t-xl rounded-b-none border-t border-[color:var(--border)] border-l-0 border-r-0 overflow-y-auto p-4 sm:p-5 sm:top-0 sm:bottom-auto sm:h-dvh sm:w-[min(480px,96vw)] sm:rounded-none sm:rounded-l-xl sm:border-t-0 sm:border-l sm:border-r-0",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-2 top-2 rounded p-2 min-w-11 min-h-11 flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--content)] hover:bg-[color:var(--surface-2)]"
        style={{
          marginTop: "env(safe-area-inset-top, 0px)",
          marginRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <X size={16} />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[17px] font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-[12.5px] text-[color:var(--muted)] mt-1", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
