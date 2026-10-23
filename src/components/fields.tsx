"use client";

import { cn } from "@/lib/utils";

export const inputClass =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Options({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 rounded-xl border bg-background p-5 sm:grid-cols-2">{children}</div>;
}

/**
 * A row of mutually exclusive choices, like a segmented control.
 */
export function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; hint?: string }[];
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)}>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="flex min-w-0 flex-1 flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-accent active:scale-[0.98] aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:shadow-[inset_0_0_0_1px_var(--brand)]"
          >
            <span className="font-medium whitespace-nowrap">{option.label}</span>
            {option.hint && <span className="text-xs text-muted-foreground">{option.hint}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Range({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (n: number) => String(n),
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex justify-between text-sm font-medium">
        {label}
        <span className="font-normal text-muted-foreground tabular-nums">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="accent-brand" />
    </label>
  );
}
