"use client";
import { motion, type Transition } from "motion/react";
import type { Palette } from "@/components/fx/useThemeColors";

/** Each viz is a 240×150 SVG that loops while `play` is true. Geometry is real (fits, splits, projections are computed). */
export type VizProps = { play: boolean; c: Palette };

const W = 240, H = 150;
export const VIEW = `0 0 ${W} ${H}`;

const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

const loop = (duration: number, times?: number[], ease: Transition["ease"] = "easeInOut"): Transition => ({ duration, times, ease, repeat: Infinity, repeatDelay: 0.4 });
const anim = <T,>(play: boolean, v: T) => (play ? v : undefined);

/* ---------------- 1 · Linear regression ---------------- */
const lr = (() => {
  const r = rng(3);
  const pts = Array.from({ length: 16 }, (_, i) => {
    const x = 22 + i * 13 + r() * 6;
    return { x, y: 128 - (x - 20) * 0.45 - gauss(r) * 9 };
  });
  const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
  const m = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const b = my - m * mx;
  return { pts, m, b, mx, my };
})();
export function LinearViz({ play, c }: VizProps) {
  const slopes = [0, lr.m * 0.35, lr.m * 1.25, lr.m, lr.m];
  const yAt = (m: number, x: number) => lr.my + m * (x - lr.mx);
  const tr = loop(4.5, [0, 0.25, 0.5, 0.75, 1]);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      {lr.pts.map((p, i) => (
        <motion.line key={`r${i}`} x1={p.x} x2={p.x} y1={p.y} stroke={c.heat} strokeWidth={1} strokeDasharray="2 2"
          initial={{ y2: yAt(0, p.x) }} animate={anim(play, { y2: slopes.map((m) => yAt(m, p.x)) })} transition={tr} opacity={0.8} />
      ))}
      <motion.line x1={10} x2={230} stroke={c.ink} strokeWidth={1.75} strokeLinecap="round"
        initial={{ y1: yAt(0, 10), y2: yAt(0, 230) }} animate={anim(play, { y1: slopes.map((m) => yAt(m, 10)), y2: slopes.map((m) => yAt(m, 230)) })} transition={tr} />
      {lr.pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={c.ink} />)}
    </svg>
  );
}

/* ---------------- 2 · Logistic regression ---------------- */
const sig = (k: number) => {
  let d = "";
  for (let i = 0; i <= 40; i++) {
    const x = 10 + i * 5.5, y = 125 - 100 / (1 + Math.exp(-k * (x - 120)));
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};
const logPts = (() => {
  const r = rng(11);
  return Array.from({ length: 18 }, (_, i) => {
    const x = 18 + r() * 205;
    const cls = x + gauss(r) * 22 > 120 ? 1 : 0;
    return { x, cls, k: i };
  });
})();
export function LogisticViz({ play, c }: VizProps) {
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      <line x1={10} x2={230} y1={75} y2={75} stroke={c.faint} strokeDasharray="3 4" strokeWidth={1} />
      <motion.line y1={18} y2={132} stroke={c.heat} strokeWidth={1} initial={{ x1: 120, x2: 120, opacity: 0 }}
        animate={anim(play, { opacity: [0, 0, 1, 1, 0] })} transition={loop(4.5, [0, 0.45, 0.6, 0.9, 1])} />
      <motion.path fill="none" stroke={c.ink} strokeWidth={1.75} strokeLinecap="round"
        initial={{ d: sig(0.01), pathLength: 1 }} animate={anim(play, { d: [sig(0.005), sig(0.02), sig(0.07), sig(0.07), sig(0.005)] })} transition={loop(4.5, [0, 0.3, 0.6, 0.9, 1])} />
      {logPts.map((p) => (
        <motion.circle key={p.k} cx={p.x} cy={p.cls ? 25 : 125} r={3.2}
          fill={p.cls ? c.ink : c.surface} stroke={c.ink} strokeWidth={1.2}
          initial={{ opacity: 1 }} animate={anim(play, { scale: [1, 1, 1.35, 1] })} transition={loop(4.5, [0, 0.55, 0.65, 1])} />
      ))}
    </svg>
  );
}

