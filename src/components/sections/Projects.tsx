"use client";
import { motion, useInView } from "motion/react";
import { useRef, type ComponentType, type PointerEvent } from "react";
import { CountUp } from "@/components/fx/CountUp";
import { Reveal, SectionHead } from "@/components/fx/Reveal";
import { useThemeColors } from "@/components/fx/useThemeColors";
import type { VizProps } from "@/components/viz/algos";
import { HiringViz, MemeViz, PrivateRagViz, SegmentViz } from "@/components/viz/projectViz";
import { SemanticAttention } from "@/components/viz/SemanticAttention";
import { featured, projects, type Project } from "@/content/site";

const vizFor: Record<string, ComponentType<VizProps>> = { segmentation: SegmentViz, hiring: HiringViz, meme: MemeViz, rag: PrivateRagViz };

/** Cursor spotlight on cards (silver glow follows pointer). */
const spot = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};
const spotBg = "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--mx)_var(--my),color-mix(in_srgb,var(--silver)_28%,transparent),transparent_65%)]";

function Featured() {
  return (
    <Reveal>
      <article onPointerMove={spot} className="card group relative overflow-hidden !rounded-[22px] p-5 sm:p-7 md:!rounded-[28px] lg:p-10">
        <div aria-hidden className={spotBg} />
        <div className="relative grid gap-10 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-ink px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-bg">My research</span>
              <span className="font-mono text-[11px] text-muted">{featured.kind}</span>
            </div>
            <h3 className="mt-6 text-[clamp(2rem,3.6vw,3.3rem)] leading-[0.98] font-medium tracking-[-0.045em]">
              Interpreting CNNs with <span className="em text-heat">Semantic</span> Attention
            </h3>
            <p className="mt-5 text-[17px] text-ink-2"><span className="em text-[1.15em]">“</span>{featured.problem}<span className="em text-[1.15em]">”</span></p>
            <ul className="mt-6 space-y-3">
              {featured.points.map((p) => (
                <li key={p} className="flex gap-3 text-[14.5px] leading-relaxed text-muted"><span className="mt-[9px] h-px w-4 shrink-0 bg-ink-2" />{p}</li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-end gap-x-6 gap-y-4 pt-8">
              <div>
                <div className="text-[clamp(3.4rem,6vw,5rem)] leading-none font-medium tracking-[-0.06em] tabular-nums"><CountUp value={0.82} decimals={2} /></div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">{featured.metric?.label}</div>
              </div>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {featured.stack.map((s) => <span key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] text-ink-2">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[18px] border border-line bg-bg p-3 sm:p-5 md:p-6">
              <SemanticAttention />
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const c = useThemeColors();
  const Viz = vizFor[p.id];
  return (
    <Reveal delay={(i % 2) * 0.1} className="h-full">
      <motion.article ref={ref} onPointerMove={spot} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="card group relative flex h-full flex-col overflow-hidden p-5 sm:p-6 md:p-7">
        <div aria-hidden className={spotBg} />
        <div className="relative flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{p.kind}</span>
          <span className="font-mono text-[11px] text-faint">0{i + 2}</span>
        </div>
        <div className="relative my-6 aspect-[320/140] w-full rounded-2xl border border-line bg-bg p-2">
          {c && Viz && <Viz play={inView} c={c} />}
        </div>
        <h3 className="relative text-[22px] leading-tight sm:text-[26px] font-medium tracking-[-0.035em]">{p.title}</h3>
        <p className="relative mt-2 text-[15px] text-muted">{p.problem}</p>
        <div className="relative grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
          <ul className="overflow-hidden">
            {p.points.map((pt) => <li key={pt} className="flex gap-3 pt-3 text-[14px] text-ink-2"><span className="mt-[9px] h-px w-3 shrink-0 bg-heat" />{pt}</li>)}
          </ul>
        </div>
        <div className="relative mt-auto flex items-end justify-between gap-4 border-t border-line pt-5 mt-6">
          <div>
            <div className="text-[28px] leading-none font-medium tracking-[-0.04em]">{p.metric?.value}</div>
            <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-wider text-muted">{p.metric?.label}</div>
          </div>
          <div className="flex max-w-[60%] flex-wrap justify-end gap-1.5">
            {p.stack.slice(0, 4).map((s) => <span key={s} className="rounded-full bg-bg-2 px-2.5 py-1 font-mono text-[10.5px] text-ink-2">{s}</span>)}
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="work" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10">
        <SectionHead index="04" eyebrow="Selected work" title={[<>Things I&apos;ve</>, <><span className="em">built</span> <span className="silver-text">&amp; researched.</span></>]}
          aside={<>My research at IIT Palakkad and the systems I&apos;ve shipped end-to-end — vision, multimodal models and agentic LLMs.</>} />
        <Featured />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}
