"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fade + lift on first view. */
export function Reveal({ children, delay = 0, className, y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Masked line reveal: each line rises from behind a clip. The wrapper (not the clipped line) is observed. */
export function Lines({ lines, className, delay = 0, stagger = 0.08 }: { lines: ReactNode[]; className?: string; delay?: number; stagger?: number }) {
  return (
    <motion.span className={`block ${className ?? ""}`} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -8% 0px" }}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.1, ease, delay: delay + i * stagger } } }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Section header: mono index + eyebrow, big title with one serif italic word. */
export function SectionHead({ index, eyebrow, title, aside }: { index: string; eyebrow: string; title: ReactNode[]; aside?: ReactNode }) {
  return (
    <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <Reveal y={12}>
          <div className="eyebrow mb-6 flex items-center gap-3">
            <span className="text-ink">{index}</span>
            <span className="h-px w-10 bg-line-2" />
            {eyebrow}
          </div>
        </Reveal>
        <h2 className="h-display"><Lines lines={title} /></h2>
      </div>
      {aside && <Reveal delay={0.15} className="text-[15.5px] leading-relaxed text-muted md:col-span-4">{aside}</Reveal>}
    </div>
  );
}
