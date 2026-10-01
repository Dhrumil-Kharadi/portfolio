"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { music, navLinks, profile } from "@/lib/data";

const ease = [0.16, 1, 0.3, 1];

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time || "--:--:--"}</span>;
}

export default function Footer() {
  const lenis = useLenis();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const go = (e, href) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(href, { duration: 1.6 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const socials = [
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Email", href: `mailto:${profile.email}` },
  ];

  return (
    <footer id="contact" className="relative z-10 overflow-hidden px-4 pt-24 sm:px-6 sm:pt-36 lg:px-10">
      {/* top light seam */}
      <div className="hairline absolute inset-x-0 top-0 h-px" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_70%)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-mute sm:text-[11px]">
          <span>( 03 )</span>
          <span className="hairline h-px flex-1" />
          <span>Contact</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, ease }}
          className="font-display text-[clamp(2.4rem,7.5vw,6.8rem)] font-extrabold leading-[0.95] tracking-[-0.04em]"
        >
          Let&apos;s build something
          <br />
          that <span className="font-serif font-normal italic tracking-[-0.01em]">stays online.</span>
        </motion.h2>

        {/* email capsule */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, ease, delay: 0.1 }}
          className="glass mt-10 flex flex-col gap-4 rounded-3xl p-3 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:p-2 sm:pl-8"
        >
          <a
            href={`mailto:${profile.email}`}
            className="truncate px-3 pt-2 font-serif text-[clamp(1.5rem,4vw,2.6rem)] italic leading-none transition-opacity hover:opacity-70 sm:px-0 sm:pt-0"
          >
            {profile.email}
          </a>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copy}
              className="glass shrink-0 whitespace-nowrap rounded-full px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-white sm:flex-none"
              aria-live="polite"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <a
              href={`mailto:${profile.email}`}
              className="group flex flex-1 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-bone py-3.5 pl-6 pr-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink sm:flex-none"
            >
              Start a project
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-[-45deg]">
                →
              </span>
            </a>
          </div>
        </motion.div>

        {/* columns */}
        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-line pt-10 sm:mt-28 md:grid-cols-4">
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Navigate</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="group inline-flex items-center text-[15px] text-bone/80 transition-colors hover:text-bone"
                  >
                    <span className="h-px w-0 bg-bone transition-all duration-500 group-hover:mr-2 group-hover:w-4" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Elsewhere</p>
            <ul className="space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[15px] text-bone/80 transition-colors hover:text-bone"
                  >
                    {s.label}
                    <span className="text-xs transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Local time</p>
            <p className="font-display text-2xl font-semibold tracking-tight">
              <Clock />
            </p>
            <p className="mt-1 text-sm text-mute">Ahmedabad · IST</p>
          </div>
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Résumé</p>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className="inline-block border-b border-bone/30 pb-0.5 text-[15px] text-bone/80 transition-colors hover:border-bone hover:text-bone"
            >
              Download résumé
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 mt-20 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] font-mono text-[10px] uppercase tracking-[0.2em] text-mute sm:flex-row">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="text-center normal-case tracking-[0.08em]">Music: {music.credit} · NoCopyrightSounds</span>
        <button
          type="button"
          onClick={(e) => go(e, "#home")}
          className="group flex items-center gap-2 transition-colors hover:text-bone"
        >
          Back to top
          <span className="glass grid h-8 w-8 place-items-center rounded-full transition-transform duration-500 group-hover:-translate-y-1">
            ↑
          </span>
        </button>
      </div>
    </footer>
  );
}
