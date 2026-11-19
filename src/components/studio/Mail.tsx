"use client";

import { useState } from "react";

const TO = "afigueroa.erin@gmail.com";
const KEY = "anastomosis:semillas";

export function mailLink(f: { name: string; from: string; msg: string; seeds: boolean }, saved: string | null) {
  let extra = "";
  if (f.seeds) {
    try {
      const n = (JSON.parse(saved ?? "[]") as unknown[]).length;
      if (n) extra = `\n\n🌱 Dejé ${n} ${n === 1 ? "semilla" : "semillas"} en tu árbol del agradecimiento.`;
    } catch {}
  }
  const body = `${f.msg.trim()}${extra}\n\n— ${f.name.trim() || "Alguien que visitó Anastomosis"}${f.from.trim() ? `\n${f.from.trim()}` : ""}`;
  return `mailto:${TO}?subject=${encodeURIComponent("Hola Erin, te escribo desde Anastomosis")}&body=${encodeURIComponent(body)}`;
}

export default function Mail() {
  const [f, setF] = useState({ name: "", from: "", msg: "", seeds: true });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const link = mailLink(f, localStorage.getItem(KEY));
    const a = document.createElement("a");
    a.href = link;
    a.dataset.mailto = link;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const field = "w-full border-b-2 border-ink/25 bg-transparent py-3 font-serif text-xl text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-vino";
  const label = "block font-mono text-[10px] uppercase tracking-[.25em] text-vino";

  return (
    <div id="escribeme" className="relative overflow-hidden bg-[#F6E4EB] px-6 py-24 text-ink sm:px-12 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute -right-10 top-10 select-none font-sans text-[34vw] uppercase leading-none text-vino/[.07] sm:text-[22vw]">hola</div>
      <div aria-hidden className="absolute inset-x-0 top-0 h-3 bg-[repeating-linear-gradient(135deg,#8B2354_0_22px,transparent_22px_44px,#E8B8C8_44px_66px,transparent_66px_88px)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <p className="inline-block bg-vino px-3 py-1 font-mono text-[11px] uppercase tracking-[.25em] text-white">Escríbeme</p>
          <h3 className="font-sans text-[13.5vw] uppercase leading-[.82] tracking-tighter text-vino sm:text-9xl">
            ¿Hablamos<span className="text-ochre">?</span>
          </h3>
          <p className="max-w-md font-serif text-2xl leading-snug">
            Cuéntame qué te pareció el recorrido, una idea o un proyecto. Se abre tu correo con el mensaje ya escrito.
          </p>
          <a href={`mailto:${TO}`} className="inline-flex items-center gap-3 border-2 border-ink px-4 py-3 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-white">
            <span aria-hidden>✉</span>
            {TO}
          </a>
        </div>

        <form onSubmit={send} className="relative -rotate-1 border-2 border-ink bg-white p-6 shadow-[10px_10px_0_#8B2354] sm:p-9">
          <div aria-hidden className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(135deg,#8B2354_0_14px,#fff_14px_28px,#AA9821_28px_42px,#fff_42px_56px)]" />
          <div className="mb-7 mt-2 flex items-start justify-between gap-4">
            <p className="font-hand text-3xl leading-none text-vino">querida Erin:</p>
            <svg aria-hidden viewBox="-30 -30 60 60" className="size-14 shrink-0 -rotate-6 opacity-90">
              {[0, 72, 144, 216, 288].map((a) => (
                <path key={a} transform={`rotate(${a})`} d="M0 0C-9-5-11-17-5-22C-2-24 2-24 5-22C11-17 9-5 0 0Z" fill="#fff" stroke="#8B2354" strokeWidth="1.2" />
              ))}
              <circle r="4.2" fill="#E08B2B" />
            </svg>
          </div>
          <div className="space-y-6">
            <label className="block">
              <span className={label}>De parte de</span>
              <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} placeholder="Tu nombre" className={field} />
            </label>
            <label className="block">
              <span className={label}>Para responderte</span>
              <input value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} maxLength={80} type="email" placeholder="Tu correo (opcional)" className={field} />
            </label>
            <label className="block">
              <span className={label}>Mensaje</span>
              <textarea required value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} maxLength={1000} rows={4} placeholder="Escribe aquí…" className={`${field} resize-none`} />
            </label>
            <label className="flex cursor-pointer items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
              <input type="checkbox" checked={f.seeds} onChange={(e) => setF({ ...f, seeds: e.target.checked })} className="size-4 accent-[#8B2354]" />
              Contarle cuántas semillas dejé
            </label>
            <button type="submit" className="group flex w-full cursor-pointer items-center justify-between bg-vino px-6 py-4 font-mono text-[12px] uppercase tracking-[.25em] text-white transition-colors hover:bg-ink">
              Enviar mensaje
              <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
