"use client";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/fx/IntroContext";
import { Magnetic } from "@/components/fx/Magnetic";
import { Roll } from "@/components/fx/Roll";
import { ConvField, KERNEL } from "@/components/viz/ConvField";
import { site } from "@/content/site";

const ease = [0.16, 1, 0.3, 1] as const;

function Line({ children, i, play }: { children: React.ReactNode; i: number; play: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className="block will-change-transform" initial={{ y: "105%", opacity: 0 }} animate={play ? { y: "0%", opacity: 1 } : undefined}
        transition={{ y: { duration: 1.15, ease, delay: 0.25 + i * 0.09 }, opacity: { duration: 0.6, delay: 0.25 + i * 0.09 } }}>
        {children}
      </motion.span>
    </span>
  );
}

function LocalTime() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.tz }).format(new Date()));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t} IST</span>;
}

export function Hero() {
  const { done } = useIntro();
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const outRef = useRef<HTMLSpanElement>(null);
  const posRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const onSample = useCallback((patch: number[], out: number, [c, r]: [number, number]) => {
    patch.forEach((v, i) => {
      const el = cells.current[i];
      if (el) { el.textContent = v.toFixed(2); el.style.backgroundColor = `color-mix(in srgb, var(--ink) ${Math.round(v * 22)}%, transparent)`; }
    });
    if (outRef.current) outRef.current.textContent = (out >= 0 ? "+" : "−") + Math.abs(out).toFixed(2);
    if (posRef.current) posRef.current.textContent = `(${String(c).padStart(2, "0")}, ${String(r).padStart(2, "0")})`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, Math.abs(out) / 2.2)})`;
  }, []);

  const fade = (d: number) => ({
    initial: { opacity: 0, y: 12, filter: "blur(6px)" },
    animate: done ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 0.9, ease, delay: d },
  });

  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* live convolution field */}
      <motion.div className="absolute inset-0 -z-10" initial={{ opacity: 0, scale: 1.04 }} animate={done ? { opacity: 1, scale: 1 } : undefined} transition={{ duration: 2, ease, delay: 0.1 }}>
        <ConvField onSample={onSample} className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] md:[mask-image:linear-gradient(to_right,transparent_18%,black_58%),linear-gradient(to_bottom,black_80%,transparent)] md:[mask-composite:intersect]" />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-bg" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-between px-5 pt-28 pb-8 sm:px-6 md:px-10 md:pt-32">
        {/* top row */}
        <div className="flex items-start justify-between gap-6">
          <motion.div {...fade(0.15)} className="eyebrow flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-heat" />
            Hi, I&apos;m Kundan — ML Engineer
          </motion.div>

          {/* kernel readout */}
          <motion.div {...fade(0.85)} className="card absolute top-28 right-10 hidden w-[248px] p-4 backdrop-blur-md lg:block !bg-[color-mix(in_srgb,var(--surface)_82%,transparent)]">
            <div className="mb-3 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
              <span>conv2d · 3×3</span><span ref={posRef}>(00, 00)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-3 gap-[3px] font-mono text-[10px] tabular-nums">
                {KERNEL.map((_, i) => (
                  <span key={i} ref={(el) => { cells.current[i] = el; }} className="flex h-[26px] w-[34px] items-center justify-center rounded-[5px] text-ink-2 transition-colors duration-150">0.00</span>
                ))}
              </div>
              <span className="text-muted">∗</span>
              <div className="grid grid-cols-3 gap-[3px] font-mono text-[10px] tabular-nums">
                {KERNEL.map((w, i) => (
                  <span key={i} className={`flex h-[26px] w-[18px] items-center justify-center ${w === 0 ? "text-faint" : "text-ink"}`}>{w > 0 ? `+${w}` : w}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">activation</span>
              <span ref={outRef} className="font-mono text-[15px] tabular-nums text-ink">+0.00</span>
            </div>
            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line">
              <span ref={barRef} className="block h-full origin-left bg-heat transition-transform duration-150" style={{ transform: "scaleX(0)" }} />
            </div>
            <p className="mt-3 font-mono text-[10px] leading-snug text-faint">Sobel-x edge filter. Move your cursor — you are the kernel.</p>
          </motion.div>
        </div>

        {/* headline */}
        <div className="pointer-events-none mt-14 md:mt-0">
          <h1 className="text-[clamp(3rem,11vw,8.2rem)] leading-[0.9] lg:text-[clamp(3rem,8.2vw,8.2rem)] font-medium tracking-[-0.055em]">
            <Line i={0} play={done}>Teaching</Line>
            <Line i={1} play={done}>machines to <span className="em pr-[0.05em] tracking-[-0.02em]">see,</span></Line>
            <Line i={2} play={done}><span className="silver-text">reason &amp; </span><span className="em tracking-[-0.02em] text-heat">explain.</span></Line>
          </h1>
        </div>

        {/* bottom row */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <motion.div {...fade(0.6)} className="lg:col-span-5">
            <p className="max-w-[440px] text-[16.5px] leading-relaxed text-ink-2">
              I build across <span className="text-ink">computer vision</span>, <span className="text-ink">retrieval-augmented LLMs</span> and <span className="text-ink">agentic systems</span> — and I like knowing <span className="em text-[1.15em]">why</span> a model decides what it does.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#work" className="group btn btn-ink">
                  <Roll>See the work</Roll>
                  <span aria-hidden className="transition-transform duration-500 group-hover:translate-y-0.5">↓</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href={`mailto:${site.email}`} className="btn btn-line"><Roll>Get in touch</Roll></a>
              </Magnetic>
            </div>
          </motion.div>

          <motion.dl {...fade(0.7)} className="relative grid grid-cols-3 gap-4 pt-5 sm:gap-6 lg:col-span-6 lg:col-start-7">
            <motion.span aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-line-2" initial={{ scaleX: 0 }} animate={done ? { scaleX: 1 } : undefined} transition={{ duration: 1.4, ease, delay: 0.8 }} />
            {[
              ["Currently", <>Software Engineer<br /><span className="text-muted">Caterpillar</span></>],
              ["Focus", <>CNNs · RAG<br /><span className="text-muted">LLM Agents</span></>],
              ["Local time", <><LocalTime /><br /><span className="text-muted">India</span></>],
            ].map(([k, v], i) => (
              <div key={i}>
                <dt className="eyebrow mb-2 !text-[10.5px]">{k}</dt>
                <dd className="text-[13px] leading-snug sm:text-[14px]">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

    </section>
  );
}
