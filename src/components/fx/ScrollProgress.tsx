"use client";
import { motion, useScroll, useSpring } from "motion/react";

/** A thin silver bar along the top edge that fills as you scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[2px] origin-left"
      style={{ scaleX, background: "linear-gradient(90deg, var(--silver), var(--ink-2) 60%, var(--heat))" }}
    />
  );
}
