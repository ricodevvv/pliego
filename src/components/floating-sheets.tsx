const SHEETS = [
  { left: "6%", top: "18%", size: 64, turn: -12, speed: 10, delay: 0 },
  { left: "14%", top: "62%", size: 44, turn: 8, speed: 12, delay: -3 },
  { left: "82%", top: "14%", size: 56, turn: 14, speed: 11, delay: -6 },
  { left: "88%", top: "58%", size: 72, turn: -6, speed: 13, delay: -2 },
  { left: "72%", top: "80%", size: 36, turn: 20, speed: 9, delay: -5 },
];

/**
 * A few blank sheets drifting slowly behind the hero, each with a folded corner.
 */
export function FloatingSheets() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      {SHEETS.map((sheet, index) => (
        <svg
          key={index}
          viewBox="0 0 30 38"
          className="sheet absolute opacity-70"
          style={
            {
              left: sheet.left,
              top: sheet.top,
              width: sheet.size,
              "--turn": `${sheet.turn}deg`,
              "--speed": `${sheet.speed}s`,
              "--delay": `${sheet.delay}s`,
            } as React.CSSProperties
          }
        >
          <path d="M1.5 1.5h19l8 8v27h-27z" className="fill-background stroke-border" strokeWidth="1" />
          <path d="M20.5 1.5v8h8" className="fill-muted stroke-border" strokeWidth="1" />
          <path d="M6 15h17M6 20h17M6 25h11" className="stroke-border" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}