/* ---------------- 3 · Decision tree ---------------- */
const tree = {
  nodes: [
    { x: 120, y: 20, d: 0 },
    { x: 65, y: 62, d: 1 }, { x: 175, y: 62, d: 1 },
    { x: 35, y: 108, d: 2, leaf: 0 }, { x: 95, y: 108, d: 2, leaf: 1 }, { x: 150, y: 108, d: 2, leaf: 1 }, { x: 205, y: 108, d: 2, leaf: 0 },
  ],
  edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]],
  path: [0, 2, 5],
};
export function TreeViz({ play, c }: VizProps) {
  const N = tree.nodes;
  const tr = (d: number) => loop(5, [0, 0.08 + d * 0.12, 0.2 + d * 0.12, 0.92, 1]);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      {tree.edges.map(([a, b], i) => {
        const hot = tree.path.includes(a) && tree.path.includes(b);
        return (
          <g key={i}>
            <motion.line x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke={c.line} strokeWidth={1.5}
              initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 0, 1, 1, 0] })} transition={tr(N[b].d - 1)} />
            {hot && (
              <motion.line x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke={c.heat} strokeWidth={2.25} strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={anim(play, { pathLength: [0, 0, 1, 1, 0] })} transition={loop(5, [0, 0.45 + (N[b].d - 1) * 0.12, 0.55 + (N[b].d - 1) * 0.12, 0.92, 1])} />
            )}
          </g>
        );
      })}
      {N.map((n, i) => (
        <motion.g key={i} initial={{ opacity: 1, scale: 1 }} animate={anim(play, { opacity: [0, 0, 1, 1, 0], scale: [0.4, 0.4, 1, 1, 0.4] })} transition={tr(n.d)} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
          {"leaf" in n ? (
            <rect x={n.x - 11} y={n.y - 8} width={22} height={16} rx={4} fill={n.leaf ? c.ink : c.surface} stroke={c.ink} strokeWidth={1.2} />
          ) : (
            <circle cx={n.x} cy={n.y} r={8} fill={c.surface} stroke={tree.path.includes(i) ? c.heat : c.ink} strokeWidth={1.5} />
          )}
        </motion.g>
      ))}
      <motion.circle r={4} fill={c.heat} initial={{ cx: 120, cy: 20, opacity: 0 }}
        animate={anim(play, { cx: [120, 120, 175, 150, 150], cy: [20, 20, 62, 108, 108], opacity: [0, 1, 1, 1, 0] })} transition={loop(5, [0, 0.45, 0.6, 0.75, 1])} />
    </svg>
  );
}

/* ---------------- 4 · Random forest ---------------- */
export function ForestViz({ play, c }: VizProps) {
  const trees = [40, 120, 200];
  const votes = [1, 1, 0];
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      {trees.map((x, t) => {
        const leafX = [x - 22, x - 7, x + 7, x + 22];
        const pick = t === 2 ? 3 : t === 0 ? 1 : 2;
        const mid = pick < 2 ? x - 14 : x + 14;
        return (
          <g key={t}>
            {[x - 14, x + 14].map((m, i) => <line key={i} x1={x} y1={18} x2={m} y2={46} stroke={c.line} strokeWidth={1.4} />)}
            {leafX.map((lx, i) => <line key={`l${i}`} x1={i < 2 ? x - 14 : x + 14} y1={46} x2={lx} y2={74} stroke={c.line} strokeWidth={1.4} />)}
            <motion.path d={`M${x} 18 L${mid} 46 L${leafX[pick]} 74`} fill="none" stroke={c.heat} strokeWidth={2} strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={anim(play, { pathLength: [0, 0, 1, 1, 0] })} transition={loop(5, [0, 0.1 + t * 0.08, 0.35 + t * 0.08, 0.9, 1])} />
            <circle cx={x} cy={18} r={5} fill={c.surface} stroke={c.ink} strokeWidth={1.3} />
            {[x - 14, x + 14].map((m, i) => <circle key={i} cx={m} cy={46} r={4} fill={c.surface} stroke={c.ink} strokeWidth={1.2} />)}
            {leafX.map((lx, i) => <rect key={`r${i}`} x={lx - 4} y={70} width={8} height={8} rx={2} fill={i % 2 ? c.ink : c.surface} stroke={c.ink} strokeWidth={1} />)}
            <motion.circle r={4.5} fill={votes[t] ? c.ink : c.surface} stroke={c.ink} strokeWidth={1.2}
              initial={{ cx: leafX[pick], cy: 74, opacity: 0 }}
              animate={anim(play, { cx: [leafX[pick], leafX[pick], 108 + t * 12], cy: [74, 74, 124], opacity: [0, 1, 1] })}
              transition={{ duration: 5, times: [0, 0.5, 0.72], ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 }} />
          </g>
        );
      })}
      <rect x={96} y={112} width={48} height={24} rx={12} fill="none" stroke={c.line} strokeDasharray="3 3" />
      <motion.text x={160} y={128} fontSize={11} fontFamily="var(--font-geist-mono)" fill={c.ink}
        initial={{ opacity: 0 }} animate={anim(play, { opacity: [0, 0, 1, 1, 0] })} transition={loop(5, [0, 0.75, 0.82, 0.95, 1])}>
        vote → ●
      </motion.text>
    </svg>
  );
}

