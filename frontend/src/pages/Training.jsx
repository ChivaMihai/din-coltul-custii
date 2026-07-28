import { useContent } from "@/context/ContentContext";
import { resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function Training() {
  const { content } = useContent();
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const t = content.training || {};

  return (
    <div data-testid="training-page" className="bg-obsidian min-h-screen">
      <PageHeader overline={t.overline} title={t.title} intro={t.intro} />

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-24 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <Reveal>
              <div className="overflow-hidden aspect-[4/5] border border-white/10">
                {t.image ? (
                  <img src={resolveImg(t.image)} alt="Antrenament" className="w-full h-full object-cover" data-testid="training-image" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 font-ui text-sm">Adaugă o poză din antrenament</div>
                )}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 divide-y divide-white/10">
            {(t.disciplines || []).map((d, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div data-testid={`discipline-${i}`} className="py-8 first:pt-0 group">
                  <div className="flex items-baseline gap-5">
                    <span className="font-display text-3xl text-stroke-red">0{i + 1}</span>
                    <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tight group-hover:text-crimson transition-colors">{d.name}</h3>
                  </div>
                  <p className="font-body text-lg text-neutral-400 mt-4 leading-relaxed">{d.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
