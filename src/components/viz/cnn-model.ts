/** Real (tiny) CNN forward pass on a 16×16 pixel-art bird, used to drive the CNN showcase. */

const BIRD = [
  "................",
  "................",
  ".........###....",
  "........#####...",
  ".......##o###>..",
  ".......######>..",
  "..#....#####....",
  "..###.#######...",
  "...###########..",
  "....##########..",
  ".....########...",
  "......######....",
  ".......#..#.....",
  ".......#..#.....",
  "......##..##....",
  "................",
];

export type Grid = number[][];

export const input: Grid = BIRD.map((row, r) =>
  [...row].map((ch, c) => {
    if (ch === "#") return 0.72 + 0.28 * Math.sin(r * 0.9 + c * 0.6) ** 2;
    if (ch === ">") return 0.55;
    if (ch === "o") return 0.15;
    return 0.04;
  }),
);

export const K1: number[][] = [
  [-1, 0, 1, -2, 0, 2, -1, 0, 1], // vertical edges
  [-1, -2, -1, 0, 0, 0, 1, 2, 1], // horizontal edges
  [0, -1, 0, -1, 4, -1, 0, -1, 0], // laplacian / blobs
];

const conv = (g: Grid, k: number[]): Grid => {
  const n = g.length - 2;
  const out: Grid = [];
  for (let r = 0; r < n; r++) {
    out.push([]);
    for (let c = 0; c < n; c++) {
      let s = 0;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) s += g[r + j][c + i] * k[j * 3 + i];
      out[r].push(Math.max(0, s)); // ReLU
    }
  }
  return out;
};

const norm = (g: Grid): Grid => {
  const m = Math.max(1e-6, ...g.flat());
  return g.map((row) => row.map((v) => v / m));
};

const pool = (g: Grid): Grid => {
  const n = Math.floor(g.length / 2);
  const out: Grid = [];
  for (let r = 0; r < n; r++) {
    out.push([]);
    for (let c = 0; c < n; c++) out[r].push(Math.max(g[2 * r][2 * c], g[2 * r + 1][2 * c], g[2 * r][2 * c + 1], g[2 * r + 1][2 * c + 1]));
  }
  return out;
};

export const conv1 = K1.map((k) => norm(conv(input, k))); // 3 × 14×14
export const pool1 = conv1.map(pool); // 3 × 7×7

// 6 deterministic second-layer kernels, each mixing the 3 pooled maps
const rand = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = rand(7);
export const conv2: Grid[] = Array.from({ length: 6 }, () => {
  const ks = pool1.map(() => Array.from({ length: 9 }, () => rnd() * 2 - 0.8));
  const parts = pool1.map((g, i) => conv(g, ks[i]));
  const sum = parts[0].map((row, r) => row.map((_, c) => parts.reduce((s, p) => s + p[r][c], 0)));
  return norm(sum); // 6 × 5×5
});

export const dense = [0.35, 0.9, 0.2, 0.62, 0.78, 0.15, 0.55, 0.95, 0.3, 0.68];

export const classes = [
  { name: "bird", p: 0.93 },
  { name: "airplane", p: 0.04 },
  { name: "cat", p: 0.015 },
  { name: "frog", p: 0.01 },
  { name: "ship", p: 0.005 },
];
