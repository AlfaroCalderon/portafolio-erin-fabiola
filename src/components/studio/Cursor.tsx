"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { useStudio } from "@/context/HistoryContext";

const N = 90;
const SPIRAL = "M" + Array.from({ length: N }, (_, i) => {
  const a = (i / (N - 1)) * Math.PI * 7, r = 0.6 + a * 0.62;
  return `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
}).join("L");

const PETAL = (() => {
  const L = 36, W = 11.5, side = Array.from({ length: 29 }, (_, i) => {
    const s = i / 28;
    return [W * Math.sin(Math.PI * Math.pow(s, 0.8)) * (1 + 0.09 * Math.sin(s * 34 + 1)), -L * s];
  });
  return "M" + [...side, ...[...side].reverse().map(([x, y]) => [-x, y])].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
})();

const INTERACTIVE = "a,button,img,picture,input,textarea,select,summary,label,[role=button],[data-cursor]";
const hasText = (el: Element) => [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 0);

export default function Cursor() {
  const { mx, my } = useStudio();
  const x = useSpring(mx, { stiffness: 520, damping: 38, mass: 0.35 });
  const y = useSpring(my, { stiffness: 520, damping: 38, mass: 0.35 });
  const [bloom, setBloom] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      setBloom(!!t && !!(t.closest?.(INTERACTIVE) || hasText(t)));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerdown", dn);
    document.addEventListener("pointerup", up);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", dn);
      document.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <motion.div aria-hidden style={{ x, y, marginLeft: -40, marginTop: -40 }} className="cursor-root pointer-events-none fixed left-0 top-0 z-[200] size-20">
      <svg viewBox="-40 -40 80 80" className={`size-full overflow-visible transition-transform duration-200 ${bloom ? "bloom" : ""}`} style={{ transform: down ? "scale(.82)" : undefined }}>
        <g className="spiral">
          <g className="spin">
            <path d={SPIRAL} fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={SPIRAL} fill="none" stroke="#8b2354" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        <g className="flower">
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k} transform={`rotate(${k * 72})`}>
              <g className="petal" style={{ ["--i" as string]: k }}>
                <path d={PETAL} fill="#fff" stroke="#8b2354" strokeWidth="1" strokeLinejoin="round" />
                <path d="M0 -6V-28M0 -14L-3.5 -21M0 -14L3.5 -21" stroke="#e8b8c8" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>
            </g>
          ))}
          <g className="heart">
            <circle r="6.5" fill="#aa9821" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <circle key={k} cx={Math.cos((k * Math.PI) / 4) * 4.2} cy={Math.sin((k * Math.PI) / 4) * 4.2} r="1" fill="#8b2354" />
            ))}
          </g>
        </g>
      </svg>
    </motion.div>
  );
}
