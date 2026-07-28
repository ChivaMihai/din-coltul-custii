import { Reveal } from "@/components/site/Reveal";

export default function PageHeader({ overline, title, intro }) {
  return (
    <section className="relative z-10 pt-40 md:pt-52 pb-16 md:pb-24 px-5 md:px-10 max-w-[1600px] mx-auto">
      <Reveal>
        <p className="font-ui text-xs md:text-sm uppercase tracking-[0.3em] text-crimson font-bold mb-6">
          {overline}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight max-w-5xl">
          {title}
        </h1>
      </Reveal>
      {intro && (
        <Reveal delay={0.2}>
          <p className="font-body text-lg md:text-xl text-neutral-400 max-w-2xl mt-8 leading-relaxed">
            {intro}
          </p>
        </Reveal>
      )}
    </section>
  );
}
