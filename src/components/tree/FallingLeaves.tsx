import { CSSProperties } from "react";

/** Hojas ambientales que caen por toda la pantalla (CSS puro, valores fijos = sin desajustes de hidratación). */
const COLORS = ["#AA9821", "#6F6B30", "#8B2354", "#E8B8C8", "#7D7A38"];
const N = 9; // ★ cuántas hojas caen a la vez

export default function FallingLeaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {Array.from({ length: N }, (_, i) => (
        <svg
          key={i}
          viewBox="-10 -42 20 44"
          className="fall absolute top-0 w-4 opacity-70 md:w-5"
          style={
            {
              left: `${6 + i * 10.5}%`,
              fill: COLORS[i % COLORS.length],
              "--dur": `${15 + i * 2.3}s`, // ★ velocidad de caída
              animationDelay: `${-i * 3.1}s`,
              "--dx": `${(i % 2 ? 1 : -1) * (5 + i * 1.5)}vw`,
              "--rot": `${(i % 2 ? 1 : -1) * (220 + i * 35)}deg`,
            } as CSSProperties
          }
        >
          <path d="M0 0C-9-8-8-26 0-40C8-26 9-8 0 0Z" />
        </svg>
      ))}
    </div>
  );
}
