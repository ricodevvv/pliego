import { cn } from "@/lib/utils";

/**
 * The Pliego app icon: a sheet whose folded flap makes the bowl of a P, on an orange tile.
 */
export function Logo({ className = "size-7", intro = false }: { className?: string; intro?: boolean }) {
  return (
    <span className={cn("app-icon logo-mark grid shrink-0 place-items-center overflow-hidden rounded-[22.5%]", intro && "logo-intro", className)} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="size-full">
        <path d="M9 6.5h8.5v19H10a1 1 0 0 1-1-1z" fill="#fff" />
        <g className="logo-flap">
          <path d="M17.5 6.5 24.6 8.6a.6.6 0 0 1 .4.6v7.9a.6.6 0 0 1-.45.58L17.5 19.5z" fill="#fff" opacity=".72" />
          <path d="M17.5 6.5 19.4 7.06v11.9l-1.9.54z" fill="#b8380a" opacity=".35" />
        </g>
      </svg>
    </span>
  );
}
