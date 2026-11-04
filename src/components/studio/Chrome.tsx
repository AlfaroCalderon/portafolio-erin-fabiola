"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Undo2, Redo2, X } from "lucide-react";
import { useStudio } from "@/context/HistoryContext";
import { ease } from "./kit";

const C = "rgba(35,31,32,.55)";
const hT = `linear-gradient(90deg,${C} 1px,transparent 1px)`;
const vT = `linear-gradient(180deg,${C} 1px,transparent 1px)`;
const topR = { backgroundImage: `${hT},${hT},${hT}`, backgroundSize: "10px 5px,50px 9px,100px 15px", backgroundPosition: "0 100%", backgroundRepeat: "repeat-x" };
const sideR = { backgroundImage: `${vT},${vT},${vT}`, backgroundSize: "5px 10px,9px 50px,15px 100px", backgroundPosition: "100% 0", backgroundRepeat: "repeat-y" };
const xs = Array.from({ length: 26 }, (_, i) => i * 100);
const ys = Array.from({ length: 14 }, (_, i) => i * 100);
const links = [
  ["Trabajo", "#index"],
  ["Sobre mí", "#manifiesto"],
  ["CV", "#cv"],
  ["Postal", "#contacto"],
];
const kb = "border border-current px-1.5 py-0.5 text-[10px] leading-none";

