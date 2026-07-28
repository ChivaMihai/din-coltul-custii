import Marquee from "react-fast-marquee";

export default function BandMarquee({ text }) {
  const words = (text || "Disciplină · Sacrificiu · Respect · Evoluție").split("·").map((w) => w.trim());
  return (
    <div data-testid="marquee-band" className="relative z-10 border-y border-white/10 bg-crimson py-6 overflow-hidden">
      <Marquee speed={70} gradient={false}>
        {[...words, ...words, ...words].map((w, i) => (
          <span key={i} className="font-display text-4xl md:text-6xl tracking-wide text-black px-8 flex items-center">
            {w}
            <span className="text-black/40 px-8">✦</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
