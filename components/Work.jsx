"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { work } from "@/lib/data";

const ease = [0.16, 1, 0.3, 1];

const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function Tags({ tags, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full border border-line bg-white/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function Work() {
  const [hovered, setHovered] = useState(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 26 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 26 });
  const item = hovered != null ? work[hovered] : null;

  return (
    <section id="work" className="relative z-10 px-4 py-24 sm:px-6 sm:py-36 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-mute sm:mb-14 sm:text-[11px]">
          <span>( 02 )</span>
          <span className="hairline h-px flex-1" />
          <span>Selected work</span>
        </div>

        <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 md:flex-row md:items-end">
          <h2 className="font-display text-[clamp(2.6rem,8vw,7rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]">
            Shipped
            <br />
            <span className="font-serif font-normal normal-case italic tracking-[-0.02em] text-bone/80">
              & still running
            </span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-mute">
            Award-winning agentic AI builds from IIT Gandhinagar and SIH, plus four client
            platforms running on real traffic.
          </p>
        </div>

        <ul
          onPointerMove={(e) => {
            x.set(e.clientX);
            y.set(e.clientY);
          }}
          onPointerLeave={() => setHovered(null)}
          className="border-t border-line"
        >
          {work.map((w, i) => (
            <motion.li
              key={w.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.9, ease, delay: i * 0.05 }}
              className="border-b border-line"
            >
              <a
                href={w.href}
                target="_blank"
                rel="noreferrer"
                onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(i)}
                className="group relative flex items-center gap-4 py-6 sm:gap-8 sm:py-8"
              >
                <span className="pointer-events-none absolute inset-x-[-1rem] inset-y-1 origin-bottom scale-y-0 rounded-2xl bg-white/70 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-y-100" />

                <span className="relative w-7 shrink-0 self-start pt-2 font-mono text-[11px] text-mute sm:w-10 sm:pt-3">
                  {w.index}
                </span>

                <div className="relative min-w-0 flex-1">
                  <h3 className="font-display text-[clamp(1.5rem,4.2vw,3.2rem)] font-bold leading-none tracking-[-0.03em] transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-2">
                    {w.title}
                  </h3>
                  <p className="mt-2 font-serif text-base italic text-bone/60 sm:text-lg">{w.kind}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-mute lg:hidden">
                    {w.meta}
                  </p>
                  <Tags tags={w.tags} className="mt-4 md:hidden" />
                </div>

                <Tags tags={w.tags} className="relative hidden w-[28%] justify-end md:flex" />

                <span className="relative hidden w-56 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-mute lg:block">
                  {w.meta}
                </span>

                <span className="relative grid h-11 w-11 shrink-0 place-items-center self-start rounded-full border border-line bg-white/40 transition-all duration-500 group-hover:-rotate-45 group-hover:border-bone group-hover:bg-bone group-hover:text-ink sm:h-12 sm:w-12 md:self-center">
                  →
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* cursor-following glass preview (fine pointers only) */}
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="cursor-only pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
      >
        <AnimatePresence>
          {item && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              exit={{ opacity: 0, scale: 0.6, rotate: -8 }}
              transition={{ duration: 0.45, ease }}
              className="glass -translate-x-1/2 -translate-y-[115%] overflow-hidden rounded-2xl"
            >
              <div className="relative h-40 w-64 p-5">
                <div className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(115deg,rgba(0,0,0,.06)_0_1px,transparent_1px_12px)]" />
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={item.title}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="relative flex h-full flex-col justify-between"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{item.meta}</span>
                    <div>
                      <p className="font-serif text-3xl italic leading-none">{item.title}</p>
                      <p className="mt-2 truncate font-mono text-[10px] text-bone/60">{host(item.href)}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
