"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ease } from "./kit";

const WORD = "ANASTOMOSIS";
const G = "anastomosis";
const TEXTS = ["¡Hola, soy Erin, me alegra mucho tenerte acá!", "Quiero mostrarte un poco de mi trabajo."];
const FONT = '900 100px "Arial Black", Arial, Helvetica, sans-serif';
const MONO = 'ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace';
const D = 4200;
const ROSA = "232,184,200";

const hash = (a: number, b: number, c = 0) => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const rnd = (a: number, b: number, c: number) => G[(hash(a, b, c) * G.length) | 0];

function wordMask(cols: number, rows: number, k: number, mobile: boolean) {
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const g = c.getContext("2d")!;
  const sy = k * (mobile ? 1.6 : 1.35), lines = mobile ? ["ANAST", "OMOSIS"] : [WORD];
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineJoin = "round";
  g.font = FONT;
  const wmax = Math.max(...lines.map((l) => g.measureText(l).width));
  const render = (size: number, ox: number, oy: number) => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cols, rows);
    g.setTransform(1, 0, 0, sy, 0, 0);
    g.font = FONT.replace("100px", `${size}px`);
    g.lineWidth = size * (mobile ? 0.02 : 0.07);
    lines.forEach((l, i) => {
      const y = (rows / 2 + oy) / sy + (i - (lines.length - 1) / 2) * size * 1.05;
      g.strokeText(l, cols / 2 + ox, y);
      g.fillText(l, cols / 2 + ox, y);
    });
    return g.getImageData(0, 0, cols, rows).data;
  };
  const bbox = (d: Uint8ClampedArray) => {
    let x0 = cols, x1 = 0, y0 = rows, y1 = 0;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (d[(y * cols + x) * 4 + 3] > 90) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    return { x0, x1, y0, y1 };
  };
  const size0 = ((cols * 0.5) / wmax) * 100, t = bbox(render(size0, 0, 0));
  const bw = Math.max(t.x1 - t.x0 + 1, 1), bh = Math.max(t.y1 - t.y0 + 1, 1);
  const f = Math.min((cols * (mobile ? 0.8 : 0.88)) / bw, (rows * (mobile ? 0.3 : 0.6)) / bh);
  const d = render(size0 * f, -((t.x0 + t.x1) / 2 - cols / 2) * f, -((t.y0 + t.y1) / 2 - rows / 2) * f);
  const m = new Uint8Array(cols * rows);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 90 ? 1 : 0;
  return m;
}

