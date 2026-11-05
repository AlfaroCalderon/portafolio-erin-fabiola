import { BRANCHES, CROWN_BOUGHS, EXTRA_BRANCHES_VH, GAP_VW, GAP_VW_MOBILE, LEAF_COLORS, LEAF_DENSITY, MOBILE_BP, ROOT_COUNT, TREE_SEED, WIND_LAYERS, WORLD_VH } from "./treeConfig";

export type Leaf = { x: number; y: number; r: number; s: number; c: string; t: number };
export type TreeData = {
  W: number;
  H: number;
  cx: number;
  tw: number;
  wood: [number, string][];
  roots: string;
  rootHi: string;
  rootLo: string;
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
type P = [number, number];

const bez = (p: P[], n: number): P[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]];
  });

const taper = (pts: P[], w0: number, tip: number, off = 0, scale = 1, ramp = true) => {
  const n = pts.length, A: string[] = [], B: string[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, n - 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d, e = ramp ? Math.min(i / (n * 0.24), 1) : 1, h = ((tip + (w0 - tip) * Math.pow(1 - i / (n - 1), 0.85)) * (0.18 + 0.82 * e * e * (3 - 2 * e))) / 2, c = off * h;
    A.push(`${f(p[0] + nx * (c - h * scale))},${f(p[1] + ny * (c - h * scale))}`);
    B.push(`${f(p[0] + nx * (c + h * scale))},${f(p[1] + ny * (c + h * scale))}`);
  });
  return `M${A.join("L")}L${B.reverse().join("L")}Z`;
};