/* ---------------- 5 · KNN ---------------- */
const knn = (() => {
  const r = rng(21);
  const pts = [
    ...Array.from({ length: 11 }, () => ({ x: 70 + gauss(r) * 26, y: 60 + gauss(r) * 20, c: 1 })),
    ...Array.from({ length: 11 }, () => ({ x: 170 + gauss(r) * 26, y: 95 + gauss(r) * 20, c: 0 })),
  ].map((p) => ({ ...p, x: Math.max(12, Math.min(228, p.x)), y: Math.max(12, Math.min(138, p.y)) }));
  const q = { x: 112, y: 76 };
  const sorted = pts.map((p, i) => ({ i, d: Math.hypot(p.x - q.x, p.y - q.y) })).sort((a, b) => a.d - b.d);
  const near = sorted.slice(0, 5).map((s) => s.i);
  return { pts, q, near, rad: sorted[4].d + 5 };
})();
export function KnnViz({ play, c }: VizProps) {
  const tr = loop(4.5, [0, 0.15, 0.45, 0.85, 1]);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      <motion.circle cx={knn.q.x} cy={knn.q.y} fill={c.heatSoft} fillOpacity={0.5} stroke={c.heat} strokeDasharray="3 3"
        initial={{ r: knn.rad }} animate={anim(play, { r: [0, 0, knn.rad, knn.rad, 0] })} transition={tr} />
      {knn.near.map((i) => (
        <motion.line key={i} x1={knn.q.x} y1={knn.q.y} x2={knn.pts[i].x} y2={knn.pts[i].y} stroke={c.heat} strokeWidth={1.2}
          initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 0, 0, 1, 1, 0] })} transition={loop(4.5, [0, 0.3, 0.45, 0.6, 0.85, 1])} />
      ))}
      {knn.pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.2} fill={p.c ? c.ink : c.surface} stroke={c.ink} strokeWidth={1.2} />)}
      <motion.circle cx={knn.q.x} cy={knn.q.y} r={5} stroke={c.heat} strokeWidth={2}
        initial={{ fill: c.ink }} animate={anim(play, { fill: [c.surface, c.surface, c.surface, c.ink, c.ink, c.surface] })} transition={loop(4.5, [0, 0.3, 0.6, 0.7, 0.85, 1])} />
    </svg>
  );
}

