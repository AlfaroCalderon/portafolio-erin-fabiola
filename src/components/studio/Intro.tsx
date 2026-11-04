"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { Author, PortfolioData, Project } from "@/types/portfolio";
import { useStudio } from "@/context/HistoryContext";
import { ease, Mag, pad, Reveal, vp, Words } from "./kit";

const A = "Donde las ramas ";
const B = "vuelven a unirse.";
const FULL = A + B;

export function Typed({ replay }: { replay: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let c = replay ? FULL.length : 0;
    let dir = replay ? -1 : 1;
    const id = setInterval(() => {
      c += dir < 0 ? -3 : 1;
      if (c <= 0 && dir < 0) {
        c = 0;
        dir = 1;
      }
      if (c >= FULL.length && dir > 0) {
        c = FULL.length;
        clearInterval(id);
      }
      setN(c);
    }, 42);
    return () => clearInterval(id);
  }, [replay]);
  const a = FULL.slice(0, Math.min(n, A.length));
  const b = FULL.slice(A.length, n);
  return (
    <>
      <span className="invisible" aria-label={FULL}>
        {A}
        <span className="font-serif font-medium normal-case italic">{B}</span>
      </span>
      <span aria-hidden className="absolute inset-0">
        {a}
        <span className="font-serif font-medium normal-case italic text-vino">{b}</span>
        <span className="inline-block w-0 overflow-visible align-baseline"><span className="animate-caret absolute ml-1 h-[.75em] w-[.06em] -translate-y-[.78em] bg-vino" /></span>
      </span>
    </>
  );
}

export function Hero({ a }: { a: Author }) {
  const { mx, my, replay } = useStudio();
  const [loc, setLoc] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(p, [0, 1], [0, 200]);
  const hy = useTransform(p, [0, 1], [0, -120]);
  const op = useTransform(p, [0, 0.8], [1, 0]);
  const rx = useSpring(useTransform(my, [0, 900], [10, -10]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1600], [-12, 12]), { stiffness: 120, damping: 20 });

  return (
    <section ref={ref} id="inicio" data-step="Abrir Anastomosis.porta" className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 pb-24 pt-32 sm:px-12">
      <motion.div style={{ opacity: op }} className="relative z-10 flex items-start justify-between gap-6 font-mono text-[11px] uppercase leading-relaxed tracking-widest">
        <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease, duration: 1, delay: 0.2 }}>
          <b>{a.name}</b>
          <br />
          {a.role}
          <br />
          {a.location} • {a.institution}
        </motion.p>
        <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease, duration: 1, delay: 0.3 }} className="text-right">
          Portafolio
          <br />
          <b>{a.edition}</b>
        </motion.p>
      </motion.div>

      <motion.figure
        style={{ y, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 3 }}
        transition={{ ease, duration: 1.4, delay: 0.4 }}
        className="absolute bottom-40 right-[4vw] z-0 w-[40vw] max-w-[340px] sm:w-[26vw]"
      >
        <div className="relative aspect-[4/5] border border-ink bg-white p-3 shadow-[0_30px_80px_rgba(35,31,32,.15)]">
          <div className="relative h-full w-full">
            <Image src="/images/hero-tree.webp" alt="Árbol de Conacaste - Anastomosis" fill preload sizes="(max-width:768px) 44vw, 440px" className="object-contain" />
          </div>
        </div>
        <figcaption className="mt-2 max-w-[90%] font-serif text-sm italic leading-snug">
          <b className="mr-1 font-mono text-[10px] not-italic uppercase tracking-widest text-vino">Eduardo Galeano</b>«Al fin y al cabo, somos lo que hacemos para cambiar lo que somos.»
        </figcaption>
      </motion.figure>

      <motion.h1 style={{ y: hy }} className="relative z-10 my-10 font-sans text-[12.5vw] font-black uppercase leading-[.86] tracking-tighter sm:text-[10.5vw]">
        <Typed replay={replay + loc} />
      </motion.h1>

      <motion.div style={{ opacity: op }} className="relative z-10 flex flex-wrap items-end justify-between gap-8">
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ease, duration: 1, delay: 1.2 }} className="max-w-sm font-serif text-xl leading-snug">
          <b className="font-bold">{a.quote.text}</b>
          <br />
          <em className="text-muted">— {a.quote.author}</em>
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          whileTap={{ y: 4 }}
          onClick={() => setLoc((n) => n + 1)}
          aria-label="Prueba deshacer con Ctrl Z"
          className="group relative flex cursor-pointer items-center gap-2 font-mono text-sm"
        >
          {["Ctrl", "Z"].map((k) => (
            <kbd key={k} className="border-2 border-ink bg-white px-4 py-3 shadow-[0_5px_0_#231F20] transition-all group-hover:bg-vino group-hover:text-white group-active:translate-y-1 group-active:shadow-none">
              {k}
            </kbd>
          ))}
          <span className="absolute -top-9 left-0 -rotate-6 whitespace-nowrap font-hand text-2xl text-vino">pruébalo ↓</span>
        </motion.button>
        <Mag href="#index" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
          Baja <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}>↓</motion.span>
        </Mag>
      </motion.div>
    </section>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const { scrollY } = useScroll();
  const sk = useSpring(useTransform(useVelocity(scrollY), [-3000, 3000], [-10, 10]), { stiffness: 200, damping: 30 });
  const row = items.concat(items);
  return (
    <section className="select-none overflow-hidden bg-olive py-10 text-white">
      <div className="mb-5 flex justify-between px-6 font-mono text-[11px] uppercase tracking-widest text-white/60 sm:px-12">
        <span>Disciplinas & Dominio Técnico</span>
        <span>Anastomosis • Erin Figueroa</span>
      </div>
      <motion.div style={{ skewX: sk }} className="animate-marquee">
        {row.map((t, i) => (
          <span key={i} className={`flex shrink-0 items-center gap-8 pr-8 font-sans text-5xl font-black uppercase tracking-tighter sm:text-7xl ${i % 2 ? "stroke-t" : ""}`}>
            {t}
            <span className="size-3 rounded-full bg-ochre" />
          </span>
        ))}
      </motion.div>
    </section>
  );
}

