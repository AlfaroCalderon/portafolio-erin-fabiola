/**
 * CONFIGURACIÓN DEL ÁRBOL — todo lo editable vive aquí.
 * Unidades: "vh" = % del alto de pantalla. "unidad" = tiempo abstracto del timeline
 * (cuánto scroll consume lo define SCROLL_VH_PER_UNIT).
 */

export type Branch = {
  id: string;
  label: string; // etiqueta de la parada (Rama superior / media / inferior)
  pillar: "ramus" | "truncus" | "radix"; // id del pilar en portfolio.json (sections[].id)
  side: "left" | "right"; // de qué lado del tronco sale la rama (y dónde cae la tarjeta)
  worldY: number; // ★ POSICIÓN: dónde se ancla la rama en el árbol (vh desde la parte superior del árbol)
  travel: number; // ★ TIEMPO: duración del viaje de la cámara hasta esta rama
  fadeIn: number; // ★ TIEMPO: aparición de la tarjeta (fade-in + deslizamiento)
  hold: number; // ★ TIEMPO: cuánto se queda fijada la pantalla leyendo la tarjeta
  fadeOut: number; // ★ TIEMPO: desvanecimiento antes de que la cámara siga bajando
};

/** Alto total del árbol (copa arriba → raíces abajo). Debe ser > worldY de la última rama + 100. */
export const WORLD_VH = 520;

/** Línea de la pantalla donde "aterriza" cada rama al detenerse (vh desde arriba). */
export const FOCUS_Y = 50; // escritorio: centro de la pantalla
export const FOCUS_Y_MOBILE = 24; // móvil: arriba, para dejar espacio a la tarjeta debajo (ver BranchCard: top-[29svh])

/** Scroll consumido por cada unidad de timeline, en vh. Súbelo = descenso más lento. */
export const SCROLL_VH_PER_UNIT = 40;

/** Suavizado del scrub (segundos de "inercia"). 0 = pegado al scroll; 1–2 = caída fluida. */
export const SCRUB = 0.7;

/** Punto de quiebre móvil (px). Debe coincidir con el `md:` de Tailwind (768). */
export const MOBILE_BP = 768;

/** Distancia (px) del deslizamiento de las tarjetas al entrar/salir. */
export const CARD_SLIDE_PX = 48;

/** Copa (Hero): tiempo que se queda visible y su desvanecimiento. */
export const COPA = { hold: 0.8, fade: 0.6 };

/** Ramas: orden de arriba hacia abajo. Añade/quita elementos y cambia worldY para reubicarlas. */
export const BRANCHES: Branch[] = [
  { id: "rama-superior", label: "Rama superior", pillar: "ramus", side: "right", worldY: 150, travel: 1.4, fadeIn: 0.6, hold: 1.6, fadeOut: 0.6 },
  { id: "rama-media", label: "Rama media", pillar: "truncus", side: "left", worldY: 270, travel: 1.4, fadeIn: 0.6, hold: 1.6, fadeOut: 0.6 },
  { id: "rama-inferior", label: "Rama inferior", pillar: "radix", side: "right", worldY: 390, travel: 1.4, fadeIn: 0.6, hold: 1.6, fadeOut: 0.6 },
];

/** Último tramo: la cámara llega a la base/raíces y se suelta el pin. */
export const ROOTS = { travel: 1.6 };

/** Imagen opcional de fondo bajo el árbol procedural (tú la reemplazas; transparente por defecto). */
export const TREE_IMAGE = "/images/tree-background.png";

/** Unidades totales del timeline → define el largo del pin. */
export const totalUnits = () =>
  COPA.hold + COPA.fade + BRANCHES.reduce((n, b) => n + b.travel + b.fadeIn + b.hold + b.fadeOut, 0) + ROOTS.travel;

/** Y (px) del mundo para que la rama `worldY` quede en la línea `focusY` de la pantalla. */
export const cameraY = (worldY: number, focusY: number) => {
  const vh = window.innerHeight / 100;
  return -Math.min(Math.max(worldY - focusY, 0), WORLD_VH - 100) * vh;
};

/** ───── ÁRBOL PROCEDURAL (treeGen.ts lo dibuja con esta semilla; mismos números = mismo árbol) ───── */
export const TREE_SEED = 7; // cambia el número para otra forma de árbol
export const LEAF_DENSITY = 0.8; // 0.5 = menos hojas (más ligero) · 1.5 = copa más densa
export const GAP_VW = 5; // ★ escritorio: distancia tronco → borde de la tarjeta (debe coincidir con BranchStop: calc(50%±5vw))
export const GAP_VW_MOBILE = 18; // ★ móvil: la rama termina a esta distancia del tronco (el punto de anclaje)
export const EXTRA_BRANCHES_VH = [100, 118, 175, 200, 225, 250, 300, 320, 345, 365, 420, 435]; // ramas decorativas sin tarjeta (vh desde arriba del árbol)
/** Colores de hojas [color, peso]. Todos de la paleta del PDF: oliva, ocre, vino y rosa (flor). */
export const LEAF_COLORS: [string, number][] = [["#6F6B30", 38], ["#7D7A38", 24], ["#5E5A28", 20], ["#AA9821", 12], ["#8B2354", 4], ["#E8B8C8", 2]];
export const CROWN_BOUGHS = 11; // ★ ramas gruesas que salen de la copa
export const ROOT_COUNT = 9; // ★ aletas de raíz tabular (impar = una queda al centro)
export const WIND_LAYERS = 4; // capas de hojas que se mecen (más capas = viento más variado, algo más de memoria)
