"use client";
import { motion } from "motion/react";
import type { VizProps } from "./algos";

const mono = "var(--font-geist-mono)";
const rep = (duration: number, times: number[]) => ({ duration, times, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 0.3 });
const A = <T,>(play: boolean, v: T) => (play ? v : undefined);

/** Customer segmentation — three groups resolve, then a new customer gets one-click classified. */
export function SegmentViz({ play, c }: VizProps) {
  const groups = [
    { x: 70, y: 60, col: c.ink, pts: [[-14, -8], [6, -14], [14, 4], [-6, 10], [-18, 6], [2, -2], [10, 14]] },
    { x: 165, y: 45, col: c.heat, pts: [[-10, -6], [8, -10], [14, 6], [-4, 10], [-16, 2], [0, 0]] },
    { x: 240, y: 90, col: c.silver, pts: [[-12, -10], [10, -8], [16, 8], [-6, 12], [-18, 2], [4, 0], [0, 16]] },
  ];
  const tr = rep(5, [0, 0.35, 0.85, 1]);
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full">
      {groups.map((g, gi) => (
        <g key={gi}>
          <motion.circle cx={g.x} cy={g.y} r={30} fill="none" stroke={g.col} strokeDasharray="3 4"
            initial={{ opacity: 1 }} animate={A(play, { opacity: [0, 1, 1, 0] })} transition={tr} />
          {g.pts.map(([dx, dy], i) => (
            <motion.circle key={i} r={3.2} initial={{ cx: g.x + dx, cy: g.y + dy, fill: g.col }}
              animate={A(play, { cx: [160 + dx * 4 - gi * 20, g.x + dx, g.x + dx, 160 + dx * 4 - gi * 20], cy: [70 + dy * 2.4, g.y + dy, g.y + dy, 70 + dy * 2.4], fill: [c.faint, g.col, g.col, c.faint] })} transition={tr} />
          ))}
        </g>
      ))}
      <motion.g initial={{ opacity: 1 }} animate={A(play, { opacity: [0, 0, 1, 1, 0] })} transition={rep(5, [0, 0.45, 0.55, 0.85, 1])}>
        <circle cx={150} cy={112} r={5} fill={c.heat} stroke={c.ink} strokeWidth={1.5} />
        <path d="M150 112 C 155 90, 165 70, 165 52" fill="none" stroke={c.heat} strokeDasharray="2 3" />
        <text x={160} y={128} fontSize={8} fontFamily={mono} fill={c.muted}>new customer → segment B</text>
      </motion.g>
    </svg>
  );
}

/** Hiring automation — a LangGraph state machine; a candidate token walks the graph. */
export function HiringViz({ play, c }: VizProps) {
  const nodes = [
    { x: 30, l: "JD" }, { x: 95, l: "Source" }, { x: 160, l: "Screen" }, { x: 225, l: "Interview" }, { x: 290, l: "Offer" },
  ];
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full">
      <path d="M160 58 C 160 20, 95 20, 95 52" fill="none" stroke={c.line} strokeDasharray="3 3" />
      <text x={104} y={22} fontSize={7.5} fontFamily={mono} fill={c.faint}>retry</text>
      <line x1={30} x2={290} y1={70} y2={70} stroke={c.line} strokeWidth={1.5} />
      <motion.line x1={30} x2={290} y1={70} y2={70} stroke={c.ink} strokeWidth={1.5}
        initial={{ pathLength: 1 }} animate={A(play, { pathLength: [0, 1, 1, 0] })} transition={rep(5, [0, 0.8, 0.95, 1])} />
      {nodes.map((n, i) => (
        <g key={n.l}>
          <motion.circle cx={n.x} cy={70} r={12} stroke={c.ink} strokeWidth={1.4}
            initial={{ fill: c.ink }} animate={A(play, { fill: [c.surface, c.surface, c.ink, c.ink, c.surface] })} transition={rep(5, [0, i * 0.18, i * 0.18 + 0.05, 0.95, 1])} />
          <text x={n.x} y={100} fontSize={8} textAnchor="middle" fontFamily={mono} fill={c.muted}>{n.l}</text>
        </g>
      ))}
      <motion.circle cy={70} r={4} fill={c.heat} initial={{ cx: 290 }} animate={A(play, { cx: [30, 290, 290] })} transition={rep(5, [0, 0.8, 1])} />
      <text x={160} y={128} fontSize={8} textAnchor="middle" fontFamily={mono} fill={c.faint}>pydantic-typed state at every edge</text>
    </svg>
  );
}