function Field({ dim, onLoaded }: { dim: boolean; onLoaded: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const counter = useRef<HTMLParagraphElement>(null);
  const done = useRef(onLoaded);
  useEffect(() => {
    done.current = onLoaded;
  });

  useEffect(() => {
    const el = cv.current!, g = el.getContext("2d")!;
    const bgc = document.createElement("canvas"), bg = bgc.getContext("2d")!;
    let raf = 0, alive = true, fired = false, t0 = 0, last = -1e9;
    let W = 0, H = 0, cols = 0, rows = 0, cw = 7, ch = 10, m = new Uint8Array(0);
    const mouse = { x: -99, y: -99 };

    const setup = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), mobile = W < 640;
      cw = mobile ? 3.4 : 6;
      ch = mobile ? 5.4 : 9;
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch);
      for (const c of [el, bgc]) {
        c.width = W * dpr;
        c.height = H * dpr;
      }
      for (const x of [g, bg]) {
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.font = `700 ${ch}px ${MONO}`;
        x.textAlign = "center";
        x.textBaseline = "middle";
      }
      m = wordMask(cols, rows, cw / ch, mobile);
      last = -1e9;
    };

    const frame = (now: number) => {
      if (!alive) return;
      if (!t0) t0 = now;
      const t = now - t0;

      if (t - last > 150) {
        last = t;
        const f = Math.floor(t / 150);
        bg.clearRect(0, 0, W, H);
        bg.fillStyle = `rgba(${ROSA},.075)`;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (hash(x, y, f) < 0.5) bg.fillText(rnd(y, x, f), x * cw + cw / 2, y * ch + ch / 2);
      }
      g.clearRect(0, 0, W, H);
      g.drawImage(bgc, 0, 0, W, H);

      const e = Math.min(t / D, 1), p = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
      const front = p * (cols + 30) - 15, band = (((t / 1000) % 2.6) / 2.6) * (cols + 30) - 15;
      const mx = mouse.x / cw, my = mouse.y / ch, f70 = Math.floor(t / 70), f160 = Math.floor(t / 160);

      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          if (!m[y * cols + x]) continue;
          const age = front - (x + y * 0.3 + hash(x, y) * 8 - 4);
          const px = x * cw + cw / 2, py = y * ch + ch / 2;
          if (age < 0) {
            if (age > -12) {
              g.fillStyle = `rgba(${ROSA},${0.6 * (1 + age / 12)})`;
              g.fillText(rnd(x, y, f70), px, py);
            }
            continue;
          }
          g.fillStyle = "#8b2354";
          g.fillRect(x * cw, y * ch, cw, ch);
          const near = Math.hypot(x - mx, ((y - my) * ch) / cw) < 8;
          const glitch = hash(x, y, f160) < 0.03;
          const hot = age < 2 || near || glitch || Math.abs(x + y * 0.3 - band) < 4;
          g.fillStyle = hot ? `rgb(${ROSA})` : `rgba(255,255,255,${0.8 + 0.2 * Math.sin(x * 0.3 - t * 0.004 + y * 0.35)})`;
          g.fillText(age < 14 || glitch || near ? rnd(x, y, f70) : G[(x * 5 + y * 3) % G.length], px, py);
        }

      if (mouse.x > -50)
        for (let dy = -8; dy <= 8; dy++)
          for (let dx = -8; dx <= 8; dx++) {
            const x = Math.round(mx) + dx, y = Math.round(my) + dy, d = Math.hypot(dx, (dy * ch) / cw);
            if (d >= 8 || x < 0 || y < 0 || x >= cols || y >= rows || m[y * cols + x]) continue;
            g.fillStyle = `rgba(255,255,255,${0.55 * (1 - d / 8)})`;
            g.fillText(rnd(x, y, f70), x * cw + cw / 2, y * ch + ch / 2);
          }

      if (counter.current) counter.current.textContent = `cargando ${String(Math.round(p * 100)).padStart(3, "0")}%`;
      if (!fired && t > D + 900) {
        fired = true;
        done.current();
      }
      raf = requestAnimationFrame(frame);
    };

    const move = (ev: PointerEvent) => {
      mouse.x = ev.clientX;
      mouse.y = ev.clientY;
    };
    let rt = 0;
    const resize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(setup, 200);
    };
    setup();
    raf = requestAnimationFrame(frame);
    window.addEventListener("pointermove", move);
    window.addEventListener("resize", resize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={cv} role="img" aria-label="anastomosis" className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000" style={{ opacity: dim ? 0.2 : 1 }} />
      <p ref={counter} className={`pointer-events-none absolute left-1/2 top-[70%] -translate-x-1/2 font-mono text-[11px] uppercase tracking-[.3em] text-rosa transition-opacity duration-700 ${dim ? "opacity-0" : ""}`} />
    </>
  );
}

export const WELCOME_DONE = "welcome-done";

export default function Welcome() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    if (!show) window.dispatchEvent(new Event(WELCOME_DONE));
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  useEffect(() => {
    if (step < 1) return;
    const t = setTimeout(() => (step < 3 ? setStep(step + 1) : setShow(false)), step === 1 ? 2600 : 2400);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div data-welcome exit={{ y: "-100%" }} transition={{ duration: 1.1, ease }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-vino text-white">
          <Field dim={step >= 1} onLoaded={() => setStep((s) => s || 1)} />
          <AnimatePresence mode="wait">
            {step >= 1 && (
              <motion.div key={step} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.8, ease }} className="relative max-w-3xl px-6 text-center">
                {step < 3 ? <p className="text-3xl leading-tight sm:text-5xl">{TEXTS[step - 1]}</p> : <p className="font-mono text-[11px] uppercase tracking-[.3em] text-rosa">Comienza el recorrido ↓</p>}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setShow(false)} className="absolute bottom-8 right-8 cursor-pointer font-mono text-[11px] uppercase tracking-[.25em] text-white/70 transition-colors hover:text-white">
            Saltar →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
