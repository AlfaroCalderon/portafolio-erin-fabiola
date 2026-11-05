"use client";

import { CSSProperties, forwardRef, useEffect, useRef, useState } from "react";
import { TreeData, buildTree } from "./treeGen";
import { TREE_IMAGE, WORLD_VH } from "./treeConfig";

const WOOD = "#5E5648"; // madera única: tronco, ramas y raíces (gris pardo del conacaste)

/**
 * "MUNDO" del árbol. Para que el scroll sea fluido:
 * - La madera es UNA capa estática (se rasteriza una sola vez; el scroll solo la desplaza).
 * - Las hojas van en WIND_LAYERS capas; cada capa se mece con una animación de transform (la hace el compositor, sin repintar).
 */
const TreeWorld = forwardRef<HTMLDivElement>(function TreeWorld(_, ref) {
  const box = useRef<HTMLDivElement | null>(null);
  const [t, setT] = useState<TreeData | null>(null);

  useEffect(() => {
    const el = box.current!;
    let id = 0, w = 0, h = 0;
    const ro = new ResizeObserver(([e]) => {
      const nw = e.contentRect.width, nh = window.innerHeight;
      if (Math.abs(nw - w) < 2 && Math.abs(nh - h) < h * 0.15) return; // ignora la barra del navegador móvil (evita regenerar al hacer scroll)
      w = nw;
      h = nh;
      cancelAnimationFrame(id);
      id = requestAnimationFrame(() => setT(buildTree(nw, nh)));
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div
      ref={(el) => {
        box.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      aria-hidden
      className="absolute inset-x-0 top-0 will-change-transform"
      style={{ height: `${WORLD_VH}vh`, backgroundImage: `url(${TREE_IMAGE})`, backgroundSize: "100% 100%" }}
    >
      <div className="absolute inset-x-0 top-0 h-[110vh] bg-[radial-gradient(ellipse_75%_55%_at_50%_30%,rgba(232,184,200,.55),rgba(232,184,200,.18)_55%,transparent_75%)]" />

      {t && (
        <>
          <svg width={t.W} height={t.H} className="absolute left-0 top-0 overflow-visible">
            <defs>
              <g id="lf0"><path d="M0 0C-9-8-8-26 0-40C8-26 9-8 0 0Z" /><path d="M0 0V-33" stroke="rgba(35,31,32,.28)" strokeWidth="1" fill="none" /></g>
              <g id="lf1"><path d="M0 0C-14-6-13-22 0-30C13-22 14-6 0 0Z" /><path d="M0 0V-25M0-9L-6-15M0-9L6-15M0-16L-5-21M0-16L5-21" stroke="rgba(35,31,32,.25)" strokeWidth=".8" fill="none" /></g>
              <g id="lf3"><path d="M0 0V-44" stroke="rgba(35,31,32,.35)" strokeWidth="1.2" fill="none" />{[[-8, -7], [-14, 11], [-20, -9], [-27, 12], [-34, -7]].map(([y, d], i) => (<g key={i}><path d={`M0 ${y}C${-11 - i} ${y - 2} ${-13 - i} ${y + d} ${-6} ${y + d + 3}C${-4} ${y + 6} ${-2} ${y + 2} 0 ${y}Z`} /><path d={`M0 ${y}C${11 + i} ${y - 2} ${13 + i} ${y + d} ${6} ${y + d + 3}C${4} ${y + 6} ${2} ${y + 2} 0 ${y}Z`} /></g>))}<path d="M0 -44C-5 -48 -4 -54 0 -58C4 -54 5 -48 0 -44Z" /></g>
              <g id="lf4">{[0, 72, 144, 216, 288].map((a) => (<path key={a} transform={`rotate(${a})`} d="M0 0C-9-5-11-17-5-22C-2-24 2-24 5-22C11-17 9-5 0 0Z" stroke="rgba(35,31,32,.2)" strokeWidth=".7" />))}<circle r="3.6" fill="#E08B2B" /><circle r="1.5" fill="#AA9821" /></g>
              <g id="lf2"><path d="M0 0C-5-10-6-30 0-48C6-30 5-10 0 0Z" /><path d="M0 0V-42" stroke="rgba(35,31,32,.25)" strokeWidth=".8" fill="none" /></g>
              {[["rimL", "#CDBFA3", ".2"], ["rimR", "#1F1B15", ".34"]].map(([id, c, o]) => (
                <linearGradient key={id} id={id} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={t.rimY[0]} y2={t.rimY[1]}>
                  <stop offset="0" stopColor={c} stopOpacity={o} />
                  <stop offset=".7" stopColor={c} stopOpacity={o} />
                  <stop offset="1" stopColor={c} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            <g stroke={WOOD} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {t.wood.map(([w, d]) => <path key={w} d={d} strokeWidth={w} />)}
            </g>
            <path d={t.trunk} fill={WOOD} />
            <path d={t.roots} fill={WOOD} stroke={WOOD} strokeWidth="1.5" strokeLinejoin="round" />
            <path d={t.rootHi} fill="#CDBFA3" fillOpacity=".2" />
            <path d={t.rootLo} fill="#1F1B15" fillOpacity=".3" />
            {t.caps.map((c, i) => <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill={WOOD} />)}
            <g fill="none" strokeLinecap="butt" strokeLinejoin="round">
              <path d={t.bark[0]} stroke="#2A251C" strokeOpacity=".4" strokeWidth="2" />
              <path d={t.bark[1]} stroke="#3F382C" strokeOpacity=".4" strokeWidth="3" />
              <path d={t.bark[2]} stroke="#C2B596" strokeOpacity=".32" strokeWidth="1.6" />
              <path d={t.rim[0]} stroke="url(#rimL)" strokeWidth={t.tw * 0.32} />
              <path d={t.rim[1]} stroke="url(#rimR)" strokeWidth={t.tw * 0.32} />
            </g>
          </svg>

          {t.layers.map((leaves, i) => (
            <svg
              key={i}
              width={t.W}
              height={t.H}
              className="wind absolute left-0 top-0 overflow-visible"
              style={{ "--dur": `${5.2 + i * 1.7}s`, "--dx": `${2.5 + (i % 2) * 1.5}px`, animationDelay: `${-i * 2.3}s` } as CSSProperties}
            >
              {leaves.map((l, j) => (
                <use key={j} href={`#lf${l.t}`} fill={l.c} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.r.toFixed(0)}) scale(${l.s.toFixed(2)})`} />
              ))}
            </svg>
          ))}
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 h-[16vh] bg-gradient-to-b from-transparent to-white" />
    </div>
  );
});

export default TreeWorld;
