"use client";
import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/fx/IntroContext";

const curtain = [0.76, 0, 0.24, 1] as const;
const soft = [0.16, 1, 0.3, 1] as const;

/**
 * Minimal intro: a 3×3 kernel pulses, a hairline fills, a counter runs to 100 —
 * then the content lifts away and the panel slides up to reveal the hero.
 */
export function Preloader() {
  const { finish } = useIntro();
  const [show, setShow] = useState(true);
  const countRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0.1 : 1.7;
    const c = animate(0, 100, {
      duration: dur,
      ease: [0.45, 0, 0.15, 1],
      onUpdate: (v) => {
        if (countRef.current) countRef.current.textContent = String(Math.round(v)).padStart(3, "0");
        if (lineRef.current) lineRef.current.style.transform = `scaleX(${v / 100})`;
      },
    });
    // lift the curtain, then start the hero while it is mid-way up
    const t = setTimeout(() => setShow(false), dur * 1000 + 200);
    const t2 = setTimeout(finish, dur * 1000 + 200 + (reduced ? 0 : 550));
    return () => { c.stop(); clearTimeout(t); clearTimeout(t2); };
  }, [finish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-ink text-bg"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 1, ease: curtain, delay: 0.25 } }}
        >
          <motion.div className="flex h-full flex-col justify-between p-5 sm:p-8 md:p-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24, transition: { duration: 0.45, ease: soft } }}
            transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] opacity-60">
              <span>Kundan Mourya</span>
              <span>Portfolio · 2026</span>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-3 gap-[5px]" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => (
                  <motion.span key={i} className="h-3 w-3 rounded-[3px] bg-bg"
                    initial={{ opacity: 0.12 }} animate={{ opacity: [0.12, 1, 0.12] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: ((i % 3) + Math.floor(i / 3)) * 0.12, ease: "easeInOut" }} />
                ))}
              </div>
              <span className="relative block h-px w-40 overflow-hidden bg-bg/15">
                <span ref={lineRef} className="absolute inset-0 origin-left bg-bg" style={{ transform: "scaleX(0)" }} />
              </span>
            </div>

            <div className="flex items-end justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-60">Machine Learning Engineer</span>
              <span className="text-[clamp(3.5rem,10vw,8rem)] leading-[0.8] font-medium tracking-[-0.06em] tabular-nums">
                <span ref={countRef}>000</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
