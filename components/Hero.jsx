"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { profile, stats } from "@/lib/data";
import { useIntro } from "./IntroProvider";
import TiltCard from "./TiltCard";
import Pipeline from "./Pipeline";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const ease = [0.16, 1, 0.3, 1];

function SplitWord({ text, delay = 0, ready }) {
  return (
    <span className="inline-flex overflow-hidden pb-[0.08em]" aria-hidden>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          initial={{ y: "110%", rotate: 8 }}
          animate={ready ? { y: "0%", rotate: 0 } : undefined}
          transition={{ duration: 1.2, ease, delay: delay + i * 0.045 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function Reveal({ children, delay = 0, ready, className = "", y = 24 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
      transition={{ duration: 1.1, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const { ready } = useIntro();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-4 pb-6 pt-24 sm:px-6 sm:pt-28 lg:px-10"
    >
      <h1 className="sr-only">
        {profile.name} — {profile.role}
      </h1>

      {/* faint blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_30%,transparent_80%)]"
      />

      {/* meta row */}
      <div className="mx-auto hidden w-full max-w-7xl justify-end font-mono text-[11px] uppercase tracking-[0.22em] text-mute sm:flex">
        <Reveal ready={ready} delay={0.3} y={10} className="text-right">
          {profile.location}
        </Reveal>
      </div>

      {/* headline */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center py-8 sm:py-6">
        <Reveal ready={ready} delay={0.05} y={12} className="mb-6 sm:mb-8">
          <Pipeline ready={ready} />
        </Reveal>

        <div className="font-display text-[clamp(2.7rem,11.2vw,10.75rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.045em]">
          <SplitWord text={profile.first} ready={ready} delay={0.15} />
        </div>
        <div className="font-serif text-[clamp(3.3rem,11.5vw,11rem)] italic leading-[0.92] tracking-[-0.02em] sm:pl-[8vw]">
          <SplitWord text={profile.last} ready={ready} delay={0.45} />
        </div>

        {/* 3D anomalous matter — in flow on phones, full backdrop from sm up */}
        <motion.div
          aria-hidden
          style={{ y: sceneY, scale: sceneScale, opacity: sceneOpacity }}
          className="pointer-events-none relative -z-10 -mx-4 -my-6 h-[44svh] sm:absolute sm:inset-x-0 sm:top-0 sm:bottom-[8%] sm:m-0 sm:h-auto"
        >
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={ready ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 2, ease, delay: 0.2 }}
          >
            <HeroScene />
          </motion.div>
        </motion.div>

        <Reveal
          ready={ready}
          delay={1.15}
          className="mt-8 flex flex-col gap-6 sm:mt-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="glass max-w-md rounded-2xl p-4 sm:p-5">
            <p className="font-display text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              DevOps Engineer
              <span className="font-serif text-xl font-normal italic text-mute sm:text-2xl"> & </span>
              Full-Stack Developer
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-bone/70 sm:text-[15px]">
              I ship production systems and keep them alive under live traffic - from{" "}
              <span className="font-semibold text-bone">containers & pipelines</span> to{" "}
              <span className="font-serif text-lg italic text-bone">agentic AI</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-3 rounded-full bg-bone py-3 pl-6 pr-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]"
            >
              Selected work
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:-rotate-45">
                →
              </span>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-white"
            >
              GitHub <span aria-hidden>↗</span>
            </a>
          </div>
        </Reveal>
      </div>

      {/* stats */}
      <div className="mx-auto w-full max-w-7xl">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: 1.3 + i * 0.08 }}
            >
              <TiltCard className="rounded-2xl p-4 sm:p-5">
                <div className="flex h-full flex-col justify-between gap-5">
                  <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-mute sm:text-[10px]">
                    <span>0{i + 1}</span>
                    <span className="truncate">{s.sub}</span>
                  </div>
                  <div>
                    <div className="text-chrome font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                      {s.value}
                    </div>
                    <div className="mt-2 text-[12px] leading-snug text-bone/70 sm:text-[13px]">{s.label}</div>
                  </div>
                </div>
              </TiltCard>
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
          <span className="flex items-center gap-3">
            <span className="relative block h-8 w-px overflow-hidden bg-line">
              <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-bone" />
            </span>
            Scroll
          </span>
          <span>Portfolio · 2026</span>
        </div>
      </div>
    </section>
  );
}
