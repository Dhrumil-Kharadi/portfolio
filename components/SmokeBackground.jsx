"use client";

import { useEffect, useRef } from "react";
import { useIntro } from "./IntroProvider";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Domain-warped fbm smoke. Rendered monochrome, rising from the bottom,
// with a soft swirl that follows the pointer.
const FRAG = (octaves) => `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uMouseForce;
uniform float uScroll;
uniform vec2  uPlume;
uniform float uPlumeTight;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    v += a * noise(p);
    p = ROT * p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;

  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  float md = length(p - m);
  float swirl = uMouseForce * exp(-md * 2.6);

  // rotate the sample space around the cursor for a curling wake
  float ang = swirl * 1.4;
  vec2 pc = p - m;
  pc = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * pc;
  vec2 ps = pc + m;

  // smoke rises: stretch vertically so the field reads as plumes, not marble
  vec2 base = ps * vec2(1.15, 0.62) + vec2(0.0, -t * 2.2 - uScroll * 0.5);

  vec2 q = vec2(
    fbm(base + t * 0.5),
    fbm(base + vec2(5.2, 1.3) - t * 0.35)
  );
  vec2 r = vec2(
    fbm(base + 2.2 * q + vec2(1.7, 9.2) + t * 0.9),
    fbm(base + 2.2 * q + vec2(8.3, 2.8) - t * 0.7)
  );
  float f = fbm(base + 2.4 * r);

  // carve thin bright filaments out of the field
  float body = smoothstep(0.52, 0.95, f);
  float filament = 1.0 - abs(f - 0.58) * 9.0;
  filament = clamp(filament, 0.0, 1.0);
  filament = pow(filament, 3.0) * smoothstep(0.35, 0.75, r.y);
  float density = body * 0.55 + filament * 0.5;

  // heavy at the floor and flanks, near-black behind the headline
  float floorMask = smoothstep(0.85, -0.1, uv.y);
  float sideMask = smoothstep(0.25, 1.0, abs(uv.x - 0.5) * 2.0);
  float shape = 0.08 + floorMask * 0.85 + sideMask * 0.35 * (1.0 - uv.y * 0.6);

  // hero plume: a billowing column of smoke behind the 3D matter that rises
  // from below it and fades away as the hero scrolls out
  vec2 pd = (uv - uPlume) * vec2(aspect, 1.0);
  pd.y *= pd.y < 0.0 ? 0.55 : 1.0;           // stretch downward: the plume's source
  float plume = exp(-dot(pd, pd) * uPlumeTight);
  float hero = 1.0 - smoothstep(0.0, 0.9, uScroll);
  shape += plume * 1.8 * hero;
  density *= shape;

  // faint light catching the smoke near the pointer
  density += 0.07 * exp(-md * 3.5) * (0.3 + uMouseForce);

  float vig = smoothstep(1.3, 0.25, length(p * vec2(0.75, 1.0)));
  density *= vig;

  float c = 1.0 - exp(-density * 1.25);
  c = c * 0.58;

  // charcoal smoke on paper
  vec3 paper = vec3(0.957, 0.953, 0.937);
  vec3 ink = vec3(0.045);
  gl_FragColor = vec4(mix(paper, ink, c), 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function SmokeBackground() {
  const canvasRef = useRef(null);
  const { ready } = useIntro();
  const readyRef = useRef(ready);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const isMobile = window.matchMedia("(max-width: 768px), (hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Smoke is soft - rendering below native res and upscaling is invisible
    // and saves most of the fill-rate.
    const scale = isMobile ? 0.3 : 0.38;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG(isMobile ? 4 : 5));
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uForce = gl.getUniformLocation(prog, "uMouseForce");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uPlume = gl.getUniformLocation(prog, "uPlume");
    const uPlumeTight = gl.getUniformLocation(prog, "uPlumeTight");

    // Ignore the small height changes mobile browsers fire while the URL bar
    // collapses during scroll; resizing the canvas mid-scroll causes a flash.
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw === lastW && Math.abs(vh - lastH) < 160) return;
      lastW = vw;
      lastH = vh;
      const w = Math.max(1, Math.floor(vw * scale));
      const h = Math.max(1, Math.floor(vh * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0.5, y: 0.35, tx: 0.5, ty: 0.35, force: 0, tforce: 0 };
    const onMove = (e) => {
      const pt = e.touches ? e.touches[0] : e;
      if (!pt) return;
      mouse.tx = pt.clientX / window.innerWidth;
      mouse.ty = 1 - pt.clientY / window.innerHeight;
      mouse.tforce = 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });

    let raf = 0;
    let running = true;
    const start = performance.now();
    let last = start;
    let drawn = false;
    // The smoke drifts slowly, so 30fps is visually identical to 60 and
    // halves the GPU time left over for scrolling and the 3D hero.
    const FRAME_MS = 1000 / 30;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      // hidden under the intro: draw once (to compile/warm up), then idle
      if (!readyRef.current && drawn) return;
      if (drawn && now - last < FRAME_MS - 1) return;
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      drawn = true;

      const k = 1 - Math.exp(-dt * 3.5);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      mouse.force += (mouse.tforce - mouse.force) * k;
      mouse.tforce *= Math.exp(-dt * 0.9);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000 + 12.0);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uForce, mouse.force);
      gl.uniform1f(uScroll, window.scrollY / window.innerHeight);
      // plume sits where the matter renders: centred on desktop, mid-screen on phones
      gl.uniform2f(uPlume, 0.5, isMobile ? 0.55 : 0.52);
      gl.uniform1f(uPlumeTight, isMobile ? 14.0 : 5.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      frame(performance.now());
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onVis = () => {
      if (reduced) return;
      if (document.hidden && running) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (!document.hidden && !running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
        running = true;
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full" style={{ imageRendering: "auto" }} />
      {/* depth: soft blacks top and bottom so content always reads */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_40%,rgba(244,243,239,0.8)_100%)]" />
    </div>
  );
}
