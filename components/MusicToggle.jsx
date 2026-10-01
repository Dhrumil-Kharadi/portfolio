"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { music } from "@/lib/data";
import { useIntro } from "./IntroProvider";

const FADE = 0.8; // seconds of fade at each loop seam and on play/pause
const PREF_KEY = "dk-music";

// Loops one 30-second section of the track, very quietly.
// Volume goes through a Web Audio gain node because iOS ignores
// HTMLMediaElement.volume, and the gain also gives smooth fades.
// Browsers block audible autoplay, so "on by default" means it starts on the
// visitor's first tap / click / key press; the toggle remembers "off".
export default function MusicToggle() {
  const { ready } = useIntro();
  const audioRef = useRef(null);
  const graph = useRef(null); // { ctx, gain }
  const wantOn = useRef(true);
  const fadingOut = useRef(false);
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  const rampTo = (value, seconds) => {
    const g = graph.current;
    if (!g) return;
    const t = g.ctx.currentTime;
    g.gain.gain.cancelScheduledValues(t);
    g.gain.gain.setValueAtTime(g.gain.gain.value, t);
    g.gain.gain.linearRampToValueAtTime(value, t + seconds);
  };

  const ensureGraph = () => {
    if (graph.current) return graph.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(audioRef.current);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(ctx.destination);
    graph.current = { ctx, gain };
    return graph.current;
  };

  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !wantOn.current) return false;
    const g = ensureGraph();
    try {
      // never await resume(): before a user gesture Chrome leaves it pending
      if (g && g.ctx.state !== "running") g.ctx.resume().catch(() => {});
      if (audio.currentTime < music.start || audio.currentTime >= music.end) {
        audio.currentTime = music.start;
      }
      await audio.play();
      if (g && g.ctx.state !== "running") {
        // inside a gesture resume() settles almost instantly; otherwise blocked
        await new Promise((r) => window.setTimeout(r, 60));
        if (g.ctx.state !== "running") {
          audio.pause();
          return false;
        }
      }
      if (!g) audio.volume = music.volume; // no Web Audio: best effort
      rampTo(music.volume, FADE);
      setPlaying(true);
      return true;
    } catch {
      return false; // blocked until a user gesture
    }
  }, []);

  const stop = useCallback(() => {
    rampTo(0, 0.35);
    setPlaying(false);
    window.setTimeout(() => {
      if (!wantOn.current || document.hidden) audioRef.current?.pause();
    }, 380);
  }, []);

  // restore a saved "off" choice
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        if (localStorage.getItem(PREF_KEY) === "off") {
          wantOn.current = false;
          setOn(false);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // after the intro: try to play; if blocked, start on the first interaction
  useEffect(() => {
    if (!ready || !available) return;
    let armed = false;
    const onGesture = (e) => {
      // a tap on the toggle itself is handled by the toggle
      if (e.target instanceof Element && e.target.closest("[data-music-toggle]")) return;
      disarm();
      start();
    };
    const events = ["pointerdown", "keydown", "touchend"];
    const disarm = () => {
      if (!armed) return;
      armed = false;
      events.forEach((ev) => window.removeEventListener(ev, onGesture, true));
    };
    let cancelled = false;
    const id = window.setTimeout(() => {
      start().then((ok) => {
        if (!ok && wantOn.current && !cancelled) {
          armed = true;
          events.forEach((ev) => window.addEventListener(ev, onGesture, true));
        }
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      disarm();
    };
  }, [ready, available, start]);

  // loop the section with a soft fade across the seam
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      const t = audio.currentTime;
      if (t >= music.end - FADE && !fadingOut.current && wantOn.current) {
        fadingOut.current = true;
        rampTo(0, Math.max(0.05, music.end - t));
      }
      if (t >= music.end || t < music.start - 0.5) {
        audio.currentTime = music.start;
        fadingOut.current = false;
        if (wantOn.current) rampTo(music.volume, FADE);
      }
    };
    // if the file is shorter than `end`, the native loop takes over
    const onEnded = () => {
      audio.currentTime = music.start;
      if (wantOn.current) audio.play().catch(() => {});
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // pause in background tabs, resume when back
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        rampTo(0, 0.2);
        audioRef.current?.pause();
      } else if (wantOn.current && graph.current) {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [start]);

  const toggle = () => {
    const next = !on;
    wantOn.current = next;
    setOn(next);
    try {
      localStorage.setItem(PREF_KEY, next ? "on" : "off");
    } catch {}
    if (next) start();
    else stop();
  };

  if (!available) return null;

  const active = on && playing;
  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        preload="none"
        playsInline
        onError={() => setAvailable(false)}
      />
      <button
        type="button"
        data-music-toggle
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Turn music off" : "Turn music on"}
        title={`${on ? "Music on" : "Music off"} · ${music.credit}`}
        className={`relative grid h-11 w-11 place-items-center rounded-full transition-[background-color,color,box-shadow] duration-500 ${
          on
            ? "bg-bone text-ink shadow-[0_10px_24px_-10px_rgba(0,0,0,0.55)]"
            : "glass text-bone"
        }`}
      >
        {/* Lusion-style sound wave: a sine that scrolls while playing and
            flattens into a line when off (amplitude = scaleY on the group) */}
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 overflow-visible">
          <defs>
            <clipPath id="music-wave-clip">
              <rect x="5" y="2" width="14" height="20" rx="1" />
            </clipPath>
          </defs>
          <g clipPath="url(#music-wave-clip)">
            <g className={`wave-amp ${active ? "is-on" : on ? "is-waiting" : ""}`}>
              <path
                className={`wave-path ${active ? "is-moving" : ""}`}
                d="M-3 12q2-5 4 0t4 0t4 0t4 0t4 0t4 0t4 0t4 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </svg>
      </button>
    </>
  );
}
