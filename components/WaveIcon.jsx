"use client";

import { useEffect, useRef } from "react";

const CYCLES = 1.5; // wiggles across the icon
const SPEED = 5.5; // phase speed (rad/s) while playing

/**
 * Lusion-style sound wave drawn on a canvas.
 * `level`: 0 = flat line (off), 0.5 = resting wave (on, waiting), 1 = live wave.
 * The sine is tapered so its ends always sit on the centre line, amplitude
 * eases between levels, and hovering makes it livelier. The rAF loop only
 * runs while something is changing, so a settled icon costs nothing.
 */
export default function WaveIcon({ level = 0, hover = false, className = "" }) {
  const canvasRef = useRef(null);
  const goal = useRef({ level, hover });
  const kick = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let amp = goal.current.level;
    let phase = 0;
    let raf = 0;
    let last = 0;

    const draw = () => {
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = getComputedStyle(canvas).color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const pad = ctx.lineWidth / 2 + 0.5;
      const mid = h / 2;
      const a = (h / 2 - pad) * amp;
      const steps = 56;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const envelope = Math.pow(Math.sin(Math.PI * u), 1.3);
        const x = pad + (w - pad * 2) * u;
        const y = mid + Math.sin(u * Math.PI * 2 * CYCLES + phase) * a * envelope;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const frame = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const { level: lv, hover: hv } = goal.current;
      const target = lv * (hv && lv > 0 ? 1.18 : 1);
      amp += (target - amp) * (1 - Math.exp(-dt * 9));
      const moving = lv >= 1 && !reduced;
      if (moving) phase -= dt * SPEED * (hv ? 1.5 : 1);
      draw();
      if (moving || Math.abs(target - amp) > 0.002) {
        raf = requestAnimationFrame(frame);
      } else {
        amp = target;
        draw();
        raf = 0;
        last = 0;
      }
    };

    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    draw();
    kick.current();

    // redraw with the new colour once the button's colour transition settles
    const onEnd = () => draw();
    const button = canvas.parentElement;
    button?.addEventListener("transitionend", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      button?.removeEventListener("transitionend", onEnd);
    };
  }, []);

  useEffect(() => {
    goal.current = { level, hover };
    kick.current();
  }, [level, hover]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
