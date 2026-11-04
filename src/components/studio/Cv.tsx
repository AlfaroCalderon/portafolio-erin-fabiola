"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Circle, Hand, MousePointer2, PenTool, Pipette, Square, Type } from "lucide-react";
import { PortfolioData, Project } from "@/types/portfolio";
import { useStudio } from "@/context/HistoryContext";
import { ease, pad, Reveal, vp, Words } from "./kit";

const exp = [
  { k: "2024 — Presente", t: "Diseñadora Gráfica & Asistente de Proyectos", o: "Freelance / Alianza Francesa San Salvador", d: "Identidad visual, sistemas de señalética, diseño editorial y piezas culturales." },
  { k: "2023 — 2024", t: "Diseñadora Editorial y de Marca", o: "FRMA / Proyectos Comunitarios", d: "Dirección de arte, manuales de marca y diagramación de memorias de labores." },
  { k: "2022 — 2023", t: "Ilustradora & Creadora de Contenido", o: "Iniciativas Culturales Independientes", d: "Collage mix media, ilustración botánica y piezas de comunicación visual." },
];
const edu = [
  { k: "2021 — 2026", t: "Licenciatura en Diseño Gráfico", o: "Universidad Dr. José Matías Delgado (UJMD)", d: "Mentores: Ana María Miranda, Roberto Rivera, Mario Fuentes." },
  { k: "2023", t: "Diplomado en Identidad de Marca y Sistemas Editoriales", o: "Centro de Formación Visual", d: "Énfasis en retículas complejas y conceptualización botánica." },
];
const awards = [
  { k: "2026", t: "Mención de Honor — Proyecto Anastomosis", d: "Exposición de grado y selección en catálogo editorial UJMD." },
  { k: "2025", t: "Primer Lugar — Señalética Alianza Francesa", d: "Diseño e implementación de sistema espacial de orientación." },
  { k: "2024", t: "Publicación Destacada — Memoria de Labores FRMA", d: "Diagramación editorial de impacto comunitario y territorial." },
];
const nodes = [
  { b: "Alma Máter", k: "2022 — 2026", t: "Universidad Dr. José Matías Delgado", o: "Licenciatura en Diseño Gráfico • Proyecto de Graduación", d: "Investigación visual, conceptualización editorial y desarrollo de la tesis visual Anastomosis (primera edición conmemorativa).", l: "San Salvador, El Salvador" },
  { b: "Medio Ambiente", k: "2025 — 2026", t: "Fondo de Inversión Ambiental de El Salvador (FIAES)", o: "Diseño de Identidad & Experiencia Digital / Realidad Aumentada", d: "Desarrollo del proyecto Tour Verde Virtual para acercar a la población a las áreas naturales protegidas a través del lenguaje digital y la conservación.", l: "El Salvador" },
  { b: "Impacto Social", k: "2024 — 2026", t: "Fundación Rafael Meza Ayau & PNUD", o: "Identidad Visual, Collage Editorial & Campañas Comunitarias", d: "Línea gráfica formativa para Prudencia Voces Ciudadanas junto a la marca PONGO y la iniciativa Campamento Aventura FRMA con acompañamiento de Rodrigo Sibrián.", l: "El Salvador" },
  { b: "Cultura & Wayfinding", k: "2025", t: "Alianza Francesa", o: "Conceptualización de Sistema de Señalética & Personaje Mediateca", d: "Creación colaborativa del personaje e iconografía para las distintas salas y espacios culturales junto a Desireé Sixo y Mariana Azucena.", l: "San Salvador" },
];
const cvSkills = [
  { c: "Software Editorial", i: ["Adobe InDesign", "Illustrator", "Photoshop", "Figma", "Glyphs"] },
  { c: "Especialidades", i: ["Diseño Editorial", "Identidad de Marca", "Mix Media / Collage", "Señalética", "Sistemas de Información"] },
];
const swatches = [["#800000", "Vino"], ["#111111", "Tinta"], ["#D9D9D9", "Gris muro"], ["#F4F2EE", "Papel"]];
const tools = [MousePointer2, PenTool, Type, Square, Circle, Pipette, Hand];

