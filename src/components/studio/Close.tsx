"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Author, Colophon as ColType, Project } from "@/types/portfolio";
import { ease, pad, Reveal, Words } from "./kit";

export function Fin({ a, c }: { a: Author; c: ColType }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const x = useTransform(p, [0, 1], ["25%", "-12%"]);
  const rot = useTransform(p, [0, 1], [-10, 4]);
  const col = "space-y-2 font-mono text-[11px] leading-relaxed text-white/60";
  const h = "mb-2 block font-bold uppercase tracking-widest text-white";
  return (
    <section ref={ref} id="fin" data-step="Y fin" className="overflow-hidden bg-vino text-white">
      <div className="grid gap-12 px-6 pb-20 pt-28 sm:px-12 sm:pt-40 lg:grid-cols-2">
        <div className="space-y-8">
          <p className="font-mono text-[11px] uppercase tracking-[.25em] text-[#E8B8C8]">Y fin • Colofón & Agradecimientos</p>
          <h2 className="font-serif text-4xl italic leading-[1.05] sm:text-6xl">
            <Words t={`«${a.closingDedication}»`} />
          </h2>
          <Reveal d={0.2} className="font-mono text-[11px] uppercase tracking-widest text-[#E8B8C8]">ANASTOMOSIS • {a.name}</Reveal>
        </div>
        <Reveal className="relative mx-auto w-full max-w-md">
          <motion.div style={{ rotate: rot }} className="relative aspect-[4/5] border-2 border-paper bg-white p-3">
            <div className="relative h-full w-full">
              <Image src="/images/outro-tree.webp" alt="Árbol de Conacaste" fill sizes="448px" className="object-contain" />
            </div>
            <div className="absolute -bottom-6 -right-4 rotate-6 bg-olive px-5 py-3 font-hand text-3xl leading-none text-white shadow-xl">
              att:<br />
              <b className="font-sans text-xl font-black uppercase">{a.name}</b>
            </div>
          </motion.div>
        </Reveal>
      </div>

      <motion.p style={{ x }} className="whitespace-nowrap font-sans text-[26vw] font-black uppercase leading-[.8] tracking-tighter stroke-t">
        Anastomosis :)
      </motion.p>

      <footer className="mt-16 space-y-12 border-t border-white/15 px-6 pb-28 pt-12 sm:px-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className={col}>
            <b className={h}>Edición & Título</b>
            <p>{a.title} | {a.subtitle}</p>
            <p>{c.edition}</p>
            <p>{c.university}</p>
          </div>
          <div className={col}>
            <b className={h}>Autoría & Dirección</b>
            <p>{c.designer}</p>
            <p>Escuela de Diseño Gráfico</p>
            <p>San Salvador, El Salvador</p>
          </div>
          <div className={col}>
            <b className={h}>Recursos & Archivos</b>
            {c.resources.map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="block underline underline-offset-2 transition-colors hover:text-[#E8B8C8]">{r.name}</a>
            ))}
          </div>
          <div className={col}>
            <b className={h}>Nota Técnica</b>
            <p>{c.note}</p>
            <p className="pt-2 text-[10px]">Stack: Next.js App Router • Tailwind CSS • Framer Motion</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-white/60 sm:flex-row">
          <p>© 2026 Erin Figueroa. Todos los derechos reservados.</p>
          <motion.button whileHover={{ y: -3 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer text-paper transition-colors hover:text-[#E8B8C8]">
            Volver arriba ↺
          </motion.button>
        </div>
      </footer>
    </section>
  );
}

const it = (i: number) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { ease, duration: 0.7, delay: 0.3 + i * 0.07 } });

export function Reader({ p, close }: { p: Project | null; close: () => void }) {
  useEffect(() => {
    if (!p) return;
    document.body.style.overflow = "hidden";
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", f);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", f);
    };
  }, [p, close]);

  const lb = "mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest text-muted";
  return (
    <AnimatePresence>
      {p && (
        <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[65] flex justify-end">
          <div onClick={close} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ ease, duration: 0.8 }}
            className="relative h-full w-full max-w-2xl space-y-8 overflow-y-auto border-l-2 border-ink bg-paper p-6 pt-14 sm:p-10 sm:pt-16"
          >
            <motion.div {...it(0)} className="flex items-center justify-between border-b border-ink pb-4 font-mono text-xs">
              <span className="flex items-center gap-3">
                <b className="text-vino">№ {p.number}</b>
                <span className="bg-ink px-2 py-0.5 text-[10px] text-paper">PÁG. {p.pageStart}</span>
                <span className="uppercase text-muted">{p.section}</span>
              </span>
              <button onClick={close} aria-label="Cerrar lectura" className="cursor-pointer border border-ink px-3 py-1 uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper">Esc ✕</button>
            </motion.div>

            <motion.div {...it(1)} className="space-y-2">
              <span className={lb}>{p.category}</span>
              <h2 className="font-sans text-4xl font-black uppercase leading-[.92] tracking-tighter sm:text-6xl">{p.title}</h2>
              {p.subtitle && <p className="font-serif text-2xl italic text-vino">{p.subtitle}</p>}
            </motion.div>

            <motion.div {...it(2)} className="relative aspect-[4/3] border border-ink bg-white p-4 shadow-[8px_8px_0_#231F20]">
              <div className="relative h-full w-full bg-paper">
                <Image src={p.primaryCutout || p.images.cover} alt={p.title} fill preload sizes="672px" className="object-contain" />
              </div>
            </motion.div>

            <motion.blockquote {...it(3)} className="border-l-4 border-vino bg-white p-5 font-serif text-xl italic leading-relaxed">«{p.summary}»</motion.blockquote>

            <motion.div {...it(4)} className="space-y-4 font-serif text-xl leading-relaxed">
              <span className={lb}>Memoria Verbatim de la Obra</span>
              {p.text.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </motion.div>

            {!!p.secondaryCutouts?.length && (
              <motion.div {...it(5)}>
                <span className={lb}>Detalles de Collage y Construcción</span>
                <div className="grid grid-cols-2 gap-4">
                  {p.secondaryCutouts.map((src, i) => (
                    <motion.div key={src} whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }} className="relative aspect-[4/3] border border-ink bg-white p-2">
                      <div className="relative h-full w-full">
                        <Image src={src} alt={`${p.title} detalle ${i + 1}`} fill sizes="320px" className="object-contain" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div {...it(6)} className="space-y-5 border border-ink bg-white p-5">
              {p.credits && (
                <div>
                  <span className={lb}>Créditos & Acompañamiento</span>
                  <p className="font-serif text-lg font-semibold leading-snug text-vino">{p.credits}</p>
                </div>
              )}
              <div>
                <span className={lb}>Descriptores</span>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <kbd key={t} className="border border-ink px-2.5 py-1 font-mono text-[11px] shadow-[0_2px_0_#231F20]">{t}</kbd>
                  ))}
                </div>
              </div>
            </motion.div>

            <p className="flex justify-between border-t border-ink pt-4 font-mono text-[11px] uppercase tracking-widest text-muted">
              <span>Anastomosis • Erin Figueroa (2026)</span>
              <span>{pad(Number(p.number))}/15</span>
            </p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
