"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useStudio } from "@/context/HistoryContext";
import { ease, Reveal, Words } from "./kit";

const stamps = [
  { id: "conacaste", n: "Sello Conacaste", v: "2026", d: "Árbol & Anastomosis", i: "/images/hero-tree.webp" },
  { id: "almendra", n: "Sello Almendra", v: "02", d: "Ave trovadora", i: "/images/art-almendra.webp" },
  { id: "albedo", n: "Sello Albedo", v: "12", d: "Copo & Singularidad", i: "/images/project-12-cover.webp" },
  { id: "voyager", n: "Sello Voyager", v: "13", d: "Tercer Planeta", i: "/images/project-13-cover.webp" },
  { id: "flamencos", n: "Sello Flamencos", v: "04", d: "Horacio Quiroga", i: "/images/art-flamenco.webp" },
];
const lbl = "block font-mono text-[10px] uppercase tracking-widest text-muted";
const inp = "w-full border-b-2 border-ink/30 bg-transparent py-2 font-serif text-xl outline-none transition-colors focus:border-vino";

export function Postal() {
  const { s, commit } = useStudio();
  const st = stamps.find((x) => x.id === s.stamp) ?? stamps[0];
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <section id="contacto" data-step="Escribirle a Erin" className="bg-paper px-6 py-28 sm:px-12 sm:py-40">
      <div className="mb-16 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[.25em] text-vino">Contacto • Correspondencia & Postales</p>
          <h2 className="font-sans text-[13vw] font-black uppercase leading-[.84] tracking-tighter lg:text-[8.5vw]">
            <Words t="Mándame una Postal Botánica" />
          </h2>
        </div>
        <Reveal d={0.15} className="font-serif text-xl italic leading-snug text-muted lg:col-span-4">
          Escribe tu mensaje, elige una estampilla del portafolio y conecta directamente con Erin Figueroa.
        </Reveal>
      </div>

      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest">1. Elige una estampilla de la colección:</p>
      <div className="mb-10 flex flex-wrap gap-3">
        {stamps.map((x) => (
          <motion.button
            key={x.id}
            type="button"
            whileHover={{ y: -6, rotate: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => s.stamp !== x.id && commit({ stamp: x.id }, x.n)}
            className={`flex cursor-pointer items-center gap-3 border-2 p-2 pr-4 text-left transition-colors ${s.stamp === x.id ? "border-vino bg-white shadow-[5px_5px_0_#800000]" : "border-ink/20 bg-paper"}`}
          >
            <span className="relative h-12 w-9 overflow-hidden border border-ink/30">
              <Image src={x.i} alt={x.n} fill sizes="40px" className="object-cover" />
            </span>
            <span>
              <b className="block font-sans text-xs font-extrabold uppercase">{x.n}</b>
              <span className="font-serif text-sm text-muted">{x.d}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 80, rotate: 1 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: false, margin: "-120px" }} transition={{ ease, duration: 1 }} className="relative grid overflow-hidden border-2 border-ink bg-white shadow-[14px_14px_0_#111] lg:grid-cols-2">
        <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(135deg,#800000_0_14px,#fff_14px_28px,#111_28px_42px,#fff_42px_56px)]" />
        <div className="relative min-h-[320px] border-b-2 border-ink bg-gris lg:border-b-0 lg:border-r-2">
          <AnimatePresence mode="wait">
            <motion.div key={st.id} initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ ease, duration: 0.6 }} className="absolute inset-8">
              <Image src={st.i} alt={st.n} fill sizes="(max-width:1024px) 90vw, 45vw" className="object-contain" />
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-widest">{st.n} • {st.d}</span>
        </div>

        <div className="grid gap-8 p-6 pt-10 sm:p-10 sm:pt-12 xl:grid-cols-[1fr_auto]">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease, duration: 0.8 }} className="col-span-full flex flex-col items-center justify-center gap-4 py-10 text-center">
              <h3 className="font-sans text-4xl font-black uppercase tracking-tighter">Postal timbrada y enviada</h3>
              <p className="max-w-md font-serif text-xl">Gracias por escribir. Tu mensaje con el <b>{st.n}</b> ha sido recibido con mucho afecto.</p>
              <button
                onClick={() => {
                  setSent(false);
                  setF({ name: "", email: "", message: "" });
                }}
                className="cursor-pointer border border-ink px-5 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper"
              >
                Enviar otra postal
              </button>
            </motion.div>
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-widest">2. Redacta tu mensaje:</p>
                <label className="block">
                  <span className={lbl}>Tu Nombre o Colectivo</span>
                  <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej. Estudio de Diseño o Editorial" className={inp} />
                </label>
                <label className="block">
                  <span className={lbl}>Tu Correo</span>
                  <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="contacto@estudio.com" className={inp} />
                </label>
                <label className="block">
                  <span className={lbl}>Mensaje en la Postal</span>
                  <textarea required rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Hola Erin, me gustó mucho tu proyecto..." className={`${inp} resize-none`} />
                </label>
                <motion.button whileTap={{ scale: 0.96 }} type="submit" className="w-full cursor-pointer bg-ink py-3.5 font-mono text-[11px] uppercase tracking-widest text-paper transition-colors hover:bg-vino">
                  Enviar Postal con {st.n} →
                </motion.button>
              </form>

              <div className="space-y-5 border-t-2 border-ink/10 pt-6 xl:w-56 xl:border-l-2 xl:border-t-0 xl:pl-6 xl:pt-0">
                <div className="relative flex justify-end">
                  <svg viewBox="0 0 120 120" aria-hidden className="absolute -left-2 -top-4 size-24 -rotate-12 text-vino">
                    <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path id="pm" d="M60 22a38 38 0 1 1 0 76a38 38 0 1 1 0-76" fill="none" />
                    <text fontSize="9.5" letterSpacing="2.2" fill="currentColor"><textPath href="#pm">SAN SALVADOR · ANASTOMOSIS · 2026 ·</textPath></text>
                  </svg>
                  <AnimatePresence mode="wait">
                    <motion.div key={st.id} initial={{ scale: 1.8, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 3, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="relative h-32 w-24 border-2 border-dashed border-ink/40 bg-paper p-1 shadow-md">
                      <Image src={st.i} alt={st.n} fill sizes="96px" className="object-cover p-1" />
                      <span className="absolute right-1 top-1 bg-ink px-1 font-mono text-[9px] text-white">{st.v}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                {[["Para:", "Erin Figueroa"], ["Destino:", "Escuela de Diseño Gráfico, UJMD"], ["Ciudad / País:", "San Salvador, El Salvador"], ["Correo:", "erin.figueroa@ujmd.edu.sv"]].map(([k, v]) => (
                  <div key={k} className="border-b border-ink/30 pb-1">
                    <span className={lbl}>{k}</span>
                    <p className="font-serif text-lg leading-tight">{v}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