/* ---------------- 6 · Naive Bayes ---------------- */
const bell = (mu: number, s: number, amp: number) => {
  let d = `M10 130`;
  for (let i = 0; i <= 44; i++) {
    const x = 10 + i * 5;
    d += ` L${x} ${(130 - amp * Math.exp(-((x - mu) ** 2) / (2 * s * s))).toFixed(1)}`;
  }
  return d + " L230 130 Z";
};
export function BayesViz({ play, c }: VizProps) {
  const xs = [40, 90, 125, 160, 210, 40];
  const pA = (x: number) => { const a = Math.exp(-((x - 85) ** 2) / (2 * 28 * 28)), b = 0.9 * Math.exp(-((x - 160) ** 2) / (2 * 32 * 32)); return a / (a + b); };
  const tr = loop(6, [0, 0.2, 0.4, 0.6, 0.8, 1]);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      <motion.path d={bell(85, 28, 100)} fill={c.ink} fillOpacity={0.12} stroke={c.ink} strokeWidth={1.5}
        initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 1, 1, 1, 1, 1] })} transition={tr} />
      <motion.path d={bell(160, 32, 90)} fill={c.heat} fillOpacity={0.14} stroke={c.heat} strokeWidth={1.5}
        initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 1, 1, 1, 1, 1] })} transition={tr} />
      <line x1={10} x2={230} y1={130} y2={130} stroke={c.line} />
      <motion.line y1={14} y2={130} stroke={c.ink} strokeWidth={1} strokeDasharray="2 3"
        initial={{ x1: 125, x2: 125 }} animate={anim(play, { x1: xs, x2: xs })} transition={tr} />
      {/* posterior bars */}
      <rect x={196} y={14} width={34} height={6} rx={3} fill={c.line} />
      <motion.rect x={196} y={14} height={6} rx={3} fill={c.ink} initial={{ width: 34 * pA(125) }} animate={anim(play, { width: xs.map((x) => 34 * pA(x)) })} transition={tr} />
      <rect x={196} y={24} width={34} height={6} rx={3} fill={c.line} />
      <motion.rect x={196} y={24} height={6} rx={3} fill={c.heat} initial={{ width: 34 * (1 - pA(125)) }} animate={anim(play, { width: xs.map((x) => 34 * (1 - pA(x))) })} transition={tr} />
    </svg>
  );
}

/* ---------------- 7 · SVM ---------------- */
const svm = (() => {
  const r = rng(5);
  const a = Array.from({ length: 10 }, () => ({ x: 60 + gauss(r) * 18, y: 50 + gauss(r) * 16, c: 1 }));
  const b = Array.from({ length: 10 }, () => ({ x: 175 + gauss(r) * 18, y: 100 + gauss(r) * 16, c: 0 }));
  a.push({ x: 100, y: 78, c: 1 }); b.push({ x: 135, y: 70, c: 0 });
  return [...a, ...b];
})();
export function SvmViz({ play, c }: VizProps) {
  // boundary through (118, 75), normal roughly along (1, 0.45)
  const line = (ang: number, off: number) => {
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    const cx = 118 + nx * off, cy = 75 + ny * off;
    return { x1: cx - dx * 120, y1: cy - dy * 120, x2: cx + dx * 120, y2: cy + dy * 120 };
  };
  const angs = [-0.3, 0.6, 1.55, 1.2, 1.2, -0.3];
  const tr = loop(5, [0, 0.2, 0.4, 0.55, 0.9, 1]);
  const kf = (off: number) => {
    const ls = angs.map((a, i) => line(a, i >= 3 && i < 5 ? off : 0));
    return { x1: ls.map((l) => l.x1), y1: ls.map((l) => l.y1), x2: ls.map((l) => l.x2), y2: ls.map((l) => l.y2) };
  };
  const still = (off: number) => line(1.2, off);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      <defs><clipPath id="svmclip"><rect width={W} height={H} /></clipPath></defs>
      <g clipPath="url(#svmclip)">
        {[-17, 17].map((o) => (
          <motion.line key={o} stroke={c.faint} strokeDasharray="4 4" strokeWidth={1} initial={still(o)} animate={anim(play, kf(o))} transition={tr} />
        ))}
        <motion.line stroke={c.ink} strokeWidth={1.75} initial={still(0)} animate={anim(play, kf(0))} transition={tr} />
      </g>
      {svm.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.2} fill={p.c ? c.ink : c.surface} stroke={c.ink} strokeWidth={1.2} />)}
      {[svm[10], svm[21]].map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} fill="none" stroke={c.heat} strokeWidth={1.5}
          initial={{ r: 7, opacity: 1 }} animate={anim(play, { r: [4, 4, 4, 9, 7, 4], opacity: [0, 0, 0, 1, 1, 0] })} transition={tr} />
      ))}
    </svg>
  );
}

