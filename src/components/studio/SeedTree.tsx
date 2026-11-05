"use client";

import { useEffect, useRef, useState } from "react";

type Seed = { tx: number; ty: number; x: number; y: number; vy: number; delay: number; r: number; c: string; kind: "wood" | "leaf" | "flower"; mine: boolean; rec?: Spot; live: boolean; b: number; ox: number; oy: number };
type Spot = { x: number; y: number; name?: string; msg?: string };

const KEY = "anastomosis:semillas";
const MAX = 80;
const LEAF = ["#6F6B30", "#6F6B30", "#AA9821", "#AA9821", "#E8B8C8"];
const rng = (a: number) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function build(w: number, h: number): Seed[] {
  const R = rng(11), out: Seed[] = [], cx = w / 2;
  const mk = (tx: number, ty: number, kind: Seed["kind"], r: number, c: string) =>
    out.push({ tx, ty, x: tx, y: ty, vy: 0, delay: (1 - ty / h) * 2.1 + R() * 0.5, r, c, kind, mine: false, live: false, b: 0, ox: 0, oy: 0 });
  const topY = h * 0.4, baseY = h * 0.76, hw = (y: number) => w * (0.034 + 0.05 * Math.pow(Math.max((y - topY) / (baseY - topY), 0), 3));

  for (let y = topY; y < baseY; y += 6) for (let x = -hw(y); x <= hw(y); x += 6) mk(cx + x + (R() - 0.5) * 2, y + (R() - 0.5) * 2, "wood", 2.6, "#E8B8C8");
  for (let k = 0; k < 9; k++) {
    const u = (k / 8) * 2 - 1, x0 = cx + u * hw(baseY) * 0.6, x1 = cx + u * w * 0.46, y1 = h * (0.9 + 0.07 * (1 - Math.abs(u)));
    for (let i = 0; i <= 30; i++) {
      const t = i / 30, x = x0 + (x1 - x0) * Math.pow(t, 1.15), y = baseY - 18 + (y1 - baseY + 18) * Math.pow(t, 0.55), th = Math.max(1, 3.4 * (1 - t));
      for (let j = 0; j < th; j++) mk(x + (j - th / 2) * 5, y, "wood", 2.4 - t, "#E8B8C8");
    }
  }
  for (let k = 0; k < 8; k++) {
    const u = (k / 7) * 2 - 1, ex = cx + u * w * 0.34, ey = h * (0.3 - 0.06 * (1 - Math.abs(u)));
    for (let i = 0; i <= 22; i++) {
      const t = i / 22;
      mk(cx + (ex - cx) * t, topY + (ey - topY) * Math.pow(t, 0.85), "wood", 2.4 - t * 0.8, "#E8B8C8");
    }
  }
  const lobes: [number, number, number, number][] = [[0.5, 0.3, 0.47, 0.17], [0.27, 0.36, 0.22, 0.1], [0.73, 0.36, 0.22, 0.1], [0.5, 0.2, 0.3, 0.11]];
  for (let y = 0; y < h * 0.5; y += 8) for (let x = 0; x < w; x += 8) {
    const px = x + (R() - 0.5) * 6, py = y + (R() - 0.5) * 6;
    if (!lobes.some(([lx, ly, rx, ry]) => ((px - lx * w) / (rx * w)) ** 2 + ((py - ly * h) / (ry * h)) ** 2 < 1) || R() < 0.1) continue;
    const f = R() < 0.14;
    mk(px, py, f ? "flower" : "leaf", f ? 3.6 : 2.7 + R() * 1.1, f ? "#FFFFFF" : LEAF[Math.floor(R() * LEAF.length)]);
  }
  return out;
}

const hot = (p: { x: number; y: number } | null, x: number, y: number) => !!p && Math.hypot(p.x - x, p.y - y) < 16;

