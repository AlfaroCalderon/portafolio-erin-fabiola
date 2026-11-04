"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, ReactNode, MutableRefObject } from "react";
import { MotionValue, useMotionValue } from "framer-motion";

export type S = {
  order: string[];
  grid: boolean;
  rulers: boolean;
  stamp: string;
  pinned: string[];
  disc: string | null;
  lab: string;
};
type Step = { id: string; l: string };
type St = { past: S[]; now: S; future: S[]; steps: Step[]; msg: string; tick: number };
type A =
  | { t: "c"; p: Partial<S>; l: string }
  | { t: "u" }
  | { t: "r" }
  | { t: "j"; i: number }
  | { t: "s"; step: Step }
  | { t: "b" }
  | { t: "n" };

const red = (st: St, a: A): St => {
  const m = (msg: string) => ({ msg, tick: st.tick + 1 });
  switch (a.t) {
    case "c":
      return { ...st, past: [...st.past.slice(-49), st.now], now: { ...st.now, ...a.p, lab: a.l }, future: [], ...m(a.l) };
    case "u":
      return st.past.length ? { ...st, past: st.past.slice(0, -1), now: st.past[st.past.length - 1], future: [st.now, ...st.future], ...m("Ctrl Z · " + st.now.lab) } : st;
    case "r":
      return st.future.length ? { ...st, past: [...st.past, st.now], now: st.future[0], future: st.future.slice(1), ...m("Rehecho · " + st.future[0].lab) } : st;
    case "j": {
      const all = [...st.past, st.now, ...st.future];
      return a.i < 0 || a.i >= all.length ? st : { ...st, past: all.slice(0, a.i), now: all[a.i], future: all.slice(a.i + 1), ...m("Salto · " + all[a.i].lab) };
    }
    case "s":
      return st.steps.length && st.steps[st.steps.length - 1].id === a.step.id ? st : { ...st, steps: [...st.steps.slice(-39), a.step] };
    case "b":
      return { ...st, steps: st.steps.slice(0, -1), ...m("Ctrl Z · Volver a " + st.steps[st.steps.length - 2].l) };
    default:
      return { ...st, ...m("No hay nada más para deshacer") };
  }
};

type Ctx = {
  s: S;
  commit: (p: Partial<S>, l: string) => void;
  undo: () => void;
  redo: () => void;
  jump: (i: number) => void;
  logStep: (id: string, l: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  labs: string[];
  idx: number;
  msg: string;
  tick: number;
  replay: number;
  hist: boolean;
  setHist: (v: boolean) => void;
  nav: MutableRefObject<boolean>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
};

const C = createContext<Ctx | null>(null);

export function StudioProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const [st, d] = useReducer(red, {
    past: [],
    future: [],
    steps: [],
    msg: "",
    tick: 0,
    now: { order: ids, grid: true, rulers: true, stamp: "conacaste", pinned: [], disc: null, lab: "Estado inicial" },
  });
  const [replay, setReplay] = useState(0);
  const [hist, setHist] = useState(false);
  const nav = useRef(false);
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const ref = useRef<Ctx | null>(null);

  const v = useMemo<Ctx>(() => {
    const undo = () => {
      if (st.past.length) d({ t: "u" });
      else if (st.steps.length > 1) {
        nav.current = true;
        d({ t: "b" });
        document.getElementById(st.steps[st.steps.length - 2].id)?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => (nav.current = false), 1400);
      } else {
        d({ t: "n" });
        setReplay((n) => n + 1);
      }
    };
    return {
      s: st.now,
      commit: (p, l) => d({ t: "c", p, l }),
      undo,
      redo: () => d({ t: "r" }),
      jump: (i) => d({ t: "j", i }),
      logStep: (id, l) => d({ t: "s", step: { id, l } }),
      canUndo: st.past.length > 0 || st.steps.length > 1,
      canRedo: st.future.length > 0,
      labs: [...st.past, st.now, ...st.future].map((x) => x.lab),
      idx: st.past.length,
      msg: st.msg,
      tick: st.tick,
      replay,
      hist,
      setHist,
      nav,
      mx,
      my,
    };
  }, [st, replay, hist, mx, my]);

  useEffect(() => {
    ref.current = v;
  });

  useEffect(() => {
    const m = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/INPUT|TEXTAREA/.test(t.tagName) || t.isContentEditable) return;
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "z" || key === "y")) {
        e.preventDefault();
        if (key === "y" || e.shiftKey) ref.current?.redo();
        else ref.current?.undo();
      }
    };
    window.addEventListener("pointermove", m, { passive: true });
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("pointermove", m);
      window.removeEventListener("keydown", k);
    };
  }, [mx, my]);

  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useStudio() {
  const c = useContext(C);
  if (!c) throw new Error("useStudio fuera de StudioProvider");
  return c;
}
