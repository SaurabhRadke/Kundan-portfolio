"use client";
import { CountUp } from "@/components/fx/CountUp";
import { Lines, Reveal } from "@/components/fx/Reveal";
import { stats } from "@/content/site";

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <Reveal y={12}>
          <div className="eyebrow mb-8 flex items-center gap-3 md:mb-10"><span className="text-ink">01</span><span className="h-px w-10 bg-line-2" />About me</div>
        </Reveal>
        <p className="max-w-[1150px] text-[clamp(1.75rem,3.6vw,3.3rem)] leading-[1.08] font-medium tracking-[-0.035em]">
          <Lines stagger={0.06} lines={[
            <>I&apos;m Kundan — an ML engineer at <span className="em">Caterpillar.</span></>,
            <span key="2" className="text-muted">Civil engineer turned data scientist at IIT Palakkad,</span>,
            <span key="3" className="text-muted">I build models that perform — then make them <span className="em text-ink">explain</span> themselves.</span>,
          ]} />
        </p>
        <div className="mt-14 grid grid-cols-2 md:mt-20 gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="h-full">
              <div className="group h-full bg-surface p-5 transition-colors duration-500 hover:bg-bg-2 sm:p-6 md:p-8">
                <div className="text-[clamp(2rem,3.6vw,3.2rem)] leading-none font-medium tracking-[-0.05em] tabular-nums">
                  <CountUp value={s.value} decimals={s.decimals} />
                </div>
                <p className="mt-3 text-[12.5px] leading-snug text-muted sm:mt-4 sm:text-[13.5px]">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
