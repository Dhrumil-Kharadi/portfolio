"use client";

import { Fragment, useEffect, useState } from "react";
import { motion } from "motion/react";

const stages = ["commit", "build", "test", "deploy", "live"];
const STEP_MS = 750;
const HOLD_MS = 2600;

// A looping CI/CD run: each stage goes pending → running → passed,
// connectors fill as the run moves forward, then it holds on "live".
export default function Pipeline({ ready = true }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => setStep(stages.length), 0);
      return () => clearTimeout(id);
    }
    const done = step >= stages.length;
    const id = setTimeout(
      () => {
        if (done) {
          setStep(0);
        } else {
          setStep((s) => s + 1);
        }
      },
      done ? HOLD_MS : STEP_MS
    );
    return () => clearTimeout(id);
  }, [step, ready]);

  const finished = step >= stages.length;

  return (
    <div
      role="status"
      aria-label="Deployment pipeline: commit, build, test, deploy, live"
      className="glass flex w-full items-center gap-3 rounded-2xl px-4 py-3 sm:inline-flex sm:w-auto sm:rounded-full sm:py-2 sm:pl-4 sm:pr-4"
    >
      <ol className="flex min-w-0 flex-1 items-start gap-1.5 sm:flex-none sm:items-center sm:gap-2">
        {stages.map((s, i) => {
          const state = i < step ? "done" : i === step ? "running" : "pending";
          return (
            <Fragment key={s}>
              {i > 0 && (
                <li aria-hidden className="relative mt-[7px] h-px min-w-2 flex-1 overflow-hidden bg-line sm:mt-0 sm:w-6 sm:flex-none">
                  <motion.span
                    className="absolute inset-0 origin-left bg-bone"
                    initial={false}
                    animate={{ scaleX: i <= step ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                </li>
              )}
              <li className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row">
                <span className="relative grid h-3.5 w-3.5 place-items-center">
                  {state === "running" && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-bone/30" />
                  )}
                  <span
                    className={`relative grid h-3.5 w-3.5 place-items-center rounded-full border transition-colors duration-300 ${
                      state === "pending" ? "border-bone/25 bg-transparent" : "border-bone bg-bone"
                    }`}
                  >
                    {state === "done" && (
                      <svg viewBox="0 0 12 12" className="h-2 w-2 text-ink" aria-hidden>
                        <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {state === "running" && <span className="h-1 w-1 rounded-full bg-ink" />}
                  </span>
                </span>
                <span
                  className={`font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors duration-300 sm:text-[10px] sm:tracking-[0.16em] ${
                    state === "pending" ? "text-bone/35" : "text-bone"
                  }`}
                >
                  {s}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>

      <span
        className={`hidden shrink-0 border-l border-line pl-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity duration-500 md:inline ${
          finished ? "opacity-100" : "opacity-40"
        }`}
      >
        {finished ? "prod · healthy" : "deploying…"}
      </span>
    </div>
  );
}
