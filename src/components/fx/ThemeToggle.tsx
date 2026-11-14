"use client";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => { window.addEventListener("themechange", cb); return () => window.removeEventListener("themechange", cb); };
const isDark = () => document.documentElement.dataset.theme === "dark";

/** Light/dark switch: the new theme expands as a circle from the button (View Transitions API). */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = dark ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch {}
      window.dispatchEvent(new Event("themechange"));
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("theme-anim");
      apply();
      setTimeout(() => document.documentElement.classList.remove("theme-anim"), 500);
      return;
    }
    const { clientX: x, clientY: y } = e;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] transition-transform duration-700 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" />
      </svg>
    </button>
  );
}
