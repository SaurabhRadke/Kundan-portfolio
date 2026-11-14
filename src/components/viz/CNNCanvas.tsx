"use client";
import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import { useThemeColors, type Palette } from "@/components/fx/useThemeColors";
import { classes, conv1, conv2, dense, input, pool1, type Grid } from "./cnn-model";

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export const STAGES = [
  { at: 0.0, end: 0.12 },
  { at: 0.12, end: 0.4 },
  { at: 0.4, end: 0.55 },
  { at: 0.55, end: 0.7 },
  { at: 0.7, end: 0.82 },
  { at: 0.82, end: 0.95 },
];

type Stack = { x: number; y: number; cell: number; dx: number; dy: number };
type Pt = [number, number];
type Layout = {
  W: number; H: number; fs: number;
  in: { x: number; y: number; cell: number };
  c1: Stack; p1: Stack; c2: Stack;
  dn: { x: number; y0: number; gap: number; r: number };
  out: { x: number; y0: number; gap: number; bar: number };
  labels: { in: Pt; c1: Pt; p1: Pt; c2: Pt; dn: Pt; out: Pt };
  badge: Pt;
  conns: [number, number, number, number][];
};

/** Landscape layout — tablets & desktop. */
const WIDE: Layout = {
  W: 1200, H: 540, fs: 1,
  in: { x: 40, y: 150, cell: 15 },
  c1: { x: 360, y: 205, cell: 10, dx: 18, dy: -18 },
  p1: { x: 600, y: 240, cell: 11, dx: 15, dy: -15 },
  c2: { x: 790, y: 262, cell: 10, dx: 10, dy: -10 },
  dn: { x: 960, y0: 150, gap: 30, r: 6 },
  out: { x: 1012, y0: 200, gap: 40, bar: 176 },
  labels: { in: [40, 470], c1: [360, 470], p1: [600, 470], c2: [790, 470], dn: [938, 470], out: [1024, 470] },
  badge: [1024, 118],
  conns: [[290, 270, 350, 275], [546, 260, 590, 278], [717, 270, 780, 287], [860, 270, 944, 285]],
};

/** Portrait layout — phones. Three rows: image → features → prediction. */
const TALL: Layout = {
  W: 600, H: 860, fs: 1.55,
  in: { x: 24, y: 70, cell: 13 },
  c1: { x: 300, y: 106, cell: 11, dx: 16, dy: -16 },
  p1: { x: 30, y: 420, cell: 12, dx: 14, dy: -14 },
  c2: { x: 230, y: 436, cell: 11, dx: 9, dy: -9 },
  dn: { x: 470, y0: 372, gap: 15, r: 5.5 },
  out: { x: 12, y0: 690, gap: 38, bar: 552 },
  labels: { in: [24, 318], c1: [300, 318], p1: [30, 566], c2: [230, 566], dn: [420, 566], out: [24, 640] },
  badge: [362, 616],
  conns: [[244, 174, 292, 180], [372, 272, 96, 388], [150, 462, 222, 464], [340, 440, 458, 444]],
};

type Ctx = CanvasRenderingContext2D;

function plate(ctx: Ctx, x: number, y: number, w: number, c: Palette, a = 1) {
  ctx.globalAlpha = a;
  ctx.fillStyle = c.surface;
  ctx.fillRect(x - 3, y - 3, w + 6, w + 6);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 3.5, y - 3.5, w + 7, w + 7);
}

function grid(ctx: Ctx, g: Grid, x: number, y: number, cell: number, reveal: number, c: Palette, a = 1, hot = false) {
  const n = g.length;
  const shown = Math.floor(reveal * n * n);
  const gap = cell > 12 ? 1.5 : 1;
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), cc = i % n;
    const v = g[r][cc];
    const on = i < shown;
    ctx.globalAlpha = a * (on ? 0.05 + v * 0.85 : 0.04);
    ctx.fillStyle = on && hot && v > 0.7 ? c.heat : c.ink;
    ctx.fillRect(x + cc * cell + gap / 2, y + r * cell + gap / 2, cell - gap, cell - gap);
  }
}

function stack(ctx: Ctx, maps: Grid[], o: Stack, reveal: number, c: Palette, alpha: number) {
  const w = maps[0].length * o.cell;
  for (let k = maps.length - 1; k >= 0; k--) {
    const x = o.x + k * o.dx, y = o.y + k * o.dy;
    plate(ctx, x, y, w, c, alpha);
    grid(ctx, maps[k], x, y, o.cell, reveal, c, alpha * (k === 0 ? 1 : 0.75), k === 0);
  }
}