function drawFlower(g: CanvasRenderingContext2D, k: number) {
  g.scale(k, k);
  g.fillStyle = "#FFFFFF";
  g.strokeStyle = "rgba(139,35,84,.55)";
  g.lineWidth = 0.8;
  for (let a = 0; a < 5; a++) {
    const r = (a * Math.PI * 2) / 5 - 1.57;
    g.beginPath();
    g.ellipse(Math.cos(r) * 5.2, Math.sin(r) * 5.2, 4.6, 3, r, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  g.fillStyle = "#E08B2B";
  g.beginPath();
  g.arc(0, 0, 3, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#AA9821";
  g.beginPath();
  g.arc(0, 0, 1.3, 0, Math.PI * 2);
  g.fill();
}

const nearest = (s: Seed[], p: Spot, w: number, h: number) => {
  let best = -1, bd = 1e9;
  s.forEach((q, i) => {
    if (q.kind === "wood" || q.mine) return;
    const d = (q.tx - p.x * w) ** 2 + (q.ty - p.y * h) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
};

export default function SeedTree() {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef<{ seeds: Seed[]; saved: Spot[]; w: number; h: number; t0: number; seen: boolean; ptr: Spot | null; reduce: boolean }>({ seeds: [], saved: [], w: 0, h: 0, t0: 0, seen: false, ptr: null, reduce: false });
  const [count, setCount] = useState(0);

  const plant = (spot: Spot, fall: boolean) => {
    const s = st.current, i = nearest(s.seeds, spot, s.w, s.h);
    if (i < 0) return false;
    const q = s.seeds[i];
    Object.assign(q, { mine: true, rec: spot, kind: "flower", r: 6.5, c: "#FFFFFF", live: !fall, x: q.tx, y: fall ? -20 : q.ty, vy: 0, b: 0, delay: fall ? (performance.now() - s.t0) / 1000 : q.delay });
    return true;
  };

  useEffect(() => {
    const el = cv.current!, g = el.getContext("2d")!, s = st.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = 0, alive = true;

    const setup = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = r.width * dpr;
      el.height = r.height * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = r.width;
      s.h = r.height;
      s.seeds = build(r.width, r.height);
      try {
        s.saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      } catch {
        s.saved = [];
      }
      s.saved.forEach((p) => plant(p, false));
      s.seeds.forEach((q) => {
        q.live = s.reduce;
        q.y = s.reduce ? q.ty : -30 - Math.random() * 160;
      });
      s.t0 = performance.now();
      setCount(s.saved.length);
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      if (!s.seen) {
        s.t0 = now;
        return;
      }
      const t = (now - s.t0) / 1000;
      g.clearRect(0, 0, s.w, s.h);
      for (const q of s.seeds) {
        if (!q.live) {
          if (t < q.delay) continue;
          q.live = true;
          q.x = q.tx + (Math.random() - 0.5) * 24;
        }
        if (q.y < q.ty || q.vy < 0) {
          q.vy += 1900 * dt;
          q.y += q.vy * dt;
          q.x += (q.tx - q.x) * Math.min(dt * 7, 1);
          if (q.y >= q.ty) {
            q.y = q.ty;
            q.x = q.tx;
            q.vy = q.b < 2 && q.vy > 260 ? -q.vy * 0.32 : 0;
            q.b++;
          }
        }
        if (s.ptr) {
          const dx = q.tx - s.ptr.x, dy = q.ty - s.ptr.y, d = Math.hypot(dx, dy);
          if (d < 46) {
            q.ox += (dx / (d || 1)) * (46 - d) * 0.14;
            q.oy += (dy / (d || 1)) * (46 - d) * 0.14;
          }
        }
        q.ox *= 0.88;
        q.oy *= 0.88;
        const x = q.x + q.ox, y = q.y + q.oy;
        g.fillStyle = q.c;
        if (q.mine) {
          const grow = Math.min(1, Math.max(0, (now - s.t0) / 1000 - q.delay) * 0.8 + 0.2);
          g.save();
          g.translate(x, y);
          g.scale(grow, grow);
          drawFlower(g, hot(s.ptr, x, y) ? 1.3 : 1);
          g.restore();
          continue;
        }
        g.beginPath();
        g.arc(x, y, q.r, 0, Math.PI * 2);
        g.fill();
      }
    };

    const io = new IntersectionObserver(([e]) => (s.seen = s.seen || e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    let rt = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = window.setTimeout(setup, 150);
    });
    ro.observe(el);
    setup();
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const [draft, setDraft] = useState<Spot | null>(null);
  const [form, setForm] = useState({ name: "", msg: "" });
  const [tip, setTip] = useState<{ x: number; y: number; name: string; msg: string } | null>(null);

  const commit = () => {
    const s = st.current;
    if (!draft || s.saved.length >= MAX) return;
    const spot: Spot = { ...draft, name: form.name.trim().slice(0, 30), msg: form.msg.trim().slice(0, 120) };
    if (!plant(spot, true)) return;
    s.saved.push(spot);
    localStorage.setItem(KEY, JSON.stringify(s.saved));
    setCount(s.saved.length);
    setDraft(null);
    setForm({ name: "", msg: "" });
  };
  const point = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  const clear = () => {
    const s = st.current;
    localStorage.removeItem(KEY);
    s.saved = [];
    s.seeds = build(s.w, s.h).map((q) => ({ ...q, live: true, y: q.ty }));
    setCount(0);
    setTip(null);
  };
  const look = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect(), s = st.current;
    s.ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
    const q = s.seeds.find((q) => q.mine && q.rec && Math.hypot(q.x - s.ptr!.x, q.y - s.ptr!.y) < 14);
    setTip(q?.rec ? { x: q.x, y: q.y, name: q.rec.name ?? "", msg: q.rec.msg ?? "" } : null);
  };

  const field = "w-full border-b border-white/50 bg-transparent py-2 font-serif text-lg text-white outline-none placeholder:text-white/40 focus:border-white";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="relative">
        <canvas
          ref={cv}
          data-cursor
          aria-label="Árbol del agradecimiento: toca para dejar tu semilla"
          role="img"
          onPointerDown={(e) => setDraft(point(e))}
          onPointerMove={look}
          onPointerLeave={() => {
            st.current.ptr = null;
            setTip(null);
          }}
          className="aspect-[4/5] w-full touch-manipulation"
        />
        {tip && (
          <div style={{ left: tip.x, top: tip.y }} className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+14px)] bg-white p-3 text-ink shadow-xl">
            <p className="font-mono text-[10px] uppercase tracking-widest text-vino">Una flor del árbol</p>
            <p className="mt-1 font-serif text-lg leading-tight">{tip.msg || "Una semilla en silencio"}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{tip.name ? `— ${tip.name}` : "— anónimo"}</p>
          </div>
        )}
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
            className="absolute inset-x-0 bottom-0 z-20 space-y-3 bg-vino/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,.25)] backdrop-blur"
          >
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#E8B8C8]">Tu semilla</p>
            <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={30} placeholder="Tu nombre (opcional)" className={field} />
            <input value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} maxLength={120} placeholder="Una frase para el árbol (opcional)" className={field} />
            <div className="flex justify-end gap-3 font-mono text-[11px] uppercase tracking-widest">
              <button type="button" onClick={() => setDraft(null)} className="cursor-pointer px-2 py-2 text-white/60 hover:text-white">Cancelar</button>
              <button type="submit" className="cursor-pointer bg-white px-4 py-2 text-vino transition-opacity hover:opacity-85">Plantar</button>
            </div>
          </form>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-white">
        <span>{count ? `Dejaste ${count} ${count === 1 ? "semilla" : "semillas"}` : "Toca el árbol para dejar tu semilla"}</span>
        <span className="flex gap-3">
          <button onClick={() => setDraft({ x: 0.2 + Math.random() * 0.6, y: 0.1 + Math.random() * 0.3 })} className="cursor-pointer border border-white px-3 py-2 transition-colors hover:bg-white hover:text-vino">
            Dejar una semilla
          </button>
          {count > 0 && (
            <button onClick={clear} className="cursor-pointer px-1 py-2 text-white/60 transition-colors hover:text-white">
              Borrar
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
