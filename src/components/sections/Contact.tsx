"use client";
import { useState } from "react";
import { Magnetic } from "@/components/fx/Magnetic";
import { Lines, Reveal } from "@/components/fx/Reveal";
import { Roll } from "@/components/fx/Roll";
import { site } from "@/content/site";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <section id="contact" className="relative overflow-hidden pt-24 md:pt-40">
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_50%_40%,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
        <Reveal y={12}><div className="eyebrow mb-10 flex items-center gap-3"><span className="text-ink">06</span><span className="h-px w-10 bg-line-2" />Contact</div></Reveal>
        <h2 className="text-[clamp(3rem,9vw,9rem)] leading-[0.9] font-medium tracking-[-0.055em]">
          <Lines lines={[<>Let&apos;s build</>, <>something that <span className="em text-heat">learns.</span></>]} />
        </h2>
        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a href={`mailto:${site.email}`} className="group btn btn-ink !px-6 !py-4 !text-[15px] sm:!px-7 sm:!py-5 sm:!text-[16px]">
                <Roll>{site.email}</Roll>
                <span aria-hidden className="transition-transform duration-500 group-hover:-rotate-45">→</span>
              </a>
            </Magnetic>
            <button onClick={copy} className="btn btn-line !py-4 sm:!py-5"><Roll>{copied ? "Copied ✓" : "Copy email"}</Roll></button>
            <a href="/Kundan_Mourya_Resume.pdf" target="_blank" rel="noreferrer" className="btn btn-line !py-4 sm:!py-5"><Roll>Résumé (PDF)</Roll></a>
          </div>
        </Reveal>
      </div>

      <footer className="relative mx-auto mt-32 max-w-[1400px] px-5 pb-8 md:px-10">
        <div className="flex flex-col justify-between gap-4 border-t border-line pt-6 font-mono text-[11.5px] text-muted md:flex-row">
          <span>© 2026 {site.name}</span>
          <span>Machine Learning · Computer Vision · LLM Systems</span>
          <a href="#top" className="link-u w-fit text-ink">Back to top ↑</a>
        </div>
        <div aria-hidden className="pointer-events-none mt-10 select-none text-center text-[clamp(4rem,17vw,16rem)] leading-[0.8] font-medium tracking-[-0.07em] text-transparent [-webkit-text-stroke:1px_var(--line-2)]">
          K. Mourya
        </div>
      </footer>
    </section>
  );
}
