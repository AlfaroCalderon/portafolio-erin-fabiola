"use client";

import { ReactNode, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export const ease = [0.16, 1, 0.3, 1] as const;
export const vp = { once: false, margin: "-120px" };
export const pad = (n: number) => String(n).padStart(2, "0");

export const Reveal = ({ children, className = "", d = 0, y = 70 }: { children: ReactNode; className?: string; d?: number; y?: number }) => (
  <motion.div
    initial={{ opacity: 0, y, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={vp}
    transition={{ ease, duration: 0.9, delay: d }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Words = ({ t, className = "" }: { t: string; className?: string }) => (
  <motion.span className={className} aria-label={t} initial="h" whileInView="v" viewport={vp}>
    {t.split(" ").map((w, i) => (
      <span key={i} aria-hidden className="mr-[.22em] -mb-[.12em] inline-block overflow-hidden pb-[.12em] align-bottom">
        <motion.span
          className="inline-block"
          custom={i}
          variants={{ h: { y: "115%", rotate: 5 }, v: (n: number) => ({ y: 0, rotate: 0, transition: { ease, duration: 0.9, delay: n * 0.05 } }) }}
        >
          {w}
        </motion.span>
      </span>
    ))}
  </motion.span>
);

export const Head = ({ k, t, r }: { k: string; t: string; r?: ReactNode }) => (
  <div className="mb-12 flex flex-col justify-between gap-6 border-b border-ink pb-8 md:flex-row md:items-end sm:mb-20">
    <div>
      <Reveal y={20}>
        <span className="mb-4 block font-mono text-[11px] uppercase tracking-[.25em] text-vino">{k}</span>
      </Reveal>
      <h2 className="font-sans text-5xl uppercase leading-[.88] tracking-tighter sm:text-7xl lg:text-8xl">
        <Words t={t} />
      </h2>
    </div>
    {r && (
      <Reveal d={0.15} className="max-w-md font-serif text-lg leading-snug text-muted sm:text-xl">
        {r}
      </Reveal>
    )}
  </div>
);

export function Mag({ children, className = "", href }: { children: ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 14, mass: 0.2 });
  const y = useSpring(0, { stiffness: 220, damping: 14, mass: 0.2 });
  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      whileTap={{ scale: 0.92 }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.4);
        y.set((e.clientY - r.top - r.height / 2) * 0.4);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
