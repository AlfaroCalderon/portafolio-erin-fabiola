"use client";

import { CSSProperties, forwardRef, useEffect, useRef, useState } from "react";
import { TreeData, buildTree } from "./treeGen";
import { TREE_IMAGE, WORLD_VH } from "./treeConfig";

const WOOD = "#6B672E"; // madera única: tronco, ramas y raíces (así las uniones no se notan)

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
              <g id="lf2"><path d="M0 0C-5-10-6-30 0-48C6-30 5-10 0 0Z" /><path d="M0 0V-42" stroke="rgba(35,31,32,.25)" strokeWidth=".8" fill="none" /></g>
              {[["rimL", "#C9BF6E", ".18"], ["rimR", "#26230D", ".3"]].map(([id, c, o]) => (
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
            {t.caps.map((c, i) => <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill={WOOD} />)}
            <g fill="none" strokeLinecap="butt" strokeLinejoin="round">
              <path d={t.bark[0]} stroke="#2E2A10" strokeOpacity=".4" strokeWidth="2" />
              <path d={t.bark[1]} stroke="#4A4620" strokeOpacity=".45" strokeWidth="3.2" />
              <path d={t.bark[2]} stroke="#B3A95A" strokeOpacity=".35" strokeWidth="1.6" />
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
