"use client";
import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1.8 }: { value: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const c = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`; },
    });
    return () => c.stop();
  }, [inView, value, decimals, prefix, suffix, duration]);
  return <span ref={ref}>{`${prefix}${(0).toFixed(decimals)}${suffix}`}</span>;
}
