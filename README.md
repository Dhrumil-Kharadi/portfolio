<div align="center">

# portfolio

**Cinematic black & white portfolio of Dhrumil Kharadi - DevOps Engineer & Full-Stack Developer.**

[![Live](https://img.shields.io/badge/Live-dhrumil--kharadi.vercel.app-f4f3ef?style=for-the-badge&logo=vercel&logoColor=f4f3ef&labelColor=0b0b0b)](https://dhrumil-kharadi.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-0b0b0b?style=for-the-badge&logo=nextdotjs&logoColor=f4f3ef)
![Three.js](https://img.shields.io/badge/Three.js-0b0b0b?style=for-the-badge&logo=threedotjs&logoColor=f4f3ef)
![Tailwind](https://img.shields.io/badge/Tailwind-0b0b0b?style=for-the-badge&logo=tailwindcss&logoColor=f4f3ef)
![GLSL](https://img.shields.io/badge/GLSL-0b0b0b?style=for-the-badge&logo=opengl&logoColor=f4f3ef)

</div>

## ✦ Highlights

- **Anomalous matter** - a shader-displaced 3D sphere (simplex-noise folds) with a soft porcelain surface and an analytic stone-grain bump, built with React Three Fiber.
- **Charcoal smoke** - a full-screen domain-warped fbm shader in raw WebGL, with a plume that billows behind the hero and reacts to the cursor.
- **Liquid-glass UI** - frosted panels with a specular rim, tuned down to a solid frost on phones for performance.
- **Live CI/CD pipeline** - a looping `commit → build → test → deploy → live` status line.
- **Cinematic intro** - compositor-driven reveal that stays smooth while shaders compile underneath.
- **Smooth scrolling** - Lenis, with WebGL paused off-screen and the smoke throttled to 30fps.

## ✦ Stack

| | |
| --- | --- |
| Framework | Next.js (App Router), React 19 |
| 3D / shaders | Three.js, React Three Fiber, custom GLSL |
| Motion | Motion, Lenis |
| Styling | Tailwind CSS v4 |
| Type | Syne · Instrument Serif · Manrope · JetBrains Mono |

## ✦ Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## ✦ Structure

```
app/          layout, global styles, page
components/   Hero, HeroScene (3D), SmokeBackground (WebGL), Pipeline,
              Navbar, About, Work, Marquee, Footer, Preloader
lib/data.js   all content: profile, stats, stack, projects
```

Edit `lib/data.js` to change any text, links or projects.

---

<div align="center">
<sub>Designed & engineered by <a href="https://github.com/Dhrumil-Kharadi">Dhrumil Kharadi</a> · Ahmedabad</sub>
</div>