/** Meme surveillance — image + text encoders fused by cross-modal attention. */
export function MemeViz({ play, c }: VizProps) {
  const tokens = ["when", "you", "see", "it"];
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full">
      <rect x={16} y={20} width={70} height={56} rx={6} fill={c.ink} opacity={0.12} stroke={c.ink} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={22 + k * 21} y={26 + r * 16} width={18} height={13} rx={2} fill={c.ink} opacity={0.1 + ((r + k) % 3) * 0.12} />))}
      {tokens.map((t, i) => (
        <g key={t}><rect x={16 + i * 18} y={88} width={16} height={16} rx={3} fill={c.surface} stroke={c.ink} /><text x={24 + i * 18} y={99} fontSize={7} textAnchor="middle" fontFamily={mono} fill={c.ink}>{t[0]}</text></g>
      ))}
      <text x={16} y={124} fontSize={7.5} fontFamily={mono} fill={c.faint}>CLIP image · text</text>
      {[0, 1, 2, 3].map((i) => [0, 1, 2].map((j) => (
        <motion.line key={`${i}${j}`} x1={110} y1={30 + j * 20} x2={160} y2={84 + i * 8} stroke={c.heat} strokeWidth={1}
          initial={{ opacity: 0.5 }} animate={A(play, { opacity: [0, 0.8, 0.2, 0] })} transition={rep(3.5, [0, 0.35 + (i + j) * 0.04, 0.7, 1])} />
      )))}
      {[0, 1, 2].map((j) => <circle key={j} cx={110} cy={30 + j * 20} r={4} fill={c.ink} />)}
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={160} cy={84 + i * 8} r={3} fill={c.surface} stroke={c.ink} />)}
      <rect x={196} y={46} width={44} height={44} rx={10} fill={c.ink} />
      <text x={218} y={72} fontSize={7.5} textAnchor="middle" fontFamily={mono} fill={c.bg}>fuse</text>
      <path d="M170 68 L194 68" stroke={c.ink} strokeDasharray="2 3" />
      <path d="M242 68 L262 68" stroke={c.ink} strokeDasharray="2 3" />
      <rect x={266} y={60} width={44} height={16} rx={8} fill={c.line} />
      <motion.rect x={266} y={60} height={16} rx={8} fill={c.heat} initial={{ width: 30 }} animate={A(play, { width: [6, 6, 34, 34, 6] })} transition={rep(3.5, [0, 0.55, 0.75, 0.95, 1])} />
      <text x={288} y={96} fontSize={7.5} textAnchor="middle" fontFamily={mono} fill={c.muted}>hateful?</text>
    </svg>
  );
}

/** Private RAG — the whole loop lives inside a lock boundary. */
export function PrivateRagViz({ play, c }: VizProps) {
  return (
    <svg viewBox="0 0 320 140" className="h-full w-full">
      <rect x={10} y={10} width={300} height={120} rx={18} fill="none" stroke={c.line} strokeDasharray="5 5" />
      <g transform="translate(286 16)">
        <rect x={0} y={7} width={14} height={11} rx={2} fill={c.ink} />
        <path d="M3 7 V4 a4 4 0 0 1 8 0 V7" fill="none" stroke={c.ink} strokeWidth={1.5} />
      </g>
      <motion.g initial={{ opacity: 1, x: 0 }} animate={A(play, { opacity: [0, 1, 1, 1, 0], x: [-10, 0, 0, 0, 0] })} transition={rep(5, [0, 0.12, 0.5, 0.95, 1])}>
        <rect x={30} y={30} width={140} height={26} rx={13} fill={c.bg} stroke={c.line} />
        <text x={44} y={47} fontSize={8.5} fontFamily={mono} fill={c.ink2}>Summarise clause 4.2</text>
      </motion.g>
      <motion.g initial={{ opacity: 1 }} animate={A(play, { opacity: [0, 0, 1, 1, 0] })} transition={rep(5, [0, 0.3, 0.4, 0.95, 1])}>
        <rect x={120} y={68} width={170} height={44} rx={14} fill={c.ink} />
        {[0, 1].map((l) => (
          <motion.rect key={l} x={134} y={82 + l * 12} height={5} rx={2.5} fill={c.bg} initial={{ width: [120, 80][l] }}
            animate={A(play, { width: [0, 0, [120, 80][l], [120, 80][l], 0] })} transition={rep(5, [0, 0.4 + l * 0.12, 0.6 + l * 0.12, 0.95, 1])} />
        ))}
      </motion.g>
      <text x={30} y={122} fontSize={8} fontFamily={mono} fill={c.faint}>0 bytes leave the network</text>
    </svg>
  );
}