export default function Chrome() {
  const { s, commit, undo, redo, jump, logStep, canUndo, canRedo, labs, idx, msg, tick, hist, setHist, nav, mx, my } = useStudio();
  const { scrollY, scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [hide, setHide] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setHide(v > 240 && v > (scrollY.getPrevious() ?? 0) && !hist));
  const ls = useRef(logStep);
  useEffect(() => {
    ls.current = logStep;
  });
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && !nav.current) ls.current(e.target.id, (e.target as HTMLElement).dataset.step ?? e.target.id);
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("[data-step]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [nav]);

  const sx = useSpring(mx, { stiffness: 200, damping: 22, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 200, damping: 22, mass: 0.5 });
  const dx = useTransform(mx, (v) => v - 4);
  const dy = useTransform(my, (v) => v - 4);
  const ox = useTransform(sx, (v) => v - 18);
  const oy = useTransform(sy, (v) => v - 18);
  const tx = useTransform(mx, (v) => String(Math.max(0, Math.round(v))).padStart(4, "0"));
  const ty = useTransform(my, (v) => String(Math.max(0, Math.round(v))).padStart(4, "0"));
  const pct = useTransform(scrollYProgress, (v) => Math.round(v * 100) + "%");
  const btn = "cursor-pointer px-3 py-2 uppercase tracking-widest transition-colors hover:bg-vino";

  return (
    <>
      <motion.div style={{ scaleX: bar }} className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-vino" />

      <motion.header
        animate={{ y: hide ? -100 : 0 }}
        transition={{ ease, duration: 0.6 }}
        className="fixed left-6 right-0 top-6 z-40 flex items-center justify-between gap-4 border-b border-ink/15 bg-paper/85 px-4 py-3 backdrop-blur-md sm:px-8"
      >
        <a href="#" className="group flex shrink-0 flex-col leading-none">
          <span className="font-sans text-lg font-black uppercase tracking-tighter transition-colors group-hover:text-vino sm:text-2xl">
            Anastomosis<span className="text-vino">.</span>
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[.2em] text-muted">Erin Figueroa • 2026</span>
        </a>
        <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-widest md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="group relative py-1">
              {l}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-vino transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <button
          onClick={() => setHist(!hist)}
          aria-label="Abrir historial"
          className={`flex shrink-0 cursor-pointer items-center gap-1 font-mono transition-colors ${hist ? "text-vino" : "hover:text-vino"}`}
        >
          <kbd className={kb}>Ctrl</kbd>
          <kbd className={kb}>Z</kbd>
        </button>
      </motion.header>

      <p className="pointer-events-none fixed right-2 top-1/2 z-40 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-[.3em] text-muted [writing-mode:vertical-rl] md:block">
        <b className="text-ink">Anastomosis 2026</b>&nbsp;&nbsp;|&nbsp;&nbsp;Ctrl Z
      </p>

      <AnimatePresence>
        {s.grid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ease, duration: 0.8 }} className="pointer-events-none fixed inset-0 z-30">
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "linear-gradient(rgba(139,35,84,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,35,84,.06) 1px,transparent 1px)", backgroundSize: "80px 80px" }}
            />
            <div
              className="absolute inset-y-0 left-1/2 w-full max-w-7xl -translate-x-1/2 border-x border-vino/15"
              style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(139,35,84,.10) 0 1px,transparent 1px calc(100%/12))" }}
            />
            <motion.div style={{ x: mx }} className="absolute inset-y-0 left-0 w-px bg-vino/35" />
            <motion.div style={{ y: my }} className="absolute inset-x-0 top-0 h-px bg-vino/35" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.rulers && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ease, duration: 0.6 }} className="pointer-events-none fixed inset-0 z-50 select-none">
            <div className="absolute inset-x-0 top-0 h-6 overflow-hidden border-b border-ink/30 bg-paper" style={topR}>
              {xs.map((v) => (
                <span key={v} className="absolute top-0.5 font-mono text-[8px] leading-none text-muted" style={{ left: v + 3 }}>{v}</span>
              ))}
              <motion.div style={{ x: mx }} className="absolute inset-y-0 left-0 w-px bg-vino" />
            </div>
            <div className="absolute inset-y-0 left-0 w-6 overflow-hidden border-r border-ink/30 bg-paper" style={sideR}>
              {ys.map((v) => (
                <span key={v} className="absolute left-0.5 font-mono text-[8px] leading-none text-muted [writing-mode:vertical-rl]" style={{ top: v + 3 }}>{v}</span>
              ))}
              <motion.div style={{ y: my }} className="absolute inset-x-0 top-0 h-px bg-vino" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => commit({ rulers: !s.rulers }, s.rulers ? "Reglas OFF" : "Reglas ON")}
        title="Alternar reglas"
        className="fixed left-0 top-0 z-[60] grid h-6 w-6 cursor-pointer place-items-center bg-ink font-mono text-[8px] text-paper transition-colors hover:bg-vino"
      >
        PX
      </button>

      <motion.div style={{ x: ox, y: oy }} className="pointer-events-none fixed left-0 top-0 z-[80] hidden size-9 rounded-full border border-white mix-blend-difference md:block" />
      <motion.div style={{ x: dx, y: dy }} className="pointer-events-none fixed left-0 top-0 z-[80] hidden size-2 rounded-full bg-white mix-blend-difference md:block" />

      <AnimatePresence>
        {hist && (
          <motion.aside
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ ease, duration: 0.7 }}
            className="fixed bottom-20 right-8 top-24 z-[60] flex w-72 flex-col bg-ink font-mono text-[11px] text-paper shadow-[0_20px_60px_rgba(0,0,0,.35)]"
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 uppercase tracking-widest">
              <span>Historial</span>
              <span className="bg-paper px-1.5 text-ink">{labs.length}</span>
              <button onClick={() => setHist(false)} aria-label="Cerrar historial" className="cursor-pointer hover:text-[#E8B8C8]">
                <X className="size-4" />
              </button>
            </div>
            <ol className="flex-1 overflow-y-auto">
              {labs.map((l, i) => (
                <li key={i}>
                  <button
                    onClick={() => jump(i)}
                    className={`flex w-full cursor-pointer items-center gap-3 border-b border-white/10 px-4 py-2.5 text-left transition-colors hover:bg-white/10 ${i === idx ? "bg-vino" : i > idx ? "opacity-40" : ""}`}
                  >
                    <span className="w-5 opacity-60">{String(i).padStart(2, "0")}</span>
                    <span className="truncate">{l}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex border-t border-white/15">
              <button onClick={undo} disabled={!canUndo} className={`flex flex-1 items-center justify-center gap-2 ${btn} ${canUndo ? "" : "pointer-events-none opacity-35"}`}><Undo2 className="size-3.5" />Deshacer</button>
              <button onClick={redo} disabled={!canRedo} className={`flex flex-1 items-center justify-center gap-2 border-l border-white/15 ${btn} ${canRedo ? "" : "pointer-events-none opacity-35"}`}><Redo2 className="size-3.5" />Rehacer</button>
            </div>
            <p className="px-4 py-2 text-center text-[10px] text-white/50">Ctrl/⌘ + Z para volver un paso</p>
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="fixed bottom-6 left-10 z-[60] flex items-stretch bg-ink font-mono text-[11px] text-paper shadow-[0_15px_40px_rgba(0,0,0,.25)]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={undo} title="Deshacer (Ctrl/Cmd + Z)" className={`flex items-center gap-2 ${btn}`}>
          <Undo2 className="size-3.5" />
          Ctrl Z
          <span className="bg-paper px-1.5 text-ink">{idx}</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl/Cmd + Shift + Z)" className={`border-l border-white/15 ${btn} ${canRedo ? "" : "pointer-events-none opacity-35"}`}>
          <Redo2 className="size-3.5" />
        </motion.button>
        {tick > 0 && (
          <motion.div
            key={tick}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: [0, 1, 1, 0], x: [-10, 0, 0, 6] }}
            transition={{ duration: 2.6, times: [0, 0.06, 0.85, 1] }}
            className="hidden max-w-[280px] items-center gap-2 truncate border-l border-white/15 px-3 sm:flex"
          >
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#E8B8C8]" />
            <span className="truncate">{msg}</span>
          </motion.div>
        )}
      </aside>

      <div className="fixed bottom-6 right-6 z-[60] flex items-stretch bg-ink font-mono text-[11px] text-paper">
        <span className="hidden items-center gap-2 px-3 py-2 sm:flex">
          <b className="text-[#E8B8C8]">X</b>
          <motion.span className="tabular-nums">{tx}</motion.span>
          <b className="text-[#E8B8C8]">Y</b>
          <motion.span className="tabular-nums">{ty}</motion.span>
        </span>
        <motion.span className="hidden w-12 items-center border-l border-white/15 px-3 py-2 tabular-nums sm:flex">{pct}</motion.span>
        <button onClick={() => commit({ grid: !s.grid }, s.grid ? "Grid OFF" : "Grid ON")} className={`border-l border-white/15 ${btn} ${s.grid ? "text-[#E8B8C8]" : ""}`}>Grid</button>
        <button onClick={() => commit({ rulers: !s.rulers }, s.rulers ? "Reglas OFF" : "Reglas ON")} className={`border-l border-white/15 ${btn} ${s.rulers ? "text-[#E8B8C8]" : ""}`}>Reglas</button>
      </div>
    </>
  );
}
