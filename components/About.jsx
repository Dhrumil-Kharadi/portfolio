"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { profile } from "@/lib/data";

const ease = [0.16, 1, 0.3, 1];

const capabilities = [
  { k: "Containers", v: "Docker, Kubernetes, multi-stage images, compose stacks." },
  { k: "Pipelines", v: "GitHub Actions CI/CD from commit to production." },
  { k: "Edge & traffic", v: "Nginx, load balancing, CDN, DNS, TLS." },
  { k: "Backend", v: "Node.js, FastAPI, REST, Kafka, middleware design." },
  { k: "Product", v: "Next.js and React interfaces that convert." },
  { k: "Agentic AI", v: "LangChain, LangGraph, RAG and MCP in production." },
];

// Each word lights up as it scrolls through the viewport.
function Word({ children, progress, range }) {
  // opacity only: animating a blur filter per word repaints on every scroll frame
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

function Statement({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p
      ref={ref}
      className="font-display text-[clamp(1.6rem,4.4vw,3.6rem)] font-semibold leading-[1.12] tracking-[-0.025em]"
    >
      {words.map((w, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const serif = /agentic|alive|brain/i.test(w);
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {serif ? <span className="font-serif font-normal italic">{w}</span> : w}
          </Word>
        );
      })}
    </p>
  );
}

export default function About() {
  return (
    <section id="about" className="relative z-10 px-4 py-28 sm:px-6 sm:py-40 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-mute sm:mb-14 sm:text-[11px]">
          <span>( 01 )</span>
          <span className="hairline h-px flex-1" />
          <span>About</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_2.4fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, ease }}
            className="flex flex-col gap-5"
          >
            <span className="font-serif text-3xl italic text-bone/80">Engineer of uptime.</span>
            <p className="max-w-xs text-sm leading-relaxed text-mute">
              ICT undergrad at VGEC Ahmedabad (CGPA 8.15), one year freelancing on live
              production systems, four national-level hackathon podiums.
            </p>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              <span className="border-b border-bone/40 pb-0.5 transition-colors group-hover:border-bone">
                LinkedIn profile
              </span>
              <span className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          </motion.div>

          <Statement text={profile.summary} />
        </div>

        {/* hairline capability grid */}
        <ul className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)] sm:mt-28 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <motion.li
              key={c.k}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease, delay: (i % 3) * 0.08 }}
              className="group relative bg-white/75 p-6 transition-colors duration-500 hover:bg-white/95 sm:p-8"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white font-mono text-[11px] text-bone/80 transition-colors duration-500 group-hover:bg-bone group-hover:text-ink">
                  0{i + 1}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  in production
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight">{c.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{c.v}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
