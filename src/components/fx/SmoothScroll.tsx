"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useIntro } from "./IntroContext";

declare global { interface Window { __lenis?: Lenis } }

/** Lenis smooth scroll; locked until the preloader finishes; anchor links glide. */
export function SmoothScroll() {
  const { done } = useIntro();
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      anchors: { offset: -20, duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) },
      autoRaf: true,
    });
    ref.current = lenis;
    window.__lenis = lenis;
    lenis.stop();
    return () => { lenis.destroy(); ref.current = null; delete window.__lenis; };
  }, []);

  useEffect(() => { if (done) ref.current?.start(); }, [done]);
  return null;
}
