"use client";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useThemeColors } from "@/components/fx/useThemeColors";
import { input } from "./cnn-model";

/** CUB-style attributes; alignment F1 tracks how often each attribute appears in the data. */
const ATTRS = [
  { name: "bill_shape · cone", at: [2.2, 6.3], s: 0.8, f1: 0.88, freq: 0.92 },
  { name: "crown · black", at: [1.3, 4.8], s: 0.9, f1: 0.84, freq: 0.81 },
  { name: "wing · striped", at: [3.8, 3.4], s: 1.1, f1: 0.79, freq: 0.7 },
  { name: "belly · white", at: [4.8, 4.6], s: 1.0, f1: 0.82, freq: 0.76 },
  { name: "tail · notched", at: [3.4, 1.3], s: 0.8, f1: 0.51, freq: 0.24 },
  { name: "leg · grey", at: [6.6, 4.3], s: 0.8, f1: 0.46, freq: 0.18 },
];

const P = 8; // 8×8 patch tokens over the 16×16 image
const CELL = 34;

type Lay = {
  W: number; H: number; OX: number; OY: number; fs: number;
  pill: (k: number) => { x: number; y: number; w: number };
  anchor: (k: number) => [number, number];
  curve: (x1: number, y1: number, x2: number, y2: number) => string;
  attrHead: [number, number]; foot: [number, number];
};

const WIDE: Lay = {
  W: 640, H: 360, OX: 24, OY: 32, fs: 1,
  pill: (k) => ({ x: 430, y: 38 + k * 46, w: 196 }),
  anchor: (k) => [416, 54 + k * 46],
  curve: (x1, y1, x2, y2) => `M${x1} ${y1} C ${x1 + 90} ${y1}, ${x2 - 90} ${y2}, ${x2} ${y2}`,
  attrHead: [430, 20], foot: [430, 324],
};
const TALL: Lay = {
  W: 360, H: 470, OX: 44, OY: 34, fs: 1,
  pill: (k) => ({ x: (k % 2) * 180 + 4, y: 330 + Math.floor(k / 2) * 44, w: 172 }),
  anchor: (k) => [(k % 2) * 180 + 90, 330],
  curve: (x1, y1, x2, y2) => `M${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${y2 - 50}, ${x2} ${y2}`,
  attrHead: [4, 318], foot: [4, 466],
};

