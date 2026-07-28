import { useContent } from "@/context/ContentContext";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function Mindset() {
  const { content } = useContent();
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const m = content.mindset || {};

  return (
    <div data-testid="mindset-page" className="bg-obsidian min-h-screen">
      <PageHeader overline={m.overline} title={m.title} intro={m.intro} />

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-24 md:pb-40">
        <div className="space-y-4 md:space-y-0">
          {(m.chapters || []).map((ch, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div data-testid={`chapter-${i}`} className="relative grid md:grid-cols-12 gap-6 items-center py-12 md:py-20 border-t border-white/10 group">
                <div className="md:col-span-4 relative">
                  <span className="font-display text-[26vw] md:text-[12vw] leading-[0.7] text-stroke group-hover:text-stroke-red transition-all duration-500 select-none">
                    0{i + 1}
                  </span>
                </div>
                <div className="md:col-span-8">
                  <h3 className="font-display text-5xl md:text-6xl uppercase tracking-tight group-hover:text-crimson transition-colors">{ch.title}</h3>
                  <p className="font-body text-lg md:text-2xl text-neutral-400 mt-5 max-w-2xl leading-relaxed">{ch.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
