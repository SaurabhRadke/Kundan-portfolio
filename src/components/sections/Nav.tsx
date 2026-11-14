"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useIntro } from "@/components/fx/IntroContext";
import { Roll } from "@/components/fx/Roll";
import { ThemeToggle } from "@/components/fx/ThemeToggle";
import { site } from "@/content/site";

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

/** Floating header: monogram · centred pill with sliding active marker · theme + CTA. Hides on scroll down. */
export function Nav() {
  const { done } = useIntro();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (Math.abs(y - last) > 6) { setHidden(y > last && y > 500); last = y; }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = links.map((l) => document.querySelector<HTMLElement>(l.href)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (menu) window.__lenis?.stop(); else window.__lenis?.start();
  }, [menu]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
        initial={{ y: -90, opacity: 0 }}
        animate={done ? { y: hidden && !menu ? -100 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: done && !scrolled ? 0.5 : 0 }}
      >
        <div className={`mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-full border px-2 py-2 pl-3 transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled || menu ? "border-line bg-[color-mix(in_srgb,var(--bg)_75%,transparent)] shadow-[0_10px_30px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl" : "border-transparent"
        }`}>
          <a href="#top" onClick={() => setMenu(false)} className="group flex items-center gap-3" aria-label="Home">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-ink font-mono text-[11.5px] font-medium tracking-tight text-bg">
              <span className="transition-transform duration-500 group-hover:-translate-y-8">{site.initials}</span>
              <span className="absolute translate-y-8 transition-transform duration-500 group-hover:translate-y-0">↑</span>
            </span>
            <span className="hidden text-[14px] leading-tight font-medium tracking-[-0.01em] sm:block">
              {site.name}
              <span className="block font-mono text-[10.5px] tracking-wide text-muted">ML ENGINEER</span>
            </span>
          </a>

          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul onPointerLeave={() => setHovered(null)} className="flex items-center gap-0.5 rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-1 backdrop-blur">
              {links.map((l) => (
                <li key={l.href} className="relative" onPointerEnter={() => setHovered(l.href)}>
                  {hovered === l.href && active !== l.href && (
                    <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-bg-2" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  {active === l.href && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  <a href={l.href} className={`relative block rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors ${active === l.href ? "text-bg" : "text-ink-2 hover:text-ink"}`}>
                    <Roll>{l.label}</Roll>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <span className="mr-2 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted xl:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-heat opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-heat" />
              </span>
              @ Caterpillar
            </span>
            <ThemeToggle />
            <a href="/Kundan_Mourya_Resume.pdf" target="_blank" rel="noreferrer" className="group btn btn-ink hidden !py-[0.72rem] sm:inline-flex">
              <Roll>Résumé</Roll>
              <span aria-hidden className="transition-transform duration-500 group-hover:-rotate-45">→</span>
            </a>
            <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line lg:hidden">
              <span className={`h-px w-4 bg-ink transition ${menu ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`h-px w-4 bg-ink transition ${menu ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div className="fixed inset-0 z-40 flex flex-col justify-between bg-bg px-6 pt-28 pb-8 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}>
            <ul className="space-y-1">
              {links.map((l, i) => (
                <motion.li key={l.href} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}>
                  <a href={l.href} onClick={() => setMenu(false)} className="flex items-baseline gap-4 py-1 text-5xl font-medium tracking-[-0.045em]">
                    <span className="eyebrow w-6">0{i + 1}</span>{l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="space-y-5">
              <a href="/Kundan_Mourya_Resume.pdf" className="btn btn-ink w-full justify-center !py-4">Download résumé</a>
              <a href={`mailto:${site.email}`} className="block text-center text-[14px] text-muted">{site.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