/* ---------------- 8 · K-Means ---------------- */
const km = (() => {
  const r = rng(9);
  const centers = [{ x: 60, y: 45 }, { x: 175, y: 50 }, { x: 115, y: 115 }];
  const pts = centers.flatMap((cc) => Array.from({ length: 12 }, () => ({ x: cc.x + gauss(r) * 17, y: cc.y + gauss(r) * 13 })));
  let cents = [{ x: 30, y: 120 }, { x: 120, y: 30 }, { x: 210, y: 130 }];
  const hist = [cents];
  const assigns: number[][] = [];
  for (let it = 0; it < 4; it++) {
    const as = pts.map((p) => cents.map((c) => Math.hypot(p.x - c.x, p.y - c.y)).reduce((bi, d, i, arr) => (d < arr[bi] ? i : bi), 0));
    assigns.push(as);
    cents = cents.map((c, k) => {
      const m = pts.filter((_, i) => as[i] === k);
      return m.length ? { x: m.reduce((s, p) => s + p.x, 0) / m.length, y: m.reduce((s, p) => s + p.y, 0) / m.length } : c;
    });
    hist.push(cents);
  }
  return { pts, hist, assigns };
})();
export function KMeansViz({ play, c }: VizProps) {
  const cols = [c.ink, c.heat, c.silver];
  const steps = km.hist.length; // 5 positions
  const times = Array.from({ length: steps + 1 }, (_, i) => i / steps);
  const tr = loop(6, times);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      {km.pts.map((p, i) => {
        const seq = [c.faint, ...km.assigns.map((a) => cols[a[i]]), c.faint];
        return <motion.circle key={i} cx={p.x} cy={p.y} r={3} initial={{ fill: cols[km.assigns[3][i]] }} animate={anim(play, { fill: seq })} transition={tr} />;
      })}
      {[0, 1, 2].map((k) => {
        const xs = [...km.hist.map((h) => h[k].x), km.hist[0][k].x];
        const ys = [...km.hist.map((h) => h[k].y), km.hist[0][k].y];
        const end = km.hist[steps - 1][k];
        return (
          <motion.g key={k} initial={{ x: end.x, y: end.y }} animate={anim(play, { x: xs, y: ys })} transition={tr}>
            <circle r={7} fill={c.surface} stroke={cols[k]} strokeWidth={2} />
            <path d="M-3 -3 L3 3 M3 -3 L-3 3" stroke={cols[k]} strokeWidth={1.6} />
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ---------------- 9 · PCA ---------------- */
const pca = (() => {
  const r = rng(13), ang = -0.5, cx = 120, cy = 75;
  const pts = Array.from({ length: 34 }, () => {
    const u = gauss(r) * 42, v = gauss(r) * 10;
    return { x: cx + u * Math.cos(ang) - v * Math.sin(ang), y: cy + u * Math.sin(ang) + v * Math.cos(ang) };
  });
  // real PCA: covariance eigenvector
  const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length, my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  let sxx = 0, syy = 0, sxy = 0;
  pts.forEach((p) => { sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; sxy += (p.x - mx) * (p.y - my); });
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const ux = Math.cos(th), uy = Math.sin(th);
  const proj = pts.map((p) => { const d = (p.x - mx) * ux + (p.y - my) * uy; return { x: mx + d * ux, y: my + d * uy }; });
  return { pts, proj, mx, my, ux, uy };
})();
export function PcaViz({ play, c }: VizProps) {
  const { mx, my, ux, uy } = pca;
  const tr = loop(5, [0, 0.25, 0.45, 0.75, 1]);
  return (
    <svg viewBox={VIEW} className="h-full w-full">
      <motion.line x1={mx - ux * 105} y1={my - uy * 105} x2={mx + ux * 105} y2={my + uy * 105} stroke={c.ink} strokeWidth={1.5}
        initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 1, 1, 1, 0] })} transition={tr} />
      <motion.line x1={mx + uy * 28} y1={my - ux * 28} x2={mx - uy * 28} y2={my + ux * 28} stroke={c.faint} strokeWidth={1.2} strokeDasharray="3 3"
        initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 1, 1, 1, 0] })} transition={tr} />
      {pca.pts.map((p, i) => (
        <motion.circle key={i} r={2.8} fill={i % 3 === 0 ? c.heat : c.ink}
          initial={{ cx: pca.proj[i].x, cy: pca.proj[i].y }}
          animate={anim(play, { cx: [p.x, p.x, pca.proj[i].x, pca.proj[i].x, p.x], cy: [p.y, p.y, pca.proj[i].y, pca.proj[i].y, p.y] })} transition={tr} />
      ))}
    </svg>
  );
}