export function SemanticAttention() {
  const c = useThemeColors();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [tall, setTall] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setTall(e.contentRect.width < 520));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || pinned) return;
    const id = setInterval(() => setActive((a) => (a + 1) % ATTRS.length), 2400);
    return () => clearInterval(id);
  }, [inView, pinned]);

  const mask = useMemo(() => Array.from({ length: P * P }, (_, i) => {
    const r = Math.floor(i / P), cc = i % P;
    const vals = [input[2 * r][2 * cc], input[2 * r + 1][2 * cc], input[2 * r][2 * cc + 1], input[2 * r + 1][2 * cc + 1]];
    return vals.filter((v) => v > 0.3).length / 4;
  }), []);

  const weights = useMemo(() => ATTRS.map((a) => {
    const w = mask.map((m, i) => {
      const r = Math.floor(i / P), cc = i % P;
      const d2 = (r + 0.5 - a.at[0]) ** 2 + (cc + 0.5 - a.at[1]) ** 2;
      return (0.15 + m) * Math.exp(-d2 / (2 * a.s * a.s));
    });
    const mx = Math.max(...w);
    return w.map((v) => v / mx);
  }), [mask]);

  const top = useMemo(() => weights.map((w) => w.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 3)), [weights]);

  if (!c) return <div ref={ref} className="aspect-[640/360] w-full" />;
  const L = tall ? TALL : WIDE;
  const { OX, OY, fs } = L;
  const W = weights[active];
  const A = ATTRS[active];
  const mono = "var(--font-geist-mono)";

  return (
    <div ref={ref} className="relative w-full">
      <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full">
        {input.map((row, r) => row.map((v, cc) => (
          <rect key={`${r}-${cc}`} x={OX + cc * (CELL / 2) + 0.5} y={OY + r * (CELL / 2) + 0.5} width={CELL / 2 - 1} height={CELL / 2 - 1} rx={1.5} fill={c.ink} opacity={0.05 + v * 0.8} />
        )))}
        {W.map((w, i) => {
          const r = Math.floor(i / P), cc = i % P;
          return (
            <motion.rect key={i} x={OX + cc * CELL} y={OY + r * CELL} width={CELL} height={CELL} fill={c.heat}
              initial={false} animate={{ opacity: w * 0.72 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
          );
        })}
        {Array.from({ length: P + 1 }, (_, k) => (
          <g key={k} stroke={c.line} strokeWidth={1}>
            <line x1={OX + k * CELL} x2={OX + k * CELL} y1={OY} y2={OY + P * CELL} />
            <line y1={OY + k * CELL} y2={OY + k * CELL} x1={OX} x2={OX + P * CELL} />
          </g>
        ))}
        <text x={OX} y={OY - 12} fontSize={10.5 * fs} fontFamily={mono} fill={c.muted}>RESNET FEATURES · 8×8 TOKENS</text>

        <AnimatePresence>
          {top[active].map(({ i, v }, k) => {
            const r = Math.floor(i / P), cc = i % P;
            const x1 = OX + cc * CELL + CELL / 2, y1 = OY + r * CELL + CELL / 2;
            const [x2, y2] = L.anchor(active);
            return (
              <motion.path key={`${active}-${k}-${tall}`} d={L.curve(x1, y1, x2, y2)} fill="none" stroke={c.heat} strokeWidth={1 + v * 1.5}
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, delay: k * 0.08, ease: [0.22, 1, 0.36, 1] }} />
            );
          })}
        </AnimatePresence>
        {top[active].map(({ i }, k) => {
          const r = Math.floor(i / P), cc = i % P;
          return <motion.circle key={`d${active}-${k}`} cx={OX + cc * CELL + CELL / 2} cy={OY + r * CELL + CELL / 2} r={4} fill={c.ink} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + k * 0.08 }} />;
        })}

        <text x={L.attrHead[0]} y={L.attrHead[1]} fontSize={10.5 * fs} fontFamily={mono} fill={c.muted}>ATTRIBUTE QUERIES</text>
        {ATTRS.map((a, k) => {
          const on = k === active;
          const p = L.pill(k);
          return (
            <g key={a.name} transform={`translate(${p.x} ${p.y})`} className="cursor-pointer"
              onPointerEnter={() => { setPinned(true); setActive(k); }} onPointerLeave={() => setPinned(false)} onClick={() => setActive(k)}>
              <motion.rect width={p.w} height={34} rx={17} initial={false}
                animate={{ fill: on ? c.ink : c.surface, stroke: on ? c.ink : c.line }} transition={{ duration: 0.35 }} />
              <motion.text x={14} y={21} fontSize={11 * fs} fontFamily={mono} initial={false} animate={{ fill: on ? c.bg : c.ink2 }}>{a.name}</motion.text>
              <motion.text x={p.w - 14} y={21} fontSize={10.5 * fs} textAnchor="end" fontFamily={mono} initial={false} animate={{ fill: on ? c.heat : c.muted }}>{a.f1.toFixed(2)}</motion.text>
            </g>
          );
        })}
        {!tall && <text x={L.foot[0]} y={L.foot[1]} fontSize={10} fontFamily={mono} fill={c.faint}>F1 per attribute · hover to query</text>}
      </svg>

      <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-muted md:gap-4">
        <span className="shrink-0">train freq.</span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-ink" initial={false} animate={{ width: `${A.freq * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <span className="w-24 shrink-0 text-right">{A.freq > 0.5 ? "frequent → aligned" : "rare → weak"}</span>
      </div>
    </div>
  );
}