function Layer({ name, set, children, className = "", inner = "" }: { name: string; set: (v: string) => void; children: ReactNode; className?: string; inner?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ ease, duration: 0.9 }}
      onPointerEnter={() => set(name)}
      className={`group/l relative p-4 sm:p-6 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 border border-vino opacity-0 transition-opacity duration-300 group-hover/l:opacity-100">
        <span className="absolute -top-5 left-0 bg-vino px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">{name}</span>
        {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1", "-top-1 left-1/2", "-bottom-1 left-1/2", "-left-1 top-1/2", "-right-1 top-1/2"].map((c) => (
          <i key={c} className={`absolute size-2 border border-vino bg-white ${c}`} />
        ))}
      </div>
      <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[.25em] text-vino">{name}</p>
      <div className={inner}>{children}</div>
    </motion.div>
  );
}

const Card = ({ k, t, o, d, b }: { k?: string; t: string; o?: string; d?: string; b?: string }) => (
  <motion.div whileHover={{ y: -6 }} transition={{ ease, duration: 0.4 }} className="space-y-1.5 border border-ink/20 bg-paper p-4">
    {b && <span className="inline-block bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-paper">{b}</span>}
    {k && <span className="block font-mono text-xs font-bold text-vino">{k}</span>}
    <h4 className="font-sans text-lg font-extrabold leading-tight tracking-tight">{t}</h4>
    {o && <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">{o}</p>}
    {d && <p className="border-t border-ink/10 pt-2 font-serif text-base leading-snug">{d}</p>}
  </motion.div>
);

export function CV({ d, open }: { d: PortfolioData; open: (p: Project) => void }) {
  const { s, commit } = useStudio();
  const [sel, setSel] = useState("Encabezado");
  const [copied, setCopied] = useState("");
  const a = d.author;
  const pj = d.projects;
  return (
    <section id="cv" data-step="Leer el CV" className="bg-paper px-6 py-28 sm:px-12 sm:py-40">
      <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[.25em] text-vino">CV • Simulación de Mesa de Trabajo • Illustrator / Figma</p>
          <h2 className="font-sans text-[16vw] font-black uppercase leading-[.8] tracking-tighter lg:text-[11vw]">
            <Words t="Curriculum" />
          </h2>
        </div>
        <Reveal d={0.15} className="max-w-sm font-serif text-xl leading-snug">
          <span className="font-hand text-2xl text-vino">pasa el cursor por cada bloque</span>
          <br />
          toca una disciplina del mapa y <kbd className="border border-ink px-1.5 font-mono text-sm">Ctrl</kbd> <kbd className="border border-ink px-1.5 font-mono text-sm">Z</kbd> la devuelve.
        </Reveal>
      </div>

      <div className="border-2 border-ink bg-white shadow-[12px_12px_0_#111]">
        <div className="flex items-center justify-between border-b border-ink bg-gris px-4 py-2 font-mono text-[11px]">
          <span className="truncate font-bold">✦ Curriculum_Vitae_Erin.ai @ 100% (RGB/Vista previa)</span>
          <span className="hidden sm:block">SANGRADO ACTIVO • CMYK 300 DPI</span>
        </div>
        <div className="flex">
          <ul className="hidden w-11 shrink-0 flex-col items-center gap-1 border-r border-ink bg-paper py-3 sm:flex" aria-hidden>
            {tools.map((T, i) => (
              <motion.li key={i} whileHover={{ scale: 1.2, backgroundColor: "#800000", color: "#fff" }} className={`grid size-8 place-items-center ${i === 0 ? "bg-ink text-paper" : ""}`}>
                <T className="size-4" />
              </motion.li>
            ))}
          </ul>

          <div className="min-w-0 flex-1 bg-gris p-3 sm:p-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">Mesa de trabajo 1 — CV</p>
            <article className="mx-auto max-w-5xl divide-y divide-ink/10 bg-white shadow-[0_20px_60px_rgba(17,17,17,.2)]">
              <Layer name="Encabezado" set={setSel} inner="grid items-center gap-6 sm:grid-cols-[auto_1fr_auto]">
                <div className="relative h-28 w-20 border-2 border-dashed border-ink/40 bg-paper p-1">
                  <Image src="/images/hero-tree.webp" alt="Sello Conacaste" fill sizes="80px" className="object-cover" />
                </div>
                <div>
                  <h3 className="font-sans text-4xl font-black uppercase leading-none tracking-tighter sm:text-6xl">{a.name}</h3>
                  <p className="mt-2 font-serif text-xl italic">{a.role}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{a.location} • {a.institution} • {a.edition}</p>
                </div>
                <a href="mailto:erin.figueroa@ujmd.edu.sv" className="font-mono text-xs text-vino underline underline-offset-4">erin.figueroa@ujmd.edu.sv</a>
              </Layer>

              <Layer name="01 Experiencia Laboral" set={setSel}>
                <div className="grid gap-4 md:grid-cols-3">{exp.map((x) => <Card key={x.k} {...x} />)}</div>
              </Layer>
              <div className="grid divide-y divide-ink/10 md:grid-cols-2 md:divide-x md:divide-y-0">
                <Layer name="02 Formación Académica & Mentores" set={setSel}>
                  <div className="space-y-4">{edu.map((x) => <Card key={x.k} {...x} />)}</div>
                </Layer>
                <Layer name="03 Hitos & Reconocimientos" set={setSel}>
                  <div className="space-y-4">{awards.map((x) => <Card key={x.k} {...x} />)}</div>
                </Layer>
              </div>

              <Layer name="04 Trayectoria Creativa — Interconexión & Colaboraciones" set={setSel}>
                <p className="mb-5 max-w-xl font-serif text-xl italic leading-snug text-muted">«Ninguna de estas páginas fue construida solamente por mí: alianzas institucionales, mentores y causas compartidas.»</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {nodes.map((n) => (
                    <Card key={n.t} b={n.b} k={n.k} t={n.t} o={n.o} d={n.d + " — " + n.l + " • Ref: Pág. Portafolio"} />
                  ))}
                </div>
              </Layer>

              <Layer name="05 Matriz de Interconexión" set={setSel}>
                <p className="mb-4 max-w-xl font-serif text-lg italic leading-snug text-muted">Mapa de Conexiones • {pj.length} Obras × {d.disciplines.length} Disciplinas. Cada punto representa una ramificación activa entre investigación, método visual y ejecución técnica. Toca cualquier nodo para abrir la obra.</p>
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <div className="grid grid-cols-[170px_repeat(15,minmax(0,1fr))] gap-1 border-b border-ink/20 pb-2 text-center">
                      <span className="self-end text-left font-mono text-[10px] font-bold uppercase tracking-widest">Disciplina / Área</span>
                      {pj.map((p) => (
                        <button key={p.id} onClick={() => open(p)} title={`${p.title} (Pág. ${p.pageStart})`} className={`cursor-pointer font-mono text-[10px] font-bold transition-opacity hover:text-vino ${s.disc && !p.disciplines.includes(s.disc) ? "opacity-20" : ""}`}>
                          {p.number}
                        </button>
                      ))}
                    </div>
                    {d.disciplines.map((x) => (
                      <motion.div key={x.id} initial="h" whileInView="v" viewport={vp} transition={{ staggerChildren: 0.03 }} className={`grid grid-cols-[170px_repeat(15,minmax(0,1fr))] items-center gap-1 py-1.5 transition-colors ${s.disc === x.id ? "bg-vino/10" : ""}`}>
                        <button
                          onClick={() => commit({ disc: s.disc === x.id ? null : x.id }, s.disc === x.id ? "Quitó foco de disciplina" : "Enfocó " + x.name)}
                          className="flex cursor-pointer items-center justify-between pr-3 text-left font-sans text-xs font-semibold hover:text-vino"
                        >
                          {x.name}
                          <span className="bg-ink px-1.5 font-mono text-[10px] text-paper">{x.count}</span>
                        </button>
                        {pj.map((p) =>
                          p.disciplines.includes(x.id) ? (
                            <motion.button
                              key={p.id}
                              variants={{ h: { scale: 0, opacity: 0 }, v: { scale: 1, opacity: 1 } }}
                              whileHover={{ scale: 1.5 }}
                              onClick={() => open(p)}
                              aria-label={`Ver ${p.title} en ${x.name}`}
                              className="mx-auto grid size-4 cursor-pointer place-items-center rounded-full bg-vino"
                            >
                              <span className="size-1 rounded-full bg-white" />
                            </motion.button>
                          ) : (
                            <span key={p.id} className="mx-auto size-1 rounded-full bg-ink/15" />
                          )
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Layer>

              <Layer name="06 Habilidades & Herramientas" set={setSel}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...cvSkills, ...d.skills.map((x) => ({ c: x.category, i: x.items }))].map((g) => (
                    <div key={g.c} className="space-y-3 border border-ink/20 bg-paper p-4">
                      <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted">{g.c}</h4>
                      <div className="flex flex-wrap gap-2">
                        {g.i.map((t) => (
                          <motion.kbd key={t} whileHover={{ y: -3, backgroundColor: "#111", color: "#fff" }} className="border border-ink bg-white px-2.5 py-1 font-mono text-[11px] shadow-[0_2px_0_#111]">
                            {t}
                          </motion.kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Layer>
            </article>
          </div>

          <aside className="hidden w-44 shrink-0 border-l border-ink bg-paper lg:block">
            <p className="border-b border-ink px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest">Muestras</p>
            <div className="grid grid-cols-2 gap-2 p-3">
              {swatches.map(([c, n]) => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard?.writeText(c);
                    setCopied(c);
                  }}
                  title={`${n} ${c}`}
                  className="aspect-square cursor-pointer border border-ink"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="px-3 font-mono text-[10px] text-muted">{copied ? `Copiado ${copied}` : "Clic para copiar HEX"}</p>
          </aside>
        </div>
        <p className="flex flex-wrap justify-between gap-2 border-t border-ink bg-gris px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest">
          <span>Mesa de trabajo 1 de 1</span>
          <span>{pad(pj.length)} proyectos · {pad(d.disciplines.length)} disciplinas</span>
          <span>Selección: {sel}</span>
        </p>
      </div>
    </section>
  );
}
