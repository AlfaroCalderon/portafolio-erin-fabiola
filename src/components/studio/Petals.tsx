"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; life: number; c: string };
const COLORS = ["#FFFFFF", "#F6D9E2", "#E8B8C8", "#E8B8C8"];
const MAX = 36;

export default function Petals() {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = cv.current!, g = el.getContext("2d")!;
    const ps: P[] = [];
    let raf = 0, alive = true, lx = -1, ly = -1, acc = 0, last = 0;

    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      el.width = window.innerWidth * d;
      el.height = window.innerHeight * d;
      g.setTransform(d, 0, 0, d, 0, 0);
    };
    const isNight = () => document.documentElement.classList.contains("night");
    const move = (e: PointerEvent) => {
      if (isNight()) {
        acc = 0;
        lx = e.clientX;
        ly = e.clientY;
        return;
      }
      if (lx >= 0) acc += Math.hypot(e.clientX - lx, e.clientY - ly);
      lx = e.clientX;
      ly = e.clientY;
      while (acc > 26 && ps.length < MAX) {
        acc -= 26;
        ps.push({ x: lx + (Math.random() - 0.5) * 8, y: ly + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 22, vy: 10 + Math.random() * 22, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 4, s: 6 + Math.random() * 5, life: 1, c: COLORS[(Math.random() * COLORS.length) | 0] });
      }
      acc = Math.min(acc, 60);
    };
    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      if (!ps.length) return;
      g.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life -= dt * 0.7;
        if (p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }
        p.vy += 26 * dt;
        p.vx += Math.sin(now / 320 + p.r) * 12 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.globalAlpha = Math.min(p.life * 1.6, 1) * 0.9;
        g.fillStyle = p.c;
        g.strokeStyle = "rgba(139,35,84,.8)";
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(0, 0, p.s * 0.55, p.s, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.restore();
      }
      if (!ps.length) g.clearRect(0, 0, window.innerWidth, window.innerHeight);
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

  return <canvas ref={cv} aria-hidden className="cursor-root pointer-events-none fixed inset-0 z-[190] size-full" />;
}
