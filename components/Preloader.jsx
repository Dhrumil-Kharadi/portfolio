"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useIntro } from "./IntroProvider";

const ease = [0.16, 1, 0.3, 1];
const curtain = [0.76, 0, 0.24, 1];
const HOLD_MS = 2000;

const log = [
  { at: 0, text: "$ git push origin main" },
  { at: 22, text: "→ docker build · layers cached" },
  { at: 48, text: "→ tests passed · 0 failing" },
  { at: 72, text: "→ rolling out to production" },
  { at: 96, text: "✓ live · all systems healthy" },
];

// CSS keyframes run on the compositor, so the reveal stays smooth even while
// the 3D scene compiles its shaders on the main thread underneath.
function Rise({ children, delay = 0, className = "" }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <span className="intro-rise block will-change-transform" style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

export default function Preloader() {
  const { setReady } = useIntro();
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);
  const lenis = useLenis();

  // hold the page still under the intro
  useEffect(() => {
    if (!lenis) return;
    if (show) lenis.stop();
    else lenis.start();
  }, [lenis, show]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => {
        setShow(false);
        setReady(true);
      }, 0);
      return () => clearTimeout(id);
    }

    document.documentElement.style.overflow = "hidden";
    // Timer-driven (not rAF) so the intro still completes in throttled tabs.
    const start = performance.now();
    const countFor = 1650;
    const timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / countFor);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setCount(Math.round(e * 100));
      if (p >= 1) clearInterval(timer);
    }, 33);
    const done = setTimeout(() => {
      document.documentElement.style.overflow = "";
      setShow(false);
      setReady(true);
    }, HOLD_MS);

    return () => {
      clearInterval(timer);
      clearTimeout(done);
      document.documentElement.style.overflow = "";
    };
  }, [setReady]);

  const line = [...log].reverse().find((l) => count >= l.at) ?? log[0];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          aria-live="polite"
          aria-label={`Loading ${count}%`}
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: curtain }}
          className="fixed inset-0 z-[100] flex flex-col bg-ink will-change-transform px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10 sm:py-8"
        >
          {/* soft smoke glow behind the name */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.05),transparent)]"
          />

          <motion.div
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            className="relative flex h-full flex-col"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
              <span className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-line font-display text-[11px] font-bold tracking-tight text-bone">
                  DK
                </span>
                <span className="hidden sm:inline">DevOps · Full-Stack</span>
              </span>
              <span>Portfolio © 2026</span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Rise className="font-display text-[clamp(2.6rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.045em]">
                Dhrumil
              </Rise>
              <Rise
                delay={0.12}
                className="font-serif text-[clamp(2.6rem,9.5vw,7rem)] italic leading-[1] tracking-[-0.02em]"
              >
                Kharadi
              </Rise>

              <div className="mt-8 h-5 overflow-hidden font-mono text-[11px] text-bone/70 sm:text-xs">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={line.text}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    {line.text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
                  {count < 100 ? "Deploying" : "Ready"}
                </span>
                <span className="font-display text-[clamp(3.5rem,12vw,8rem)] font-extrabold leading-[0.8] tracking-[-0.05em] tabular-nums">
                  {count}
                  <span className="align-top text-[0.35em] text-mute">%</span>
                </span>
              </div>
              <div className="mt-5 h-px w-full bg-line">
                <div className="intro-bar h-full bg-bone" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
