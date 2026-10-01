"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { navLinks, profile } from "@/lib/data";
import { useLenis } from "lenis/react";

const ease = [0.16, 1, 0.3, 1];

function Monogram() {
  return (
    <span className="glass grid h-9 w-9 place-items-center rounded-full">
      <span className="font-display text-[13px] font-bold tracking-tight">DK</span>
    </span>
  );
}

export default function Navbar() {
  const [active, setActive] = useState("#home");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();

  // only touch React state when a threshold actually flips, not every scroll tick
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const nextScrolled = y > 24;
    if (Math.abs(y - prev) < 2) return;
    const nextHidden = y > prev && y > 420 && !open;
    setScrolled((v) => (v === nextScrolled ? v : nextScrolled));
    setHidden((v) => (v === nextHidden ? v : nextHidden));
  });

  // Track which section is on screen for the sliding indicator.
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (lenis) lenis.scrollTo(href, { offset: 0, duration: 1.6 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6"
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pl-2 pr-2 transition-[background,box-shadow,padding] duration-500 sm:pl-3 ${
            scrolled ? "glass glass-strong" : ""
          }`}
        >
          <a
            href="#home"
            onClick={(e) => go(e, "#home")}
            className="group flex items-center gap-3"
            aria-label="Dhrumil Kharadi - home"
          >
            <Monogram />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[13px] font-semibold tracking-tight">
                {profile.name}
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                DevOps · Full-Stack
              </span>
            </span>
          </a>

          <ul className="glass hidden items-center gap-1 rounded-full p-1 md:flex">
            {navLinks.map((l) => (
              <li key={l.href} className="relative">
                {active === l.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-bone"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className={`relative z-10 block rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    active === l.href ? "text-ink" : "text-bone/70 hover:text-bone"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              className="group relative hidden overflow-hidden rounded-full bg-bone px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink sm:inline-flex"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                Contact me
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="glass relative grid h-11 w-11 place-items-center rounded-full md:hidden"
            >
              <span
                className={`absolute h-px w-4 bg-bone transition-transform duration-500 ease-[var(--ease-out)] ${
                  open ? "rotate-45" : "-translate-y-[3px]"
                }`}
              />
              <span
                className={`absolute h-px w-4 bg-bone transition-transform duration-500 ease-[var(--ease-out)] ${
                  open ? "-rotate-45" : "translate-y-[3px]"
                }`}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/*
        Mobile menu: a screen-sized paper curtain that slides down (translate only,
        like the intro), then the links rise in. Deliberately avoided, because each
        flickered on phones: clip-path + backdrop-blur repainting the whole screen,
        a huge scaled circle layer, and locking scroll with overflow:hidden (which
        makes iOS resize the viewport). Touch scrolling is contained on the panel
        instead, so the page underneath never changes.
      */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 touch-none overscroll-none md:hidden"
          >
            <motion.div
              aria-hidden
              variants={{
                open: { y: "0%", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } },
                closed: { y: "-100%", transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.1 } },
              }}
              className="absolute inset-0 bg-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] will-change-transform"
            />

            <motion.div
              variants={{
                open: { opacity: 1, transition: { duration: 0.25, delay: 0.3 } },
                closed: { opacity: 0, transition: { duration: 0.18 } },
              }}
              className="relative flex h-full flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-28"
            >
              <ul className="flex flex-1 flex-col justify-center gap-2">
                {navLinks.map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <motion.a
                      href={l.href}
                      onClick={(e) => go(e, l.href)}
                      variants={{
                        open: { y: 0, transition: { duration: 0.6, ease, delay: 0.32 + i * 0.05 } },
                        closed: { y: "110%", transition: { duration: 0.2 } },
                      }}
                      className="flex items-baseline gap-4 py-1 will-change-transform"
                    >
                      <span className="font-mono text-xs text-mute">0{i + 1}</span>
                      <span
                        className={`font-display text-[13vw] font-bold leading-[1.05] tracking-tight ${
                          active === l.href ? "text-bone" : "text-outline"
                        }`}
                      >
                        {l.label}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 0.5 } },
                  closed: { opacity: 0, y: 12, transition: { duration: 0.15 } },
                }}
                className="flex flex-col gap-4 border-t border-line pt-6"
              >
              <a href={`mailto:${profile.email}`} className="font-serif text-2xl italic">
                {profile.email}
              </a>
              <div className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                <a href={profile.github} target="_blank" rel="noreferrer" className="glass rounded-full px-4 py-2.5">
                  GitHub ↗
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="glass rounded-full px-4 py-2.5">
                  LinkedIn ↗
                </a>
              </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
