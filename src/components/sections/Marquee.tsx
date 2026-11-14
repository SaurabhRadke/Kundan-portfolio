const items = ["Convolutional Neural Networks", "RAG", "LangGraph Agents", "Attention & Transformers", "CLIP", "scikit-learn", "PyTorch", "Docker · AWS", "SQL", "Explainable AI"];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden>
      <div className="marquee flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-[clamp(1.4rem,2.4vw,2.2rem)] font-medium tracking-[-0.03em] text-ink-2">
            {i % 3 === 1 ? <span className="em text-muted">{t}</span> : t}
            <span className="h-2 w-2 rotate-45 bg-silver" />
          </span>
        ))}
      </div>
    </div>
  );
}
