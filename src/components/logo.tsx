export function Logo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" className="fill-foreground" />
      <path d="M8 5.5h5.5L17 9v9.5H8z" className="fill-background" />
      <path d="M13.5 5.5V9H17" className="fill-foreground/25" />
    </svg>
  );
}
