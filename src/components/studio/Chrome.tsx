"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ease } from "./kit";
import Cursor from "./Cursor";
import Petals from "./Petals";
import Night from "./Night";

const links = [
  ["Acerca de mí", "#manifiesto"],
  ["Proyectos", "#index"],
  ["CV", "#cv"],
  ["Creemos juntos", "#contacto"],
  ["Escríbeme", "#escribeme"],
];

export default function Chrome() {
  const { scrollY, scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [hide, setHide] = useState(false);
  const [dark, setDark] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setHide(v > 240 && v > (scrollY.getPrevious() ?? 0)));

  useEffect(() => {
    const el = document.getElementById("contacto");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDark(e.isIntersecting), { rootMargin: "-50% 0px -50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.div style={{ scaleX: bar }} className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-vino" />

      <motion.header
        animate={{ y: hide ? -100 : 0 }}
        transition={{ ease, duration: 0.6 }}
        className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 border-b border-ink/15 bg-paper/85 px-4 py-3 backdrop-blur-md sm:px-8"
      >
        <a href="#" className="group flex shrink-0 flex-col leading-none">
          <span className="font-sans text-lg uppercase tracking-tighter transition-colors group-hover:text-vino sm:text-2xl">
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
      </motion.header>

      <p className={`pointer-events-none fixed right-2 top-1/2 z-40 hidden -translate-y-1/2 font-mono text-[10px] uppercase tracking-[.3em] transition-colors duration-500 [writing-mode:vertical-rl] md:block ${dark ? "text-white" : "text-muted"}`}>
        Anastomosis 2026
      </p>

      <Night />
      <Petals />
      <Cursor />
    </>
  );
}
