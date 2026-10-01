import { stackRowA, stackRowB } from "@/lib/data";

function Row({ items, reverse, outline, duration }) {
  const loop = [...items, ...items];
  return (
    <div className="marquee overflow-hidden py-2 sm:py-3">
      <ul
        className="marquee-track flex w-max items-center"
        data-reverse={reverse}
        style={{ "--duration": duration }}
      >
        {loop.map((t, i) => (
          <li
            key={i}
            aria-hidden={i >= items.length}
            className="flex items-center whitespace-nowrap"
          >
            <span
              className={`px-5 font-display text-[clamp(2.2rem,7vw,5.5rem)] font-extrabold uppercase leading-none tracking-[-0.03em] sm:px-8 ${
                outline ? "text-outline" : "text-bone"
              }`}
            >
              {t}
            </span>
            <span className="font-serif text-[clamp(1.6rem,4vw,3rem)] italic text-bone/40">✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Marquee() {
  return (
    <section aria-label="Tech stack" className="relative z-10 overflow-hidden py-10 sm:py-16">
      <div className="-rotate-2 scale-[1.04] border-y border-line bg-white/70 py-4">
        <Row items={stackRowA} duration="55s" />
        <Row items={stackRowB} reverse outline duration="60s" />
      </div>
    </section>
  );
}