export function Porta({ a }: { a: Author }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const sc = useTransform(p, [0, 0.7], [0.55, 1.05]);
  const ls = useTransform(p, [0, 0.7], ["-0.1em", "-0.02em"]);
  const op = useTransform(p, [0, 0.15], [0.2, 1]);
  const sub = useTransform(p, [0.5, 0.8], [0, 1]);
  const suby = useTransform(p, [0.5, 0.8], [40, 0]);
  return (
    <section ref={ref} id="porta" data-step="Entrar al portafolio" className="relative h-[240vh] bg-vino text-white">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 text-center">
        <motion.p style={{ scale: sc, letterSpacing: ls, opacity: op }} className="font-sans text-[15.5vw] font-black uppercase leading-[.85]">
          {a.title}
        </motion.p>
        <motion.p style={{ opacity: sub, y: suby }} className="font-serif text-3xl italic sm:text-6xl">
          {a.subtitle}
        </motion.p>
        <motion.p style={{ opacity: sub }} className="font-mono text-[11px] uppercase tracking-[.3em]">
          {a.edition} • {a.institution}
        </motion.p>
      </div>
    </section>
  );
}

function Para({ t, i }: { t: string; i: number }) {
  const r = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress: p } = useScroll({ target: r, offset: ["start 92%", "start 45%"] });
  const o = useTransform(p, [0, 1], [0.12, 1]);
  const y = useTransform(p, [0, 1], [50, 0]);
  return (
    <motion.p
      ref={r}
      style={{ opacity: o, y }}
      className={i === 0 ? "font-serif text-3xl leading-[1.12] first-letter:float-left first-letter:mr-2 first-letter:font-sans first-letter:text-7xl first-letter:font-black first-letter:leading-[.8] first-letter:text-vino sm:text-5xl" : "font-serif text-xl leading-relaxed sm:text-2xl"}
    >
      {t}
    </motion.p>
  );
}

