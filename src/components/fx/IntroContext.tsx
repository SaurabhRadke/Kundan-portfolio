"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const Ctx = createContext<{ done: boolean; finish: () => void }>({ done: true, finish: () => {} });

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);
  return <Ctx.Provider value={{ done, finish }}>{children}</Ctx.Provider>;
}
export const useIntro = () => useContext(Ctx);
