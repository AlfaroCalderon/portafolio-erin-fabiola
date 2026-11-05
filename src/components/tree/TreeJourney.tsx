"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Author, PortfolioData, Project } from "@/types/portfolio";
import { useStudio } from "@/context/HistoryContext";
import { Typed } from "../studio/Intro";
import BranchStop from "./BranchStop";
import FallingLeaves from "./FallingLeaves";
import TreeWorld from "./TreeWorld";
import { BRANCHES, CARD_SLIDE_PX, COPA, FOCUS_Y, FOCUS_Y_MOBILE, MOBILE_BP, ROOTS, SCROLL_VH_PER_UNIT, SCRUB, WORLD_VH, cameraY, totalUnits } from "./treeConfig";

const reducedMotion = {
  subscribe: (cb: () => void) => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  },
  get: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

export default function TreeJourney({ d, a, open }: { d: PortfolioData; a: Author; open: (p: Project) => void }) {
  const { replay } = useStudio();
  const reduced = useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, () => false);
  const root = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const copa = useRef<HTMLDivElement>(null);
  const cards = useRef<Record<string, HTMLDivElement | null>>({});
  const pillars = useMemo(() => Object.fromEntries(d.sections.map((s) => [s.id, s])), [d]);

  useEffect(() => {
    if (reduced || !root.current || !world.current || !copa.current) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true }); // evita saltos por la barra del navegador móvil

    const ctx = gsap.context(() => {
      const focus = () => (window.innerWidth < MOBILE_BP ? FOCUS_Y_MOBILE : FOCUS_Y);
      const stops = BRANCHES.map((b) => cards.current[b.id]!);
      stops.forEach((st, i) => {
        const dir = BRANCHES[i].side === "right" ? 1 : -1;
        gsap.set(st, { autoAlpha: 0 });
        gsap.set(st.querySelector(".js-card"), { y: CARD_SLIDE_PX, x: dir * 30 });
        gsap.set(st.querySelector(".js-preview"), { y: CARD_SLIDE_PX, x: -dir * 30 });
      });
      gsap.set(world.current, { y: 0 }); // ★ la cámara SIEMPRE empieza en la copa (cielo)

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${(totalUnits() * SCROLL_VH_PER_UNIT * window.innerHeight) / 100}`, // ★ largo del pin
          pin: true, // fija la pantalla durante todo el descenso
          scrub: SCRUB, // ★ suavizado: caída controlada
          anticipatePin: 1,
          invalidateOnRefresh: true, // recalcula posiciones al rotar/redimensionar
        },
      });

      // 1) COPA: se queda visible y luego se desvanece
      tl.to({}, { duration: COPA.hold });
      tl.to(copa.current, { autoAlpha: 0, y: -40, duration: COPA.fade, ease: "power1.in" });

      // 2) RAMAS: viaje → fade-in → pausa (pinning) → fade-out
      BRANCHES.forEach((b, i) => {
        const st = stops[i];
        const card = st.querySelector(".js-card"), prev = st.querySelector(".js-preview");
        tl.addLabel(b.id);
        tl.to(world.current, { y: () => cameraY(b.worldY, focus()), duration: b.travel, ease: "power1.inOut" }); // ★ viaje
        tl.to(st, { autoAlpha: 1, duration: b.fadeIn, ease: "power2.out" }); // ★ aparición del contenedor
        tl.to(card, { x: 0, y: 0, duration: b.fadeIn, ease: "power2.out" }, "<"); // tarjeta entra desde su lado
        tl.to(prev, { x: 0, y: 0, duration: b.fadeIn, ease: "power2.out" }, "<0.15"); // vista previa entra un poco después
        tl.to({}, { duration: b.hold }); // ★ pausa leyendo
        tl.to(st, { autoAlpha: 0, duration: b.fadeOut, ease: "power2.in" }); // ★ salida
        tl.to([card, prev], { y: -CARD_SLIDE_PX, duration: b.fadeOut, ease: "power2.in" }, "<");
      });

      // 3) RAÍCES: la cámara llega al fondo del árbol y se libera el pin
      tl.to(world.current, { y: () => -(WORLD_VH - 100) * (window.innerHeight / 100), duration: ROOTS.travel, ease: "power1.inOut" });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      id="arbol"
      data-step="Descender por el árbol"
      className={`relative bg-gradient-to-b from-rosa/40 via-white to-white ${reduced ? "px-4 py-24" : "h-svh overflow-hidden"}`}
    >
      {!reduced && <TreeWorld ref={world} />}

      {/* COPA (Hero) */}
      <div ref={copa} className={`copa-text z-10 flex flex-col items-center justify-center gap-6 px-6 text-center ${reduced ? "relative pb-12" : "absolute inset-x-0 top-0 h-svh pt-20"}`}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_52%_36%_at_50%_52%,rgba(255,255,255,.9),rgba(255,255,255,.6)_55%,transparent_82%)]" />
        <p className="font-mono text-[11px] uppercase tracking-[.25em] text-ink [text-shadow:0_0_10px_#fff,0_0_4px_#fff]">
          {a.name} • {a.role}
        </p>
        <h1 className="relative font-sans text-[11vw] uppercase leading-[.86] tracking-tighter [text-shadow:0_0_26px_#fff,0_0_10px_#fff] md:text-[7vw]">
          <Typed replay={replay} />
        </h1>
        <p className="max-w-md font-serif text-xl leading-snug [text-shadow:0_0_14px_#fff,0_0_6px_#fff]">
          <b>{a.quote.text}</b> <em className="text-muted">— {a.quote.author}</em>
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-vino [text-shadow:0_0_10px_#fff,0_0_4px_#fff]">Desciende por el tronco ↓</p>
      </div>

      {!reduced && <div aria-hidden className="night-veil pointer-events-none absolute inset-0 z-[6]" />}
      <FallingLeaves />

      {/* PARADAS DE LAS RAMAS (tarjeta + vista previa; posicionadas en BranchStop) */}
      {BRANCHES.map((b) => (
        <BranchStop
          key={b.id}
          ref={(el) => {
            cards.current[b.id] = el;
          }}
          b={b}
          pillar={pillars[b.pillar]}
          projects={d.projects.filter((p) => p.section === b.pillar)}
          open={open}
          flat={reduced}
        />
      ))}
    </section>
  );
}