/* ---------------- RAG pipeline (wide or stacked) ---------------- */
type RagLay = {
  vb: string;
  docs: [number, number]; docsLabel: [number, number];
  chunk: { x: number; y0: number }; chunkLabel: [number, number];
  embed: string; embedLabel: [number, number];
  store: { x: number; y: number; w: number; h: number }; storeLabel: [number, number];
  pill: [number, number];
  retr: string; retrLabel: [number, number];
  llm: { x: number; y: number; w: number; h: number }; llmLabel: [number, number];
};
const RAG_WIDE: RagLay = {
  vb: "0 -4 680 184",
  docs: [24, 40], docsLabel: [24, 160],
  chunk: { x: 140, y0: 40 }, chunkLabel: [140, 160],
  embed: "M210 92 C 240 92, 255 92, 285 92", embedLabel: [222, 84],
  store: { x: 290, y: 24, w: 140, h: 132 }, storeLabel: [290, 172],
  pill: [300, -2],
  retr: "M435 92 C 465 92, 470 92, 495 92", retrLabel: [436, 84],
  llm: { x: 500, y: 52, w: 160, h: 80 }, llmLabel: [500, 160],
};
const RAG_TALL: RagLay = {
  vb: "0 0 340 336",
  docs: [16, 40], docsLabel: [16, 160],
  chunk: { x: 112, y0: 40 }, chunkLabel: [112, 160],
  embed: "M172 88 C 185 88, 195 88, 208 88", embedLabel: [174, 104],
  store: { x: 212, y: 30, w: 116, h: 120 }, storeLabel: [212, 166],
  pill: [208, 4],
  retr: "M270 172 C 270 190, 270 200, 270 214", retrLabel: [280, 198],
  llm: { x: 16, y: 218, w: 312, h: 86 }, llmLabel: [16, 326],
};

