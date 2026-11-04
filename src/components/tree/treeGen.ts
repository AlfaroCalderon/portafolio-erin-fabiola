import { BRANCHES, CROWN_BOUGHS, EXTRA_BRANCHES_VH, GAP_VW, GAP_VW_MOBILE, LEAF_COLORS, LEAF_DENSITY, MOBILE_BP, ROOT_COUNT, TREE_SEED, WIND_LAYERS, WORLD_VH } from "./treeConfig";

/** Generador procedural: devuelve datos puros. Toda la madera sale en pocos trazos agrupados por grosor (poco DOM). */
export type Leaf = { x: number; y: number; r: number; s: number; c: string; t: number };
export type TreeData = {
  W: number;
  H: number;
  cx: number;
  tw: number;
  wood: [number, string][];
  trunk: string;
  caps: { x: number; y: number; rx: number; ry: number }[];
  bark: string[];
  rim: [string, string];
  rimY: [number, number];
  layers: Leaf[][];
};

const rng = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n: number) => n.toFixed(1);

export function buildTree(W: number, vh: number): TreeData {
  const R = rng(TREE_SEED);
  const H = (WORLD_VH * vh) / 100;
  const mobile = W < MOBILE_BP;
  const k = Math.min(Math.max(W / 1440, 0.6), 1.1);
  const cx = W / 2;
  const top = vh * 0.3; // dónde nace la copa en el tronco
  const ground = H - vh * 0.62; // ★ dónde empiezan las raíces (queda ~60vh de raíces hasta el final)
  const base = ground + vh * 0.1;
  const tw = Math.max(36, Math.min(96, W * 0.06)); // ★ grosor del tronco arriba
  const bw = tw * 3; // grosor en la base (ensanchamiento)
  const sway = (y: number) => Math.sin(y / (vh * 1.6)) * W * 0.008;
  const wAt = (y: number) => tw + (bw - tw) * Math.pow(Math.min(Math.max((y - top) / (ground - top), 0), 1.15), 3.6);
  const total = LEAF_COLORS.reduce((n, [, w]) => n + w, 0);
  const pick = () => {
    let r = R() * total;
    for (const [c, w] of LEAF_COLORS) if ((r -= w) <= 0) return c;
    return LEAF_COLORS[0][0];
  };

  const woodMap = new Map<number, string>();
  const add = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    const key = Math.max(1, Math.round(w));
    woodMap.set(key, `${woodMap.get(key) ?? ""}M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  };
  const layers: Leaf[][] = Array.from({ length: WIND_LAYERS }, () => []);
  let ci = 0;

  const cluster = (x: number, y: number, n: number, spread: number, ang: number) => {
    const L = layers[ci++ % WIND_LAYERS];
    for (let i = 0, m = Math.max(3, Math.round(n * LEAF_DENSITY)); i < m; i++)
      L.push({ x: x + (R() - 0.5) * spread * 2, y: y + (R() - 0.5) * spread * 1.4, r: (ang * 180) / Math.PI + 90 + (R() - 0.5) * 170, s: (0.95 + R() * 0.9) * k, c: pick(), t: Math.floor(R() * 3) });
  };

  /** Rama recursiva: segmentos que se afinan + ramas hijas + racimo de hojas en cada punta (más hojas cuanto más fina). */
  const grow = (x: number, y: number, ang: number, len: number, w: number, depth: number, down = false) => {
    const N = 5;
    for (let i = 0; i < N; i++) {
      ang += (R() - 0.5) * 0.4 + (down ? (Math.PI / 2 - ang) * 0.1 : 0);
      const nx = x + Math.cos(ang) * (len / N), ny = Math.min(Math.max(y + Math.sin(ang) * (len / N), 14), H - 8);
      add(x, y, nx, ny, w * (1 - (0.55 * (i + 1)) / N));
      x = nx;
      y = ny;
      if (depth > 0 && (i === 1 || i === 3)) grow(x, y, ang + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.5), len * 0.62, w * 0.5, depth - 1, down);
    }
    const n = [12, 6, 3][depth] ?? 0;
    if (!down && n) cluster(x, y, n, (26 + depth * 8) * k, ang);
  };

  // COPA: ramas gruesas en abanico que nacen DENTRO del tronco (misma madera = sin corte visible)
  for (let i = 0; i < CROWN_BOUGHS; i++) {
    const ang = -Math.PI + 0.25 + (i * (Math.PI - 0.5)) / (CROWN_BOUGHS - 1);
    grow(cx + sway(top), top + vh * 0.03, ang, vh * (0.22 + 0.22 * Math.abs(Math.cos(ang))), tw * 0.5, 3);
  }
  // Segundo piso de la copa, más abajo en el tronco
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1;
    grow(cx + sway(top + vh * 0.35), top + vh * (0.35 + i * 0.06), (s > 0 ? 0 : Math.PI) - s * (0.35 + i * 0.12), vh * 0.34, tw * 0.42, 3);
  }
  // Relleno elíptico de hojas en la copa
  for (let i = 0; i < 46; i++) {
    const a2 = R() * Math.PI * 2, rr = Math.sqrt(R());
    cluster(cx + Math.cos(a2) * rr * W * 0.44, Math.max(30, top + vh * 0.1 - Math.abs(Math.sin(a2)) * rr * vh * 0.62), 14, 44 * k, a2);
  }
  // Cortina de follaje pegada al tronco (alterna lados)
  for (let y = top + vh * 0.5, i = 0; y < ground - vh * 0.2; y += vh * 0.2, i++) {
    const s = i % 2 ? 1 : -1;
    cluster(cx + sway(y) + s * (wAt(y) / 2 + 12 * k), y, 6, 30 * k, s > 0 ? 0 : Math.PI);
  }

  // Ramas principales: terminan EXACTAMENTE en el punto de anclaje junto a cada tarjeta
  BRANCHES.forEach((b) => {
    const s = b.side === "right" ? 1 : -1;
    const yA = (b.worldY * vh) / 100, gap = ((mobile ? GAP_VW_MOBILE : GAP_VW) * W) / 100;
    const x0 = cx + sway(yA) + s * tw * 0.1, y0 = yA + vh * 0.16, w0 = wAt(yA) * 0.85, xT = cx + s * gap;
    let px = x0, py = y0;
    for (let i = 1; i <= 8; i++) {
      const t = i / 8, nx = x0 + (xT - x0) * t, ny = y0 + (yA - y0) * (1 - (1 - t) * (1 - t));
      add(px, py, nx, ny, w0 * (1 - 0.55 * t));
      px = nx;
      py = ny;
      if (i === 3 || i === 5) grow(px, py, (s > 0 ? 0 : Math.PI) + (i === 3 ? -0.8 : 0.7) * s, vh * 0.26, w0 * 0.4, 2);
    }
    cluster(xT, yA, 24, 60 * k, s > 0 ? 0 : Math.PI);
  });

  // Ramas decorativas (sin tarjeta), alternando lados
  EXTRA_BRANCHES_VH.forEach((vhY, i) => {
    const s = i % 2 ? 1 : -1, y = (vhY * vh) / 100;
    grow(cx + sway(y) + s * tw * 0.1, y, (s > 0 ? 0 : Math.PI) - 0.5 * s, vh * (0.3 + R() * 0.12), wAt(y) * 0.4, 3);
  });

  // RAÍCES: nacen del ensanchamiento del tronco, se abren en abanico y bajan (misma madera que el tronco)
  for (let i = 0; i < ROOT_COUNT; i++) {
    const u = i / (ROOT_COUNT - 1) - 0.5, y0 = ground - vh * 0.1 + R() * vh * 0.1;
    grow(cx + sway(y0) + u * wAt(y0) * 0.6, y0, Math.PI / 2 + u * 2.3, vh * (0.3 + 0.22 * Math.abs(u) * 2 + R() * 0.1), wAt(y0) * 0.3, 3, true);
  }

  // Tronco: polígono con ancho variable, ensanchamiento en la base y tapa redondeada arriba
  const ys = Array.from({ length: 40 }, (_, i) => top + ((base - top) * i) / 39);
  const edge = (sgn: number, inset = 0, yy = ys) => yy.map((y) => `${f(cx + sway(y) + sgn * (wAt(y) / 2 - inset))},${f(y)}`);
  const trunk = `M${edge(-1).join("L")}L${edge(1).reverse().join("L")}Z`;
  const ry = ys.filter((y) => y < base - vh * 0.12);
  const rim: [string, string] = [`M${edge(-1, tw * 0.16, ry).join("L")}`, `M${edge(1, tw * 0.16, ry).join("L")}`];

  // Corteza: fisuras verticales que siguen el contorno del tronco
  const bark = ["", "", ""];
  for (let i = 0, n = Math.round(80 + W / 14); i < n; i++) {
    const u = (R() - 0.5) * 0.9, y = top + R() * (base - top - vh * 0.2), len = vh * (0.04 + R() * 0.2), cl = Math.floor(R() * 3);
    for (let j = 0; j <= 6; j++) {
      const yy = Math.min(y + (len * j) / 6, base);
      bark[cl] += `${j ? "L" : "M"}${f(cx + sway(yy) + u * wAt(yy) + Math.sin(j * 1.3 + i) * 1.2)} ${f(yy)}`;
    }
  }

  return { W, H, cx, tw, wood: [...woodMap].sort((a, b) => b[0] - a[0]), trunk, caps: [{ x: cx + sway(top), y: top, rx: tw / 2, ry: tw / 2 }, { x: cx + sway(base), y: base, rx: wAt(base) / 2, ry: vh * 0.05 }], bark, rim, rimY: [top, ry[ry.length - 1]], layers };
}
