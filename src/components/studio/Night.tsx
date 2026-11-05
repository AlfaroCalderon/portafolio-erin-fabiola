"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const KEY = "anastomosis:noche";
const N = 34;
type F = { x: number; y: number; vx: number; vy: number; ph: number; sp: number };

function Fireflies() {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = cv.current!, g = el.getContext("2d")!, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let W = 0, H = 0, raf = 0, alive = true, last = 0;
    const m = { x: -999, y: -999 };
    const fs: F[] = [];
    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      el.width = W * d;
      el.height = H * d;
      g.setTransform(d, 0, 0, d, 0, 0);
      if (!fs.length) for (let i = 0; i < (W < 700 ? 18 : N); i++) fs.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, ph: Math.random() * 6.28, sp: 0.5 + Math.random() });
    };
    const move = (e: PointerEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
    };
    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      for (const f of fs) {
        const t = now / 1000;
        f.vx += (Math.cos(t * f.sp + f.ph) * 14 - f.vx * 0.6) * dt;
        f.vy += (Math.sin(t * f.sp * 0.8 + f.ph * 2) * 12 - f.vy * 0.6) * dt;
        if (!reduce && fine) {
          const dx = m.x - f.x, dy = m.y - f.y, d = Math.hypot(dx, dy);
          if (d < 260 && d > 8) {
            f.vx += (dx / d) * 70 * dt;
            f.vy += (dy / d) * 70 * dt;
          }
        }
        f.x += f.vx * dt * 3;
        f.y += f.vy * dt * 3;
        if (f.x < -20) f.x = W + 20;
        if (f.x > W + 20) f.x = -20;
        if (f.y < -20) f.y = H + 20;
        if (f.y > H + 20) f.y = -20;
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 * f.sp + f.ph));
        const r = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, 16);
        r.addColorStop(0, `rgba(255,236,150,${a})`);
        r.addColorStop(0.35, `rgba(232,184,110,${a * 0.35})`);
        r.addColorStop(1, "rgba(232,184,110,0)");
        g.fillStyle = r;
        g.beginPath();
        g.arc(f.x, f.y, 16, 0, Math.PI * 2);
        g.fill();
      }
      g.globalCompositeOperation = "source-over";
    };
    size();
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return <canvas ref={cv} aria-hidden className="pointer-events-none fixed inset-0 z-[35] size-full" />;
}

export default function Night() {
  const [on, setOn] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      loaded.current = true;
      setOn(localStorage.getItem(KEY) === "1");
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("night", on);
    if (loaded.current) localStorage.setItem(KEY, on ? "1" : "0");
  }, [on]);

  return (
    <>
      <AnimatePresence>
        {on && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Fireflies />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOn(!on)}
        aria-pressed={on}
        aria-label={on ? "Volver al día" : "Activar modo noche"}
        className="fixed bottom-6 left-6 z-[60] grid size-11 cursor-pointer place-items-center rounded-full border border-ink/30 bg-white/90 text-ink shadow-lg backdrop-blur transition-colors hover:bg-vino hover:text-white"
      >
        {on ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
    </>
  );
}