export function Manifest({ a }: { a: Author }) {
  const ficha = [
    ["Nombre", a.name],
    ["Rol", a.role],
    ["Estudia", a.institution],
    ["Desde", a.location],
    ["Edición", a.edition],
  ];
  return (
    <section id="manifiesto" data-step="Conocer a Erin" className="relative bg-paper px-6 py-28 sm:px-12 sm:py-40">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <Reveal y={20}>
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[.25em] text-vino">08 — El Origen de Anastomosis • Texto Original Íntegro</p>
          </Reveal>
          <h2 className="font-sans text-4xl font-black uppercase leading-[.92] tracking-tighter sm:text-6xl">
            <Words t="«Mira sus ramas, se han fusionado y son una sola»" />
          </h2>
          <Reveal d={0.2} className="mt-10 max-w-sm">
            <motion.div whileHover={{ rotate: -2, y: -6 }} transition={{ ease, duration: 0.5 }} className="relative border border-ink bg-white p-5 pb-8 shadow-[0_20px_50px_rgba(35,31,32,.12)]">
              <div className="relative aspect-square bg-paper">
                <Image src="/images/outro-tree.webp" alt="Árbol de Conacaste" fill sizes="384px" className="object-contain" />
              </div>
              <p className="mt-4 font-serif text-lg italic leading-snug">{a.closingDedication}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">{a.name}</p>
            </motion.div>
          </Reveal>
        </div>
        <div className="space-y-10 lg:col-span-7">
          {a.bio.map((t, i) => (
            <Para key={i} t={t} i={i} />
          ))}
          <dl className="mt-16 border-t border-ink">
            {ficha.map(([k, v], i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={vp}
                transition={{ ease, duration: 0.8, delay: i * 0.06 }}
                className="grid grid-cols-3 gap-4 border-b border-ink/20 py-3"
              >
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">{k}</dt>
                <dd className="col-span-2 font-sans text-base font-semibold">{v}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Stage({ d, open }: { d: PortfolioData; open: (p: Project) => void }) {
  const ref = useRef<HTMLElement>(null);
  const f = d.projects.filter((x) => x.featured);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);
  useMotionValueEvent(p, "change", (v) => setI(Math.min(f.length - 1, Math.max(0, Math.floor(v * f.length)))));
  const cur = f[i];
  const sec = d.sections.find((x) => x.id === cur.section)!;
  return (
    <section ref={ref} id="seleccion" data-step="Ver obras destacadas" style={{ height: `${f.length * 80 + 40}vh` }} className="relative">
      <motion.div animate={{ backgroundColor: sec.accentBg }} transition={{ ease, duration: 0.9 }} className="sticky top-0 h-screen overflow-hidden px-6 pt-32 sm:px-12">
        <p className="font-mono text-[11px] uppercase tracking-[.25em]">Obras destacadas • {pad(i + 1)}/{pad(f.length)}</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -70 }}
            transition={{ ease, duration: 0.7 }}
            className="mt-8 grid items-center gap-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-7">
              <span className="font-sans text-8xl font-black leading-none tracking-tighter sm:text-[12vw]" style={{ color: sec.accentColor }}>
                {cur.number}
              </span>
              <p className="mt-4 font-serif text-2xl italic leading-snug sm:text-4xl">«{cur.summary}»</p>
              <button onClick={() => open(cur)} className="group mt-8 inline-flex cursor-pointer items-center gap-3 font-sans text-xl font-extrabold uppercase tracking-tight sm:text-3xl">
                <span className="border-b-2 border-ink transition-colors group-hover:text-vino">{cur.title}</span>
                <span className="transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1">↗</span>
              </button>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
                {sec.name} • {cur.category} • P.{pad(cur.pageStart)}
              </p>
            </div>
            <motion.div initial={{ rotate: -8, scale: 0.85 }} animate={{ rotate: 2, scale: 1 }} transition={{ ease, duration: 1 }} className="relative h-[34vh] sm:h-[52vh] lg:col-span-5">
              <Image src={cur.primaryCutout || cur.images.cover} alt={cur.title} fill sizes="(max-width:1024px) 90vw, 40vw" className="object-contain drop-shadow-2xl" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-ink/10">
          <motion.div style={{ scaleX: p }} className="h-full origin-left bg-ink" />
        </div>
      </motion.div>
    </section>
  );
}
