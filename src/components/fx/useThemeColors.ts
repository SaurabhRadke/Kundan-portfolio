"use client";
import { useEffect, useState } from "react";

export type Palette = { bg: string; surface: string; ink: string; ink2: string; muted: string; faint: string; line: string; silver: string; accent: string; heat: string; heatSoft: string };

const read = (): Palette => {
  const s = getComputedStyle(document.documentElement);
  const g = (n: string) => s.getPropertyValue(n).trim();
  return { bg: g("--bg"), surface: g("--surface"), ink: g("--ink"), ink2: g("--ink-2"), muted: g("--muted"), faint: g("--faint"), line: g("--line"), silver: g("--silver"), accent: g("--accent"), heat: g("--heat"), heatSoft: g("--heat-soft") };
};

/** Live CSS-token colours for canvas drawing; refreshes on theme change. */
export function useThemeColors() {
  const [p, setP] = useState<Palette | null>(null);
  useEffect(() => {
    const up = () => setP(read());
    up();
    window.addEventListener("themechange", up);
    return () => window.removeEventListener("themechange", up);
  }, []);
  return p;
}
