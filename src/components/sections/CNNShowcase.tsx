"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Lines, Reveal } from "@/components/fx/Reveal";
import { CNNCanvas, STAGES } from "@/components/viz/CNNCanvas";

/** Each stage of the forward pass, paired with what Kundan actually does at that layer. */
const steps = [
  { name: "Input", text: "Vision data pipelines — AwA2, CIFAR-10, CUB-200." },
  { name: "Convolve", text: "Building and fine-tuning conv backbones like ResNet." },
  { name: "Pool", text: "Shaping receptive fields and feature resolution." },
  { name: "Compose", text: "Gradient-based filter analysis — what each layer learns." },
  { name: "Dense", text: "Embeddings, heads and transfer learning." },
  { name: "Predict", text: "Predictions that come with an explanation." },
];

/** Pinned, scroll-driven CNN forward pass — the showpiece of the skills section. */
export function CNNShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [stage, setStage] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let s = 0;
    STAGES.forEach((st, i) => { if (v >= st.at) s = i; });
    setStage(s);
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    const y = top + range * (STAGES[i].at + (STAGES[i].end - STAGES[i].at) * 0.85);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section id="skills" className="relative">
      <div ref={ref} className="relative h-[380vh] md:h-[420vh]">
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10">
            <div className="mb-4 grid gap-4 md:mb-8 md:grid-cols-12 md:items-end md:gap-6">
              <div className="md:col-span-7">
                <Reveal y={12}>
                  <div className="eyebrow mb-3 flex items-center gap-3 md:mb-5">
                    <span className="text-ink">02</span><span className="h-px w-10 bg-line-2" />Core skill · Deep learning
                  </div>
                </Reveal>
                <h2 className="text-[clamp(1.9rem,4.6vw,4.2rem)] leading-[0.98] font-medium tracking-[-0.045em]">
                  <Lines lines={[<>Computer vision with</>, <><span className="silver-text">CNNs — </span><span className="em">my core craft.</span></>]} />
                </h2>
              </div>
              <div className="hidden md:col-span-5 md:block">
                <ol className="flex flex-wrap gap-1.5 md:justify-end" aria-label="Network stages">
                  {steps.map((s, i) => (
                    <li key={s.name}>
                      <button onClick={() => jump(i)} className={`relative rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${i === stage ? "border-ink text-bg" : "border-line text-muted hover:border-ink-2 hover:text-ink"}`}>
                        {i === stage && <motion.span layoutId="cnn-stage" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                        <span className="relative">{String(i + 1).padStart(2, "0")} {s.name}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Reveal y={40}>
              <div className="card relative overflow-hidden !rounded-[22px] md:!rounded-[28px]">
                {/* exhibit bar */}
                <div className="relative flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted md:px-6 md:py-3">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5"><span className="absolute h-full w-full animate-ping rounded-full bg-heat opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-heat" /></span>
                    Live · cnn.forward(bird)
                  </span>
                  <span className="tabular-nums text-ink">{String(stage + 1).padStart(2, "0")} {steps[stage].name}</span>
                </div>
                <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 top-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
                <div className="relative mx-auto w-full max-w-[min(100%,calc((100svh-270px)*0.7))] p-2 sm:max-w-none sm:p-3 md:p-6">
                  <CNNCanvas progress={scrollYProgress} />
                </div>
              </div>
            </Reveal>

            <div className="mt-4 flex flex-col gap-3 md:mt-5 md:flex-row md:items-center md:gap-6">
              <div className="flex flex-1 items-center gap-4">
                <span className="font-mono text-[12px] tabular-nums text-muted">{String(stage + 1).padStart(2, "0")} / 06</span>
                <div className="relative h-px flex-1 bg-line">
                  <motion.div className="absolute inset-0 origin-left bg-ink" style={{ scaleX: bar }} />
                </div>
              </div>
              <div className="relative h-6 min-w-0 md:flex-[2]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={stage} className="absolute inset-0 truncate text-[14px] text-ink-2 md:text-[14.5px]"
                    initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <span className="mr-2 text-heat">→</span>{steps[stage].text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