export function buildTree(W: number, vh: number): TreeData {
  const R = rng(TREE_SEED);
  const H = (WORLD_VH * vh) / 100;
  const mobile = W < MOBILE_BP;
  const k = Math.min(Math.max(W / 1440, 0.6), 1.1);
  const cx = W / 2;
  const top = vh * 0.62; // ★ dónde se bifurca el tronco: la copa en sombrilla se abre desde aquí
  const ground = H - vh * 0.62; // ★ dónde nacen las raíces (queda ~60vh de raíces hasta el final)
  const base = ground + vh * 0.04;
  const tw = Math.max(36, Math.min(96, W * 0.06)); // ★ grosor del tronco arriba
  const bw = tw * 2.4; // grosor al pie del tronco (el ensanchamiento que se vuelve raíces)
  const sway = (y: number) => Math.sin(y / (vh * 1.6)) * W * 0.008;
  const wAt = (y: number) => tw + (bw - tw) * Math.pow(Math.min(Math.max((y - top) / (ground - top), 0), 1.1), 3.2);
  const ss = (t: number) => { const c = Math.min(Math.max(t, 0), 1); return c * c * (3 - 2 * c); };
  const trunkW = (y: number) => wAt(y) * (1 - 0.5 * ss((y - (ground - vh * 0.26)) / (vh * 0.3)));
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

  /** Racimo de hojas y flores. Cada hoja se une al punto de la rama con un tallito, así nada queda flotando. */
  const cluster = (x: number, y: number, n: number, spread: number, ang: number) => {
    const L = layers[ci++ % WIND_LAYERS];
    for (let i = 0, m = Math.max(2, Math.round(n * LEAF_DENSITY)); i < m; i++) {
      const q = R(), t = q < 0.1 ? 4 : q < 0.42 ? 3 : Math.floor(R() * 3);
      const lx = x + (R() - 0.5) * spread * 2, ly = y + (R() - 0.5) * spread * 1.4;
      add(x, y, lx, ly, 1);
      L.push({ x: lx, y: ly, r: (ang * 180) / Math.PI + 90 + (R() - 0.5) * 170, s: (t === 3 ? 0.8 + R() * 0.5 : t === 4 ? 0.7 + R() * 0.5 : 0.95 + R() * 0.9) * k, c: t === 4 ? "#FFFFFF" : pick(), t });
    }
  };

  /** Rama recursiva. TODA punta lleva hojas (incluidas las de las ramas gruesas) y los nudos finos llevan algunas más. */
  const grow = (x: number, y: number, ang: number, len: number, w: number, depth: number, down = false) => {
    const N = 5;
    for (let i = 0; i < N; i++) {
      ang += (R() - 0.5) * 0.4 + (down ? (Math.PI / 2 - ang) * 0.1 : 0);
      const nx = x + Math.cos(ang) * (len / N), ny = Math.min(Math.max(y + Math.sin(ang) * (len / N), 14), H - 8);
      add(x, y, nx, ny, w * (1 - (0.55 * (i + 1)) / N));
      x = nx;
      y = ny;
      if (!down && depth <= 1 && (i === 1 || i === 3)) cluster(x, y, 3, 14 * k, ang);
      if (depth > 0 && (i === 1 || i === 3)) grow(x, y, ang + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.5), len * 0.62, w * 0.5, depth - 1, down);
    }
    if (!down) cluster(x, y, [10, 6, 4, 4][depth] ?? 4, (24 + depth * 6) * k, ang);
  };

  // COPA EN SOMBRILLA: las ramas gruesas NACEN DENTRO del tronco y se abren; las del centro suben y las de los lados salen casi horizontales
  for (let i = 0; i < CROWN_BOUGHS; i++) {
    const u = (i / (CROWN_BOUGHS - 1)) * 2 - 1, ang = -Math.PI / 2 + u * (Math.PI / 2 - 0.14), h = Math.pow(Math.abs(Math.cos(ang)), 1.4);
    grow(cx + sway(top) + u * tw * 0.3, top + vh * 0.03, ang, vh * 0.22 + W * 0.36 * h, tw * 0.62, 3);
  }
  // Segundo piso: ramas largas más abajo en el tronco
  for (let i = 0; i < 6; i++) {
    const s2 = i % 2 ? 1 : -1, y = top + vh * (0.3 + i * 0.07);
    grow(cx + sway(y) + s2 * tw * 0.1, y, (s2 > 0 ? 0 : Math.PI) - s2 * (0.3 + i * 0.1), vh * 0.4 + W * 0.1, tw * 0.42, 3);
  }
  // Ramitas que brotan del propio tronco (con sus hojas y flores en la punta)
  for (let y = top + vh * 0.4, i = 0; y < ground - vh * 0.35; y += vh * 0.26, i++) {
    const s2 = i % 2 ? 1 : -1;
    grow(cx + sway(y) + s2 * wAt(y) * 0.3, y, (s2 > 0 ? 0 : Math.PI) - s2 * 0.7, vh * 0.15, tw * 0.17, 1);
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
    grow(cx + sway(y) + s * tw * 0.1, y, (s > 0 ? 0 : Math.PI) - 0.5 * s, vh * (0.3 + R() * 0.12), wAt(y) * 0.4, 2);
  });

  // RAÍCES TABULARES: ramas cónicas curvas que NACEN DENTRO del tronco ensanchado (mismo color: sin cortes), con raicillas
  const bx = cx + sway(ground), NR = ROOT_COUNT, N = 22;
  const roots: string[] = [], hi: string[] = [], lo: string[] = [];
  for (let i = 0; i < NR; i++) {
    const u = (i / (NR - 1)) * 2 - 1, au = Math.abs(u), y0 = ground - vh * (0.1 + 0.14 * au), x0 = bx + u * wAt(y0) * 0.26;
    const w0 = wAt(y0) * (0.46 - 0.14 * au), Lx = u * (vh * 0.12 + au * (W * 0.13 + vh * 0.1)), Ly = vh * (0.3 + 0.14 * (1 - au)) + R() * vh * 0.04;
    const pts = bez([[x0, y0], [x0 + Lx * 0.12, y0 + Ly * 0.5], [x0 + Lx * 0.58, y0 + Ly * 0.95], [x0 + Lx, Math.min(y0 + Ly, H - 6)]], N).map(([x, y]): P => [x, Math.min(y, H - 6)]);
    const off = u > 0.05 ? -1 : 1;
    roots.push(taper(pts, w0, 3));
    hi.push(taper(pts, w0, 3, off * 0.55, 0.28));
    lo.push(taper(pts, w0, 3, -off * 0.6, 0.3));
    for (const t of [0.32, 0.55, 0.78]) {
      const j = Math.round(t * N), a = Math.atan2(pts[j + 1][1] - pts[j - 1][1], pts[j + 1][0] - pts[j - 1][0]);
      grow(pts[j][0], pts[j][1], a + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.4), vh * (0.14 + R() * 0.1), w0 * 0.14, 2, true);
    }
    const ta = Math.atan2(pts[N][1] - pts[N - 2][1], pts[N][0] - pts[N - 2][0]);
    grow(pts[N][0], pts[N][1], ta + 0.35, vh * 0.2, w0 * 0.12, 2, true);
    grow(pts[N][0], pts[N][1], ta - 0.35, vh * 0.16, w0 * 0.1, 2, true);
  }

  // Tronco: ancho variable, se ensancha hacia el pie; las raíces lo cubren por abajo
  const ys = Array.from({ length: 40 }, (_, i) => top + ((base - top) * i) / 39);
  const edge = (sgn: number, inset = 0, yy = ys) => yy.map((y) => `${f(cx + sway(y) + sgn * (trunkW(y) / 2 - inset))},${f(y)}`);
  const trunk = `M${edge(-1).join("L")}L${edge(1).reverse().join("L")}Z`;
  const ry = ys.filter((y) => y < ground - vh * 0.22);
  const rim: [string, string] = [`M${edge(-1, tw * 0.16, ry).join("L")}`, `M${edge(1, tw * 0.16, ry).join("L")}`];

  // Corteza: fisuras verticales que siguen el contorno del tronco
  const bark = ["", "", ""];
  for (let i = 0, n = Math.round(80 + W / 14); i < n; i++) {
    const u = (R() - 0.5) * 0.9, y = top + vh * 0.08 + R() * (ground - top - vh * 0.3), len = vh * (0.04 + R() * 0.2), cl = Math.floor(R() * 3);
    for (let j = 0; j <= 6; j++) {
      const yy = Math.min(y + (len * j) / 6, ground - vh * 0.1);
      bark[cl] += `${j ? "L" : "M"}${f(cx + sway(yy) + u * wAt(yy) + Math.sin(j * 1.3 + i) * 1.2)} ${f(yy)}`;
    }
  }

  return {
    W, H, cx, tw, roots: roots.join(""), rootHi: hi.join(""), rootLo: lo.join(""),
    wood: [...woodMap].sort((a, b) => b[0] - a[0]), trunk,
    caps: [{ x: cx + sway(top), y: top, rx: tw / 2, ry: tw / 2 }],
    bark, rim, rimY: [top, ry[ry.length - 1]], layers,
  };
}
