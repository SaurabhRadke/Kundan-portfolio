"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode, PointerEvent } from "react";

/** Element drifts toward the cursor while hovered, springs back on leave. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <motion.div className={`inline-block ${className ?? ""}`} style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}
