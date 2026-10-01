"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

// Pointer-tracked 3D tilt with a moving specular glare - a liquid-glass take
// on the "Holo Card" pattern.
export default function TiltCard({ children, className = "", max = 10 }) {
  const ref = useRef(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.9), transparent 45%)`;

  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={`glass group relative h-full overflow-hidden ${className}`}
      >
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div style={{ transform: "translateZ(30px)" }} className="relative h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
