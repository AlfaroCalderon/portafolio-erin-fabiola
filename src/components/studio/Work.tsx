"use client";

import { CSSProperties, RefObject, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionValue, Reorder, motion, useDragControls, useScroll, useSpring, useTransform } from "framer-motion";
import { PortfolioData, Project } from "@/types/portfolio";
import { useStudio } from "@/context/HistoryContext";
import { ease, pad, vp, Words } from "./kit";

type Open = (p: Project) => void;

function Row({ p, col, i, hov, setHov, open, pinned, pin, onDrag, onEnd }: { p: Project; col: string; i: number; hov: string | null; setHov: (v: string | null) => void; open: Open; pinned: boolean; pin: () => void; onDrag: () => void; onEnd: () => void }) {
  const dc = useDragControls();
  return (
    <Reorder.Item
      value={p.id}
      dragListener={false}
      dragControls={dc}
      animate={{ opacity: hov && hov !== p.id ? 0.2 : 1 }}
      whileDrag={{ scale: 1.02, zIndex: 5, backgroundColor: "#fff", boxShadow: "0 24px 60px rgba(17,17,17,.2)" }}
      onDragStart={onDrag}
      onDragEnd={onEnd}
      onMouseEnter={() => setHov(p.id)}
      onMouseLeave={() => setHov(null)}
      className="relative list-none"
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={vp}
        transition={{ ease, duration: 0.8, delay: (i % 6) * 0.05 }}
        onClick={() => open(p)}
        style={{ "--c": col } as CSSProperties}
        className="group flex cursor-pointer items-center gap-3 border-b border-ink/20 px-3 py-4 transition-colors duration-500 hover:bg-[var(--c)] hover:text-white sm:gap-6 sm:py-5"
      >
        <button
          aria-label="Mover fila"
          onPointerDown={(e) => dc.start(e)}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab touch-none select-none font-mono text-lg opacity-40 hover:opacity-100 active:cursor-grabbing"
        >
          ⠿
        </button>
        <span className="w-10 shrink-0 font-mono text-xs font-bold sm:w-14" style={{ color: pinned ? undefined : col }}>
          P.{pad(p.pageStart)}
        </span>
        <span className="min-w-0 flex-1 font-sans text-2xl font-extrabold uppercase leading-[.95] tracking-tighter transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3 sm:text-4xl lg:text-6xl">
          {p.title}
        </span>
        <span className="hidden w-60 text-right font-serif text-lg italic leading-tight md:block">{p.category}</span>
        <button
          aria-pressed={pinned}
          aria-label={pinned ? "Soltar" : "Fijar"}
          onClick={(e) => {
            e.stopPropagation();
            pin();
          }}
          className={`cursor-pointer font-mono text-xl transition-transform hover:scale-125 ${pinned ? "" : "opacity-40 hover:opacity-100"}`}
        >
          {pinned ? "◆" : "◇"}
        </button>
        <span className="font-mono text-xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
      </motion.div>
    </Reorder.Item>
  );
}

