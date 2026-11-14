"use client";
import { useEffect, useRef } from "react";
import { useThemeColors } from "@/components/fx/useThemeColors";

/** Sobel-x — a vertical-edge detector. Real weights, really applied to the field below. */
export const KERNEL = [-1, 0, 1, -2, 0, 2, -1, 0, 1];

type Sample = (patch: number[], out: number, cell: [number, number]) => void;

/**
 * A grid of "pixels" from a slowly drifting field. The cursor is a 3×3 kernel:
 * it convolves the patch under it and stamps the activation into a heat map that fades.
 * With no pointer it raster-scans on its own, like a conv sweep.
 */
export function ConvField({ onSample, className }: { onSample?: Sample; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();
  const sampleRef = useRef(onSample);
  useEffect(() => { sampleRef.current = onSample; }, [onSample]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !colors) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, cols = 0, rows = 0, cell = 26;
    let heat = new Float32Array(0);
    let field = new Float32Array(0);
    const dpr = Math.min(devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      cell = W < 700 ? 20 : 26;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
      heat = new Float32Array(cols * rows);
      field = new Float32Array(cols * rows);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // kernel position (cells): float for drawing, target from pointer or autoscan
    const k = { x: cols * 0.7, y: rows * 0.35, tx: cols * 0.7, ty: rows * 0.35 };
    let lastPointer = -1e9;
    const scan = { c: Math.floor(cols * 0.45), r: 3, dir: 1 };
    let lastScan = 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      k.tx = x / cell - 0.5; k.ty = y / cell - 0.5;
      lastPointer = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    const val = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 0.21 + t * 0.35) * Math.cos(y * 0.17 - t * 0.28);
      const b = Math.sin((x + y) * 0.09 + t * 0.22);
      const c = Math.cos(Math.hypot(x - cols * 0.72, y - rows * 0.45) * 0.28 - t * 0.6);
      const v = 0.5 + 0.28 * a + 0.16 * b + 0.14 * c;
      return Math.round(Math.max(0, Math.min(1, v)) * 6) / 6; // quantised → pixel look
    };

    let raf = 0, lastEmit = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = reduced ? 0 : (now - t0) / 1000;

      // autoscan when idle
      if (now - lastPointer > 2600 && now - lastScan > 85) {
        lastScan = now;
        scan.c += scan.dir;
        const minC = Math.floor(cols * (W < 900 ? 0.05 : 0.42)), maxC = cols - 3;
        if (scan.c > maxC || scan.c < minC) { scan.dir *= -1; scan.c += scan.dir; scan.r += 2; }
        if (scan.r > rows - 3) scan.r = 2;
        k.tx = scan.c; k.ty = scan.r;
      }
      const ease = now - lastPointer < 2600 ? 0.22 : 0.3;
      k.x += (k.tx - k.x) * ease; k.y += (k.ty - k.y) * ease;

      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) field[r * cols + c] = val(c, r, t);

      // convolve at the kernel's integer centre
      const kc = Math.round(k.x) + 1, kr = Math.round(k.y) + 1;
      const patch: number[] = [];
      let out = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const c = Math.min(cols - 1, Math.max(0, kc + i)), r = Math.min(rows - 1, Math.max(0, kr + j));
        const v = field[r * cols + c];
        patch.push(v);
        out += v * KERNEL[(j + 1) * 3 + (i + 1)];
      }
      const act = Math.min(1, Math.abs(out) / 2.2);
      const hi = Math.min(rows - 1, Math.max(0, kr)) * cols + Math.min(cols - 1, Math.max(0, kc));
      heat[hi] = Math.max(heat[hi], 0.25 + act * 0.75);

      if (now - lastEmit > 70) { lastEmit = now; sampleRef.current?.(patch, out, [kc, kr]); }

      // draw
      ctx.clearRect(0, 0, W, H);
      const g = 2.5, s = cell - g;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const v = field[idx];
          ctx.globalAlpha = 0.02 + v * v * 0.16;
          ctx.fillStyle = colors.ink;
          ctx.fillRect(c * cell + g / 2, r * cell + g / 2, s, s);
          const h = heat[idx];
          if (h > 0.02) {
            ctx.globalAlpha = h * 0.9;
            ctx.fillStyle = colors.heat;
            ctx.fillRect(c * cell + g / 2, r * cell + g / 2, s, s);
            heat[idx] = h * (reduced ? 1 : 0.988);
          }
        }
      }

      // receptive-field crosshair
      const px = (k.x + 1.5) * cell, py = (k.y + 1.5) * cell;
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.moveTo(px, 0); ctx.lineTo(px, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // kernel window: patch cells filled darker + outline
      ctx.globalAlpha = 1;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
        const w = KERNEL[j * 3 + i];
        ctx.globalAlpha = 0.12 + Math.abs(w) * 0.1;
        ctx.fillStyle = colors.ink;
        ctx.fillRect((k.x + i) * cell + g / 2, (k.y + j) * cell + g / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(k.x * cell + 0.75, k.y * cell + 0.75, cell * 3 - 1.5, cell * 3 - 1.5);
      // corner ticks
      const L = 7, x0 = k.x * cell - 4, y0 = k.y * cell - 4, x1 = x0 + cell * 3 + 8, y1 = y0 + cell * 3 + 8;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0);
      ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L);
      ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1);
      ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [colors]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
