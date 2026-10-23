"use client";

import { cn } from "@/lib/utils";

export const inputClass =
  "h-11 w-full rounded-[10px] bg-fill px-3 text-[17px] outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand/50";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="text-[13px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Options({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 rounded-2xl bg-cell p-5 sm:grid-cols-2">{children}</div>;
}

/**
 * An iOS-style segmented control. When options carry a hint, the selected one's hint shows below.
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
  const selected = options.find((option) => option.value === value);
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)}>
      <legend className="mb-1.5 text-[13px] text-muted-foreground">{label}</legend>
      <div role="radiogroup" className="flex rounded-[9px] bg-fill p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="min-w-0 flex-1 truncate rounded-[7px] px-2 py-1.5 text-[13px] font-medium transition-all duration-200 aria-checked:bg-cell aria-checked:shadow-[0_3px_8px_rgb(0_0_0/12%),0_3px_1px_rgb(0_0_0/4%)]"
          >
            {option.label}
          </button>
        ))}
      </div>
      {selected?.hint && <span className="px-1 text-[13px] text-muted-foreground">{selected.hint}</span>}
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
      <span className="flex justify-between text-[13px] text-muted-foreground">
        {label}
        <span className="tabular-nums">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="accent-brand" />
    </label>
  );
}