export function Index({ d, open }: { d: PortfolioData; open: Open }) {
  const { s, commit, mx, my } = useStudio();
  const by = useMemo(() => Object.fromEntries(d.projects.map((p) => [p.id, p])), [d]);
  const [hov, setHov] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [live, setLive] = useState<{ sec: string; ids: string[] } | null>(null);
  const sx = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 260, damping: 26, mass: 0.4 });
  const rot = useTransform(() => Math.max(-14, Math.min(14, (mx.get() - sx.get()) * 0.15)));
  const cats = d.sections.map((sec) => ({ sec, ids: s.order.filter((id) => by[id].section === sec.id) }));
  const hp = hov && !drag ? by[hov] : null;
  const hs = hp ? d.sections.find((x) => x.id === hp.section) : null;

  const end = () => {
    setDrag(false);
    if (!live) return;
    const base = cats.find((c) => c.sec.id === live.sec)!;
    if (live.ids.join() !== base.ids.join()) {
      let k = 0;
      commit({ order: s.order.map((id) => (base.ids.includes(id) ? live.ids[k++] : id)) }, "Reordenó " + base.sec.name);
    }
    setLive(null);
  };

  return (
    <section id="index" data-step="Ver el índice" className="relative bg-paper px-6 py-28 sm:px-12 sm:py-40">
      <div className="mb-16 flex flex-col justify-between gap-8 border-b border-ink pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[.25em] text-vino">Directorio Editorial • {d.projects.length} Obras Registradas</p>
          <h2 className="font-sans text-[26vw] font-black lowercase leading-[.75] tracking-tighter lg:text-[20vw]">
            <Words t="index" />
          </h2>
        </div>
        <div className="space-y-4 font-mono text-[11px] uppercase tracking-widest">
          <p className="max-w-xs leading-relaxed text-muted">Arrastra ⠿ para reordenar · ◇ para fijar · Ctrl Z lo deshace</p>
          <div className="flex gap-2">
            {[
              ["Barajar ⤮", () => commit({ order: [...s.order].sort(() => Math.random() - 0.5) }, "Barajó el índice")],
              ["Orden original", () => commit({ order: d.projects.map((p) => p.id) }, "Orden original")],
            ].map(([l, f]) => (
              <motion.button key={l as string} whileTap={{ scale: 0.92 }} onClick={f as () => void} className="cursor-pointer border border-ink px-4 py-2 transition-colors hover:bg-ink hover:text-paper">
                {l as string}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {cats.map(({ sec, ids }) => (
          <div key={sec.id}>
            <h3 className="mb-2 flex items-baseline justify-between border-b-2 border-ink pb-2 font-sans text-2xl font-black uppercase tracking-tight sm:text-4xl">
              <span>
                {sec.name} <span className="font-serif text-xl font-medium normal-case italic text-muted sm:text-3xl">({sec.translation})</span>
              </span>
              <span className="font-mono text-sm" style={{ color: sec.accentColor }}>{pad(ids.length)}</span>
            </h3>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted">{sec.discipline}</p>
            <Reorder.Group axis="y" values={live?.sec === sec.id ? live.ids : ids} onReorder={(v) => setLive({ sec: sec.id, ids: v })}>
              {(live?.sec === sec.id ? live.ids : ids).map((id, i) => (
                <Row
                  key={id}
                  p={by[id]}
                  col={sec.accentColor}
                  i={i}
                  hov={hov}
                  setHov={setHov}
                  open={open}
                  pinned={s.pinned.includes(id)}
                  pin={() => commit({ pinned: s.pinned.includes(id) ? s.pinned.filter((x) => x !== id) : [...s.pinned, id] }, (s.pinned.includes(id) ? "Soltó " : "Fijó ") + by[id].title)}
                  onDrag={() => setDrag(true)}
                  onEnd={end}
                />
              ))}
            </Reorder.Group>
          </div>
        ))}
      </div>

      <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-[55] hidden lg:block">
        <AnimatePresence>
          {hp && hs && (
            <motion.div
              key={hp.id}
              style={{ rotate: rot, backgroundColor: hs.accentBg }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ ease, duration: 0.45 }}
              className="ml-8 mt-8 w-80 border border-ink shadow-[0_30px_70px_rgba(17,17,17,.3)]"
            >
              <div className="flex items-center gap-1.5 border-b border-ink bg-white px-3 py-2">
                {[0, 1, 2].map((k) => (
                  <span key={k} className="size-2 rounded-full border border-ink" />
                ))}
                <span className="ml-2 truncate font-mono text-[10px]">{hp.title}.ai</span>
              </div>
              <div className="relative aspect-[4/3] p-3">
                <Image src={hp.primaryCutout || hp.images.cover} alt={hp.title} fill sizes="320px" className="object-contain p-3" />
              </div>
              <div className="flex justify-between border-t border-ink bg-ink px-3 py-1.5 font-mono text-[10px] text-paper">
                <span>№ {hp.number}</span>
                <span>Pág. {hp.pageStart}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

const MURO: Record<string, string[][]> = {
  radix: [["radix", "raíces", "conacaste", "radix", "raíces"], ["mix media", "collage", "ilustración", "©26", "mix media"], ["memoria", "afecto", "literatura", "memoria", "afecto"]],
  truncus: [["truncus", "tronco", "branding", "truncus", "tronco"], ["arquitectura", "domus", "territorio", "©26", "arquitectura"], ["identidad", "comunidad", "sostenible", "identidad", "comunidad"]],
  ramus: [["ramus", "ramas", "resonancia", "ramus", "ramas"], ["astronomía", "carl sagan", "voyager", "©26", "astronomía"], ["investigación", "activismo", "señalética", "investigación", "activismo"]],
};
const FOLIO: Record<string, string> = { radix: "08—17", truncus: "18—34", ramus: "35—46" };

function MuroRow({ w, p, k }: { w: string[]; p: MotionValue<number>; k: number }) {
  const x = useTransform(p, [0, 1], k % 2 ? ["-35%", "0%"] : ["0%", "-35%"]);
  return (
    <motion.p style={{ x }} className={`flex w-max gap-10 whitespace-nowrap font-sans font-black uppercase tracking-tighter ${k === 1 ? "text-[6vw]" : "stroke-t text-[16vw]"}`}>
      {w.concat(w).map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </motion.p>
  );
}

function Reel({ sec, ps, open }: { sec: PortfolioData["sections"][number]; ps: Project[]; open: Open }) {
  const ref = useRef<HTMLElement>(null);
  const tr = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const f = () => setDist(Math.max(0, (tr.current?.scrollWidth ?? 0) - window.innerWidth + 96));
    f();
    const ro = new ResizeObserver(f);
    if (tr.current) ro.observe(tr.current);
    window.addEventListener("resize", f);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", f);
    };
  }, []);
  const { scrollYProgress: p } = useScroll({ target: ref as RefObject<HTMLElement>, offset: ["start start", "end end"] });
  const x = useTransform(p, [0, 1], [0, -dist]);
  const ix = useTransform(p, [0, 1], [-40, 40]);
  return (
    <section ref={ref} id={sec.id} data-step={"Ver " + sec.name} style={{ height: `calc(100vh + ${dist}px)` }} className="relative border-t border-ink bg-paper">
      <div className="sticky top-0 flex h-screen flex-col justify-end overflow-hidden pb-10 pt-28">
        <div className="pointer-events-none absolute inset-0 flex select-none flex-col justify-around opacity-[.09]" aria-hidden>
          {MURO[sec.id].map((w, k) => (
            <MuroRow key={k} w={w} p={p} k={k} />
          ))}
        </div>
        <div className="relative z-10 mb-6 grid items-end gap-6 px-6 sm:px-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Folio {FOLIO[sec.id]} • {ps.length} proyectos</p>
            <h2 className="font-sans text-[17vw] font-black uppercase leading-[.82] tracking-tighter lg:text-[11vw]" style={{ color: sec.accentColor }}>
              <Words t={sec.name} />
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-serif text-2xl italic leading-none">{sec.translation}</p>
            <p className="mt-2 max-w-md font-serif text-base leading-snug text-muted sm:text-lg">{sec.concept}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest">{sec.discipline}</p>
          </div>
        </div>
        <motion.div ref={tr} style={{ x }} className="relative z-10 flex w-max gap-6 px-6 sm:gap-8 sm:px-12">
          {ps.map((pr, i) => (
            <motion.article
              key={pr.id}
              onClick={() => open(pr)}
              initial={{ opacity: 0, y: 80, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={vp}
              whileHover={{ y: -12, rotate: -1 }}
              transition={{ ease, duration: 0.8, delay: (i % 3) * 0.06 }}
              className="group flex w-[72vw] shrink-0 cursor-pointer flex-col border border-ink bg-white sm:w-[21rem]"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-ink" style={{ backgroundColor: sec.accentBg }}>
                <motion.div style={{ x: ix }} className="absolute -inset-x-12 inset-y-0">
                  <Image src={pr.primaryCutout || pr.images.cover} alt={pr.title} fill sizes="400px" className="object-contain p-5 transition-transform duration-700 group-hover:scale-110" />
                </motion.div>
                <span className="absolute left-3 top-3 bg-ink px-2 py-0.5 font-mono text-[10px] text-paper">p.{pad(pr.pageStart)}</span>
              </div>
              <div className="space-y-1.5 p-4">
                <div className="flex items-center justify-between font-mono text-xs font-bold" style={{ color: sec.accentColor }}>
                  <span>№ {pr.number}</span>
                  <span className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
                </div>
                <h3 className="font-sans text-xl font-extrabold uppercase leading-[.95] tracking-tighter">{pr.title}</h3>
                <p className="line-clamp-2 font-serif text-base leading-snug text-muted">{pr.summary}</p>
                <p className="flex justify-between border-t border-ink/15 pt-2 font-mono text-[10px] uppercase text-muted">
                  <span className="truncate">{pr.category}</span>
                  <span>{pr.year}</span>
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function Reels({ d, open }: { d: PortfolioData; open: Open }) {
  return (
    <>
      {d.sections.map((sec) => (
        <Reel key={sec.id} sec={sec} ps={d.projects.filter((p) => p.section === sec.id)} open={open} />
      ))}
    </>
  );
}
