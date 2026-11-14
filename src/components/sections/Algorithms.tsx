"use client";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { SectionHead, Reveal } from "@/components/fx/Reveal";
import { useThemeColors } from "@/components/fx/useThemeColors";
import {
  BayesViz, ForestViz, KMeansViz, KnnViz, LinearViz, LogisticViz, PcaViz, RagViz, SvmViz, TreeViz, type VizProps,
} from "@/components/viz/algos";

type Algo = { name: string; tag: string; formula: string; Viz: ComponentType<VizProps> };

const algos: Algo[] = [
  { name: "Linear Regression", tag: "Supervised · Regression", formula: "ŷ = wᵀx + b", Viz: LinearViz },
  { name: "Logistic Regression", tag: "Supervised · Classification", formula: "σ(z) = 1 / (1 + e⁻ᶻ)", Viz: LogisticViz },
  { name: "Decision Tree", tag: "Supervised · Trees", formula: "split ← argmin Gini", Viz: TreeViz },
  { name: "Random Forest", tag: "Ensemble · Bagging", formula: "ŷ = mode(T₁ … Tₙ)", Viz: ForestViz },
  { name: "K-Nearest Neighbors", tag: "Instance-based", formula: "k = 5 · majority vote", Viz: KnnViz },
  { name: "Naive Bayes", tag: "Probabilistic", formula: "P(y|x) ∝ P(y)∏P(xᵢ|y)", Viz: BayesViz },
  { name: "Support Vector Machine", tag: "Max-margin", formula: "max 2 / ‖w‖", Viz: SvmViz },
  { name: "K-Means", tag: "Unsupervised · Clustering", formula: "μₖ ← mean(Cₖ)", Viz: KMeansViz },
  { name: "PCA", tag: "Dimensionality reduction", formula: "max Var(Xu), ‖u‖ = 1", Viz: PcaViz },
];

function AlgoCard({ a, i }: { a: Algo; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const c = useThemeColors();
  const { Viz } = a;
  return (
    <Reveal delay={(i % 3) * 0.08}>
      <motion.div ref={ref}
        whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="card group relative flex h-full flex-col overflow-hidden p-4 sm:p-5 transition-colors duration-300 hover:border-line-2">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">{a.tag}</span>
        </div>
        <div className="relative my-4 aspect-[240/150] w-full">
          <div aria-hidden className="dots absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse,black,transparent_70%)]" />
          {c && <Viz play={inView} c={c} />}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <h3 className="text-[19px] leading-tight font-medium tracking-[-0.025em]">{a.name}</h3>
          <span className="shrink-0 font-serif text-[15px] italic text-heat transition-[opacity,translate] duration-500 [@media(hover:hover)]:translate-x-2 [@media(hover:hover)]:opacity-0 group-hover:!translate-x-0 group-hover:!opacity-100">{a.formula}</span>
        </div>
        <span aria-hidden className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)] group-hover:scale-x-100" />
      </motion.div>
    </Reveal>
  );
}

function RagCard() {
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const c = useThemeColors();
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setTall(e.contentRect.width < 520));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <Reveal>
      <div ref={ref} className="card relative grid gap-6 overflow-hidden p-5 sm:p-6 lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Skill · LLMs &amp; retrieval</span>
            <span className="font-mono text-[11px] text-faint">10</span>
          </div>
          <h3 className="mt-4 text-[clamp(1.7rem,3vw,2.6rem)] leading-[1] font-medium tracking-[-0.04em]">
            I build RAG systems that <span className="em">cite</span> their sources.
          </h3>
          <p className="mt-4 max-w-sm text-[15px] text-muted">Chunk, embed, retrieve, ground — shipped fully offline with DeepSeek-R1 and LangChain.</p>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {["LangChain", "LangGraph", "Embeddings", "DeepSeek-R1", "Agents"].map((t) => (
              <span key={t} className="rounded-full bg-bg-2 px-3 py-1 font-mono text-[11px] text-ink-2">{t}</span>
            ))}
          </div>
        </div>
        <div ref={box} className="relative lg:col-span-8">
          <div className="rounded-2xl border border-line bg-bg p-3 sm:p-4">
            {c && <RagViz play={inView} c={c} tall={tall} />}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Algorithms() {
  return (
    <section id="algorithms" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10">
        <SectionHead
          index="03"
          eyebrow="Skills · Machine learning"
          title={[<>Models I know</>, <><span className="em">inside out.</span></>]}
          aside={<>The supervised, unsupervised and probabilistic methods I reach for to predict, classify and find structure in data. Each one runs on its real maths — hover to see the idea.</>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {algos.map((a, i) => <AlgoCard key={a.name} a={a} i={i} />)}
        </div>
        <div className="mt-4"><RagCard /></div>
      </div>
    </section>
  );
}
