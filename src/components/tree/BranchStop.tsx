"use client";

import Image from "next/image";
import { CSSProperties, forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Project, SectionPillar } from "@/types/portfolio";
import { ease, pad } from "../studio/kit";
import { Branch } from "./treeConfig";

/**
 * Una "parada" = tarjeta de información (junto a la rama) + vista previa grande (al otro lado del tronco).
 * Posiciones (escritorio): borde de la tarjeta a 5vw del tronco = GAP_VW de treeConfig.
 * Móvil: tarjeta ancha debajo del punto de anclaje (top-[29svh] ≈ FOCUS_Y_MOBILE + 5).
 * GSAP anima el contenedor (.js-stop) y los hijos .js-card / .js-preview (ver TreeJourney).
 */
const CARD_SIDE = { right: "md:left-[calc(50%+5vw)]", left: "md:right-[calc(50%+5vw)]" } as const;
const PREV_SIDE = { right: "md:right-[calc(50%+5vw)]", left: "md:left-[calc(50%+5vw)]" } as const;

type Props = { b: Branch; pillar: SectionPillar; projects: Project[]; open: (p: Project) => void; flat?: boolean };

const BranchStop = forwardRef<HTMLDivElement, Props>(function BranchStop({ b, pillar, projects, open, flat }, ref) {
  const [hov, setHov] = useState(projects[0].id);
  const cur = projects.find((p) => p.id === hov) ?? projects[0];
  const c = pillar.accentColor;

  return (
    <div
      ref={ref}
      data-stop={b.id}
      className={flat ? "relative mx-auto my-8 w-full max-w-2xl" : "js-stop pointer-events-none invisible absolute inset-0 z-20 opacity-0"}
    >
      {/* TARJETA PRINCIPAL: identidad del pilar + lista de proyectos */}
      <article
        data-card={b.id}
        className={`js-card pointer-events-auto border-2 border-ink bg-white p-5 shadow-[10px_10px_0_#231F20] md:p-8 ${
          flat ? "relative" : `absolute inset-x-4 top-[29svh] max-h-[66svh] overflow-y-auto overscroll-contain md:inset-x-auto md:top-1/2 md:max-h-[86svh] md:w-[min(42rem,43vw)] md:-translate-y-1/2 ${CARD_SIDE[b.side]}`
        }`}
        style={{ borderTopColor: c, borderTopWidth: 10 }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[.28em] text-muted">{b.label}</p>
        <div className="mt-1 flex items-baseline gap-4">
          <h2 className="font-sans text-5xl font-black uppercase leading-[.85] tracking-tighter md:text-7xl" style={{ color: c }}>{pillar.name}</h2>
          <span className="font-serif text-2xl italic md:text-3xl">{pillar.translation}</span>
        </div>
        <p className="mt-4 font-serif text-xl leading-snug md:text-[1.3rem]">{pillar.concept}</p>
        <p className="mt-2 font-serif text-base leading-snug text-muted md:text-[1.05rem]">{pillar.description}</p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest" style={{ color: c }}>{pillar.discipline}</p>

        <ul className="mt-4 border-t-2 border-ink">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => open(p)}
                onMouseEnter={() => setHov(p.id)}
                onFocus={() => setHov(p.id)}
                className={`group flex w-full cursor-pointer items-center gap-4 border-b border-ink/15 px-2 py-2 text-left transition-colors ${hov === p.id ? "text-white" : ""}`}
                style={{ backgroundColor: hov === p.id ? c : undefined } as CSSProperties}
              >
                <span className="relative size-12 shrink-0 overflow-hidden border border-ink/20 bg-white">
                  <Image src={p.primaryCutout || p.images.cover} alt="" fill sizes="48px" className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-sans text-base font-extrabold uppercase leading-tight tracking-tight md:text-lg">{p.title}</span>
                  <span className={`mt-0.5 block font-serif text-sm italic ${hov === p.id ? "text-white/85" : "text-muted"}`}>{p.category}</span>
                </span>
                <span className="font-mono text-xs font-bold">P.{pad(p.pageStart)}</span>
                <span className="font-mono text-lg transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </button>
            </li>
          ))}
        </ul>
      </article>

      {/* VISTA PREVIA GRANDE: cambia al pasar el cursor por la lista (solo escritorio) */}
      <aside
        className={`js-preview pointer-events-auto hidden border-2 border-ink bg-white p-4 shadow-[10px_10px_0_#231F20] md:block ${
          flat ? "mt-6 !block" : `absolute top-1/2 w-[min(30rem,34vw)] -translate-y-1/2 ${PREV_SIDE[b.side]}`
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden border border-ink/20" style={{ backgroundColor: pillar.accentBg }}>
          <AnimatePresence mode="wait">
            <motion.div key={cur.id} initial={{ opacity: 0, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ ease, duration: 0.45 }} className="absolute inset-0">
              <Image src={cur.primaryCutout || cur.images.cover} alt={cur.title} fill sizes="480px" className="object-contain p-4" />
            </motion.div>
          </AnimatePresence>
          <span className="absolute left-3 top-3 bg-ink px-2 py-0.5 font-mono text-[10px] text-white">№ {cur.number}</span>
        </div>
        <h3 className="mt-4 font-sans text-2xl font-black uppercase leading-[.92] tracking-tighter">{cur.title}</h3>
        <p className="mt-2 line-clamp-4 font-serif text-lg leading-snug">{cur.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cur.tags.slice(0, 4).map((t) => (
            <kbd key={t} className="border border-ink px-2 py-0.5 font-mono text-[10px]">{t}</kbd>
          ))}
        </div>
        <button onClick={() => open(cur)} className="mt-4 w-full cursor-pointer py-2.5 font-mono text-[11px] uppercase tracking-widest text-white transition-opacity hover:opacity-85" style={{ backgroundColor: c }}>
          Leer la obra completa ↗
        </button>
      </aside>
    </div>
  );
});

export default BranchStop;
