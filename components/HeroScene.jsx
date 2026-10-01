"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useIntro } from "./IntroProvider";

// Ashima / Stefan Gustavson 3D simplex noise.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vObjNormal;
varying vec3 vViewPos;
varying vec3 vObj;
varying float vDisp;
${NOISE}

// Smooth fold field: every term has continuous derivatives, so the surface
// never creases into hard seams.
float field(vec3 p) {
  float t = uTime * 0.16;
  float n = snoise(p * 1.05 + vec3(t, t * 0.7, -t * 0.5));
  float r = snoise(p * 2.2 - vec3(t * 0.8, -t, t * 0.6));
  float s = snoise(p * 1.6 + vec3(-t * 0.6, t * 0.4, t));
  return (n * 0.6 + r * 0.24 + s * s * 0.34 - 0.1) * uAmp;
}

vec3 displace(vec3 n) {
  return n * (1.5 + field(n));
}

void main() {
  vec3 n = normalize(position);
  vec3 tangent = normalize(abs(n.y) > 0.99 ? cross(n, vec3(1.0, 0.0, 0.0)) : cross(n, vec3(0.0, 1.0, 0.0)));
  vec3 bitangent = normalize(cross(n, tangent));
  float e = 0.02;

  float f0 = field(n);
  vec3 d0 = n * (1.5 + f0);
  vec3 d1 = displace(normalize(n + tangent * e));
  vec3 d2 = displace(normalize(n + bitangent * e));
  vec3 nrm = normalize(cross(d1 - d0, d2 - d0));

  vDisp = f0;
  vObj = d0;
  vObjNormal = nrm;
  vNormal = normalize(normalMatrix * nrm);
  vec4 mv = modelViewMatrix * vec4(d0, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

// Soft porcelain: wrapped key light, gentle fill, crevice occlusion and a
// satin sheen. The stone-grain micro-relief is a bump computed analytically in
// object space (not with screen derivatives), so it stays smooth and crisp at
// any resolution instead of breaking into 2x2 pixel blocks.
const FRAG_SURFACE = /* glsl */ `
uniform mat3 normalMatrix;
uniform vec2 uPointer;
uniform float uGrain;
uniform float uBump;
varying vec3 vNormal;
varying vec3 vObjNormal;
varying vec3 vViewPos;
varying vec3 vObj;
varying float vDisp;
${NOISE}

float height(vec3 p) {
#ifdef FINE_GRAIN
  return snoise(p * uGrain) * 0.65 + snoise(p * uGrain * 2.15 + 7.31) * 0.35;
#else
  return snoise(p * uGrain);
#endif
}

void main() {
  vec3 No = normalize(vObjNormal);
  float e = 0.12 / uGrain;
  float h0 = height(vObj);
  vec3 g = vec3(
    height(vObj + vec3(e, 0.0, 0.0)) - h0,
    height(vObj + vec3(0.0, e, 0.0)) - h0,
    height(vObj + vec3(0.0, 0.0, e)) - h0
  ) / e;
  g -= No * dot(g, No);
  No = normalize(No - g * uBump);

  vec3 N = normalize(normalMatrix * No);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(-vViewPos);
  float facing = clamp(dot(N, V), 0.0, 1.0);

  vec3 L1 = normalize(vec3(-0.45 + uPointer.x * 0.5, 0.8 + uPointer.y * 0.35, 0.8));
  vec3 L2 = normalize(vec3(0.75, -0.35, 0.45));

  float wrap = 0.55;
  float key = clamp((dot(N, L1) + wrap) / (1.0 + wrap), 0.0, 1.0);
  key = key * key * (3.0 - 2.0 * key);
  float fill = clamp((dot(N, L2) + 0.3) / 1.3, 0.0, 1.0) * 0.16;

  float ao = mix(0.62, 1.0, smoothstep(-0.28, 0.26, vDisp));
  // grain pores catch a touch of occlusion too, for depth in the texture
  ao *= 1.0 - smoothstep(0.1, 0.9, -h0) * 0.06;

  vec3 H = normalize(L1 + V);
  float spec = pow(max(dot(N, H), 0.0), 28.0) * 0.16;
  float sheen = pow(1.0 - facing, 3.0);

  float shade = (0.36 + key * 0.6 + fill) * ao;
  shade += spec;
  shade -= sheen * 0.28;

  vec3 shadowTone = vec3(0.30, 0.30, 0.31);
  vec3 lightTone = vec3(0.985, 0.98, 0.968);
  vec3 col = mix(shadowTone, lightTone, clamp(shade, 0.0, 1.0));
  col = mix(col, vec3(0.1), clamp(sheen * 0.18 - 0.02, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

function Matter({ pointer, quality }) {
  const group = useRef();
  const material = useRef();
  const { viewport } = useThree();
  const s = Math.min(0.9, Math.max(0.42, Math.min(viewport.width, viewport.height) / 4.6));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.42 },
      uPointer: { value: new THREE.Vector2() },
      // grain frequency tracks on-screen size so pores never drop below a pixel
      uGrain: { value: quality.grain },
      uBump: { value: 0.0065 },
    }),
    [quality.grain]
  );

  // Indexed UV sphere: each vertex is shared, so the noise displacement runs
  // once per vertex, and it is built instantly (no vertex merge on startup).
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(1, quality.segments, Math.round(quality.segments * 0.75));
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    return g;
  }, [quality.segments]);
  const defines = useMemo(() => (quality.fine ? { FINE_GRAIN: "" } : {}), [quality.fine]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, dt) => {
    const u = material.current?.uniforms;
    const g = group.current;
    if (!u || !g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 2.4);
    u.uTime.value = t;
    u.uPointer.value.lerp(pointer.current, k);
    // pointer energy swells the folds a little
    const energy = Math.min(1, Math.hypot(pointer.current.x, pointer.current.y));
    u.uAmp.value += (0.42 + energy * 0.1 - u.uAmp.value) * k;

    g.rotation.y += dt * 0.08;
    g.rotation.x += (-pointer.current.y * 0.35 - g.rotation.x) * k;
    g.rotation.z += (pointer.current.x * 0.18 - g.rotation.z) * k;
    g.position.y = Math.sin(t * 0.5) * 0.06;
  });

  return (
    <group ref={group} scale={s}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={material}
          vertexShader={VERT}
          fragmentShader={FRAG_SURFACE}
          uniforms={uniforms}
          defines={defines}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function pickQuality() {
  const small = window.matchMedia("(max-width: 768px)").matches;
  // phones in "desktop site" mode are wide but still phone GPUs
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const lowCores = (navigator.hardwareConcurrency || 8) <= 4;
  const light = small || touch || lowCores;
  const ratio = window.devicePixelRatio || 1;
  return {
    segments: light ? 160 : 220,
    grain: small ? 9 : 14,
    fine: !light,
    // enough pixels for a crisp texture without paying for 3x retina fill
    dpr: Math.min(small ? 2 : touch ? 1.25 : 1.5, ratio),
  };
}

// Rendered client-only (dynamic import with ssr: false), so reading window
// during the first render is safe.
export default function HeroScene() {
  const wrap = useRef(null);
  const pointer = useRef(new THREE.Vector2());
  const [visible, setVisible] = useState(true);
  const [quality] = useState(pickQuality);
  const { ready } = useIntro();

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    const onOrient = (e) => {
      if (e.gamma == null) return;
      pointer.current.set(
        THREE.MathUtils.clamp(e.gamma / 30, -1, 1),
        THREE.MathUtils.clamp(-(e.beta - 45) / 30, -1, 1)
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });

    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    if (wrap.current) io.observe(wrap.current);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        // "demand" renders a single warm-up frame (compiling shaders under the
        // intro screen), then idles until the hero is revealed and on screen
        frameloop={ready && visible ? "always" : "demand"}
        dpr={quality.dpr}
        camera={{ position: [0, 0, 6], fov: 38 }}
        gl={{ antialias: quality.dpr < 2, alpha: true, powerPreference: "high-performance", stencil: false }}
        style={{ background: "transparent" }}
      >
        <Matter pointer={pointer} quality={quality} />
      </Canvas>
    </div>
  );
}