export function RagViz({ play, c, tall = false }: VizProps & { tall?: boolean }) {
  const L = tall ? RAG_TALL : RAG_WIDE;
  const D = 7;
  const tr = (a: number, b: number, hold = 0.92) => ({ duration: D, times: [0, a, b, hold, 1], ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 0.3 });
  const on = () => anim(play, { opacity: [0, 0, 1, 1, 0] });
  const S = L.store;
  const r = rng(31);
  const store = Array.from({ length: 22 }, (_, i) => ({ x: S.x + 10 + r() * (S.w - 20), y: S.y + 10 + r() * (S.h - 20), i }));
  const q = { x: S.x + S.w * 0.52, y: S.y + S.h * 0.52 };
  const top = store.map((s) => ({ ...s, d: Math.hypot(s.x - q.x, s.y - q.y) })).sort((a, b) => a.d - b.d).slice(0, 3);
  const mono = "var(--font-geist-mono)";
  const lineW = [0.62, 0.5, 0.34].map((f) => f * (L.llm.w - 28));
  const T = (p: [number, number], s: string) => <text x={p[0]} y={p[1]} fontSize={10} fontFamily={mono} fill={c.muted}>{s}</text>;
  return (
    <svg viewBox={L.vb} className="h-full w-full">
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${L.docs[0] + k * 8} ${L.docs[1] + k * 8})`}>
          <rect width={64} height={84} rx={6} fill={c.surface} stroke={c.ink} strokeWidth={1.2} />
          {[0, 1, 2, 3, 4, 5].map((l) => <rect key={l} x={10} y={14 + l * 10} width={l % 3 === 2 ? 30 : 44} height={3} rx={1.5} fill={c.faint} />)}
        </g>
      ))}
      {T(L.docsLabel, "PDFs")}

      {[0, 1, 2, 3, 4].map((k) => (
        <motion.rect key={k} x={L.chunk.x} width={56} height={14} rx={4} fill={c.ink} fillOpacity={0.12} stroke={c.ink} strokeWidth={1}
          initial={{ y: L.chunk.y0 + k * 20, opacity: 1 }} animate={anim(play, { y: [L.chunk.y0 + 40, L.chunk.y0 + 40, L.chunk.y0 + k * 20, L.chunk.y0 + k * 20, L.chunk.y0 + 40], opacity: [0, 0, 1, 1, 0] })} transition={tr(0.05 + k * 0.03, 0.2 + k * 0.03)} />
      ))}
      {T(L.chunkLabel, "chunk")}

      <motion.path d={L.embed} fill="none" stroke={c.ink} strokeWidth={1.2} strokeDasharray="3 3" initial={{ opacity: 1 }} animate={on()} transition={tr(0.2, 0.3)} />
      {T(L.embedLabel, "embed")}

      <rect x={S.x} y={S.y} width={S.w} height={S.h} rx={12} fill="none" stroke={c.line} />
      {store.map((s) => (
        <motion.circle key={s.i} cx={s.x} cy={s.y} r={2.6} fill={c.ink}
          initial={{ opacity: 0.8 }} animate={anim(play, { opacity: [0, 0, 0.8, 0.8, 0] })} transition={tr(0.25 + (s.i % 6) * 0.015, 0.33 + (s.i % 6) * 0.015)} />
      ))}
      {T(L.storeLabel, "vector store")}

      <motion.g initial={{ opacity: 1 }} animate={on()} transition={tr(0.4, 0.46)}>
        <rect x={L.pill[0]} y={L.pill[1]} width={122} height={20} rx={10} fill={c.heatSoft} />
        <text x={L.pill[0] + 12} y={L.pill[1] + 14} fontSize={10} fontFamily={mono} fill={c.ink}>“Q3 NPA trend?”</text>
      </motion.g>
      <motion.circle cx={q.x} cy={q.y} r={5} fill={c.heat} initial={{ opacity: 1 }} animate={on()} transition={tr(0.46, 0.5)} />
      {top.map((t, i) => (
        <motion.line key={i} x1={q.x} y1={q.y} x2={t.x} y2={t.y} stroke={c.heat} strokeWidth={1.5}
          initial={{ pathLength: 1 }} animate={anim(play, { pathLength: [0, 0, 1, 1, 0] })} transition={tr(0.5 + i * 0.03, 0.58 + i * 0.03)} />
      ))}
      <motion.circle cx={q.x} cy={q.y} fill="none" stroke={c.heat} strokeDasharray="2 3"
        initial={{ r: top[2].d + 4 }} animate={anim(play, { r: [0, 0, top[2].d + 4, top[2].d + 4, 0] })} transition={tr(0.48, 0.58)} />

      <motion.path d={L.retr} fill="none" stroke={c.ink} strokeWidth={1.2} strokeDasharray="3 3" initial={{ opacity: 1 }} animate={on()} transition={tr(0.6, 0.66)} />
      {T(L.retrLabel, "top-k")}
      <rect x={L.llm.x} y={L.llm.y} width={L.llm.w} height={L.llm.h} rx={14} fill={c.ink} />
      <text x={L.llm.x + 14} y={L.llm.y + 20} fontSize={10} fontFamily={mono} fill={c.bg} opacity={0.6}>LLM · DeepSeek-R1</text>
      {lineW.map((w, l) => (
        <motion.rect key={l} x={L.llm.x + 14} y={L.llm.y + 32 + l * 13} height={5} rx={2.5} fill={c.bg}
          initial={{ width: w }} animate={anim(play, { width: [0, 0, w, w, 0] })} transition={tr(0.68 + l * 0.06, 0.76 + l * 0.06)} />
      ))}
      {T(L.llmLabel, "grounded answer · on-prem")}
    </svg>
  );
}
