"use client";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Reveal, SectionHead } from "@/components/fx/Reveal";
import { education, experience, toolkit } from "@/content/site";

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const h = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section id="experience" className="relative bg-bg-2 py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <SectionHead index="05" eyebrow="Experience" title={[<>Where I&apos;ve</>, <><span className="em">built</span> <span className="silver-text">things.</span></>]}
          aside={<>I&apos;m a Software Engineer at Caterpillar — I joined full-time in August 2026 after my summer internship there.</>} />

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <ol ref={ref} className="relative lg:col-span-8">
            <span className="absolute top-2 bottom-2 left-[7px] w-px bg-line-2" />
            <motion.span className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-ink" style={{ scaleY: h }} />
            {experience.map((r, i) => (
              <li key={r.title + r.period} className="group relative pb-12 pl-9 last:pb-0 sm:pl-12 md:pb-14">
                <Reveal delay={i * 0.05}>
                  <span className={`absolute top-[7px] left-0 flex h-[15px] w-[15px] items-center justify-center rounded-full border ${r.current ? "border-heat bg-heat" : "border-ink-2 bg-bg-2"}`}>
                    {r.current && <span className="absolute h-full w-full animate-ping rounded-full bg-heat opacity-50" />}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-[clamp(1.5rem,2.4vw,2.1rem)] leading-tight font-medium tracking-[-0.035em] transition-transform duration-500 group-hover:translate-x-1.5">
                      {r.title} <span className="text-muted">·</span> <span className="em">{r.company}</span>
                    </h3>
                    <span className="font-mono text-[12px] text-muted tabular-nums">{r.period}</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-faint">{r.where}{r.current && <span className="ml-3 rounded-full bg-ink px-2 py-0.5 text-bg">Now</span>}</div>
                  <ul className="mt-4 space-y-2">
                    {r.points.map((p) => <li key={p} className="flex gap-3 text-[15px] text-ink-2"><span className="mt-[11px] h-px w-3 shrink-0 bg-faint" />{p}</li>)}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>

          <div className="grid gap-12 md:grid-cols-2 lg:col-span-4 lg:block lg:space-y-12">
            <div>
              <div className="eyebrow mb-5">Education</div>
              <div className="space-y-3">
                {education.map((e) => (
                  <Reveal key={e.school}>
                    <div className="card p-5 transition-transform duration-500 hover:-translate-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-medium tracking-[-0.02em]">{e.degree}</span>
                        <span className="font-mono text-[11px] text-heat">{e.score}</span>
                      </div>
                      <div className="mt-1 text-[13.5px] text-muted">{e.school}</div>
                      <div className="mt-3 font-mono text-[11px] text-faint">{e.period}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <div className="eyebrow mb-5">Toolkit</div>
              <div className="space-y-5">
                {toolkit.map((g) => (
                  <Reveal key={g.group}>
                    <div className="mb-2 font-mono text-[11px] text-faint">{g.group}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((t) => <span key={t} className="cursor-default rounded-full border border-line-2 px-3 py-1 text-[13px] text-ink-2 transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-bg">{t}</span>)}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