function windowLink(ctx: Ctx, c: Palette, wx: number, wy: number, ws: number, ox: number, oy: number, os: number) {
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(wx + ws, wy); ctx.lineTo(ox, oy);
  ctx.moveTo(wx + ws, wy + ws); ctx.lineTo(ox, oy + os);
  ctx.moveTo(wx, wy); ctx.lineTo(ox, oy);
  ctx.moveTo(wx, wy + ws); ctx.lineTo(ox, oy + os);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.heat;
  ctx.lineWidth = 2;
  ctx.strokeRect(wx, wy, ws, ws);
  ctx.fillStyle = c.heat;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(ox, oy, os, os);
}

function label(ctx: Ctx, text: string, sub: string, [x, y]: Pt, c: Palette, a: number, mono: string, fs: number) {
  ctx.globalAlpha = a;
  ctx.fillStyle = c.ink;
  ctx.font = `500 ${12 * fs}px ${mono}`;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.fillStyle = c.muted;
  ctx.font = `400 ${11 * fs}px ${mono}`;
  ctx.fillText(sub, x, y + 17 * fs);
}

function draw(ctx: Ctx, L: Layout, p: number, t: number, c: Palette, mono: string) {
  const s = STAGES.map((st) => seg(p, st.at, st.end));
  const fs = L.fs;
  ctx.clearRect(0, 0, L.W, L.H);
  ctx.textBaseline = "alphabetic";

  // flow connectors with travelling pulses
  L.conns.forEach(([x1, y1, x2, y2], i) => {
    const on = s[i + 1];
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    if (on > 0) {
      for (let k = 0; k < 3; k++) {
        const f = (t * 0.45 + k / 3 + i * 0.17) % 1;
        ctx.globalAlpha = Math.sin(f * Math.PI) * on;
        ctx.fillStyle = c.heat;
        ctx.beginPath(); ctx.arc(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 2.4 * fs, 0, Math.PI * 2); ctx.fill();
      }
    }
  });

  // 1 · input
  plate(ctx, L.in.x, L.in.y, 16 * L.in.cell, c, 1);
  grid(ctx, input, L.in.x, L.in.y, L.in.cell, easeOut(s[0]), c, 1);
  label(ctx, "Input", "16×16 image", L.labels.in, c, 0.4 + s[0] * 0.6, mono, fs);

  // 2 · conv1
  const a1 = 0.25 + 0.75 * Math.min(1, s[1] * 4);
  stack(ctx, conv1, L.c1, s[1], c, a1);
  label(ctx, "Conv + ReLU", "3 @ 14×14", L.labels.c1, c, a1, mono, fs);
  if (s[1] > 0 && s[1] < 1) {
    const i = Math.min(195, Math.floor(s[1] * 196)), r = Math.floor(i / 14), cc = i % 14;
    windowLink(ctx, c, L.in.x + cc * L.in.cell, L.in.y + r * L.in.cell, 3 * L.in.cell, L.c1.x + cc * L.c1.cell, L.c1.y + r * L.c1.cell, L.c1.cell);
  }

  // 3 · pool
  const a2 = 0.25 + 0.75 * Math.min(1, s[2] * 4);
  stack(ctx, pool1, L.p1, s[2], c, a2);
  label(ctx, "Max-pool", "3 @ 7×7", L.labels.p1, c, a2, mono, fs);
  if (s[2] > 0 && s[2] < 1) {
    const i = Math.min(48, Math.floor(s[2] * 49)), r = Math.floor(i / 7), cc = i % 7;
    windowLink(ctx, c, L.c1.x + 2 * cc * L.c1.cell, L.c1.y + 2 * r * L.c1.cell, 2 * L.c1.cell, L.p1.x + cc * L.p1.cell, L.p1.y + r * L.p1.cell, L.p1.cell);
  }

  // 4 · conv2
  const a3 = 0.25 + 0.75 * Math.min(1, s[3] * 4);
  stack(ctx, conv2, L.c2, s[3], c, a3);
  label(ctx, "Conv 3×3", "6 @ 5×5", L.labels.c2, c, a3, mono, fs);
  if (s[3] > 0 && s[3] < 1) {
    const i = Math.min(24, Math.floor(s[3] * 25)), r = Math.floor(i / 5), cc = i % 5;
    windowLink(ctx, c, L.p1.x + cc * L.p1.cell, L.p1.y + r * L.p1.cell, 3 * L.p1.cell, L.c2.x + cc * L.c2.cell, L.c2.y + r * L.c2.cell, L.c2.cell);
  }

  // 5 · dense
  const a4 = 0.25 + 0.75 * s[4];
  const nodes = dense.map((v, i) => ({ x: L.dn.x, y: L.dn.y0 + i * L.dn.gap, v }));
  const srcX = L.c2.x + 5 * L.c2.cell + 5 * L.c2.dx + 4;
  ctx.lineWidth = 0.7;
  for (let k = 0; k < 6; k++) {
    const sy = L.c2.y + k * L.c2.dy + 2.5 * L.c2.cell;
    for (const n of nodes) {
      ctx.globalAlpha = 0.12 * s[4];
      ctx.strokeStyle = c.ink;
      ctx.beginPath();
      ctx.moveTo(srcX, sy);
      ctx.lineTo(srcX + (n.x - srcX) * easeOut(s[4]), sy + (n.y - sy) * easeOut(s[4]));
      ctx.stroke();
    }
  }
  nodes.forEach((n, i) => {
    const on = seg(s[4], i / 14, i / 14 + 0.4);
    ctx.globalAlpha = a4;
    ctx.fillStyle = c.surface;
    ctx.strokeStyle = c.line;
    ctx.beginPath(); ctx.arc(n.x, n.y, L.dn.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = on * (0.15 + n.v * 0.85);
    ctx.fillStyle = n.v > 0.85 ? c.heat : c.ink;
    ctx.beginPath(); ctx.arc(n.x, n.y, L.dn.r - 1.5, 0, Math.PI * 2); ctx.fill();
  });
  label(ctx, "Dense", "10 units", L.labels.dn, c, a4, mono, fs);

  // 6 · softmax
  const a5 = 0.25 + 0.75 * s[5];
  classes.forEach((cl, i) => {
    const y = L.out.y0 + i * L.out.gap;
    for (const n of nodes) {
      ctx.globalAlpha = 0.06 * s[5];
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(n.x + L.dn.r, n.y); ctx.lineTo(L.out.x, y + 9); ctx.stroke();
    }
    const top = i === 0;
    const bx = L.out.x + 12;
    ctx.globalAlpha = a5;
    ctx.fillStyle = top ? c.ink : c.muted;
    ctx.font = `${top ? 600 : 400} ${12 * fs}px ${mono}`;
    ctx.fillText(cl.name, bx, y);
    if (s[5] > 0.2) {
      ctx.globalAlpha = seg(s[5], 0.2, 0.7);
      ctx.textAlign = "right";
      ctx.font = `400 ${11 * fs}px ${mono}`;
      ctx.fillText((cl.p * 100 * easeOut(seg(s[5], 0.2, 0.9))).toFixed(1) + "%", bx + L.out.bar - 12, y);
      ctx.textAlign = "left";
    }
    const bw = L.out.bar - 12;
    const w = bw * cl.p * easeOut(seg(s[5], i * 0.06, 0.7 + i * 0.06));
    ctx.globalAlpha = a5 * 0.7;
    ctx.fillStyle = c.line;
    ctx.fillRect(bx, y + 7, bw, 5 * fs);
    ctx.globalAlpha = top ? 1 : 0.6;
    ctx.fillStyle = top ? c.heat : c.ink;
    ctx.fillRect(bx, y + 7, Math.max(w, s[5] > 0 ? 2 : 0), 5 * fs);
  });
  label(ctx, "Softmax", "CIFAR-10 classes", L.labels.out, c, a5, mono, fs);

  // prediction badge
  if (s[5] > 0.85) {
    const a = seg(s[5], 0.85, 1);
    const by = L.badge[1], bx = Math.min(L.badge[0], L.W - 150 * fs - 6);
    ctx.globalAlpha = a;
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.roundRect(bx, by, 150 * fs, 34 * fs, 17 * fs);
    ctx.fill();
    ctx.fillStyle = c.bg;
    ctx.font = `500 ${12 * fs}px ${mono}`;
    ctx.fillText("ŷ = bird · 0.93", bx + 18 * fs, by + 21 * fs);
  }
  ctx.globalAlpha = 1;
}

/** Canvas that eases toward scroll-driven progress; switches to a portrait layout on narrow screens. */
export function CNNCanvas({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();
  const [tall, setTall] = useState(false);

  useEffect(() => {
    const canvas = ref.current?.parentElement;
    if (!canvas) return;
    const ro = new ResizeObserver(([e]) => setTall(e.contentRect.width < 560));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !colors) return;
    const L = tall ? TALL : WIDE;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono") || "monospace";
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      // on mid-size screens bump type so labels stay legible
      const k = r.width / L.W;
      L.fs = tall ? TALL.fs : Math.max(1, Math.min(1.35, 0.78 / k));
      ctx.setTransform(k * dpr, 0, 0, (r.height / L.H) * dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    let shown = progress.get(), raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      shown += (progress.get() - shown) * 0.12;
      draw(ctx, L, shown, (now - t0) / 1000, colors, mono);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [colors, progress, tall]);

  return (
    <canvas ref={ref} role="img" aria-label="Animated convolutional neural network classifying a bird image"
      className="block w-full" style={{ aspectRatio: tall ? `${TALL.W} / ${TALL.H}` : `${WIDE.W} / ${WIDE.H}` }} />
  );
}
