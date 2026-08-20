"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MobileInput({
  className,
  onChange,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      maxLength={10}
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border-border bg-surface px-3 text-sm text-text-primary shadow-none transition",
        "placeholder:text-text-muted",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        className,
      )}
      onChange={(e) => {
        // Allow numbers only
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);

        // Update the input value
        e.target.value = value;

        // Keep React Hook Form working
        onChange?.(e);
      }}
    />
  );
}
