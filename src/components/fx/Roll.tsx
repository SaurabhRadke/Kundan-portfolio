import type { ReactNode } from "react";

/** Text-roll hover label: text slides up, an identical copy rolls in from below. */
export function Roll({ children, className }: { children: string; className?: string }): ReactNode {
  return (
    <span className={`roll ${className ?? ""}`}>
      <span className="roll-inner" data-text={children}>{children}</span>
    </span>
  );
}
