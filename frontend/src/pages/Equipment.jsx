import { useContent } from "@/context/ContentContext";
import { resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function Equipment() {
  const { content } = useContent();
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const e = content.equipment || {};

  return (
    <div data-testid="equipment-page" className="bg-obsidian min-h-screen">
      <PageHeader overline={e.overline} title={e.title} intro={e.intro} />

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-24 md:pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(e.items || []).map((it, i) => (
            <Reveal key={i} delay={(i % 3) * 0.1}>
              <div data-testid={`equipment-${i}`} className="bg-surface border border-white/10 hover:border-crimson transition-colors group h-full flex flex-col">
                <div className="relative overflow-hidden aspect-square bg-obsidian">
                  {it.image ? (
                    <img src={resolveImg(it.image)} alt={it.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-700 font-display text-3xl">DCC</div>
                  )}
                  <span className="absolute top-4 right-4 bg-crimson text-white font-ui font-bold text-sm px-3 py-1">{it.rating}</span>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="font-display text-3xl uppercase tracking-tight group-hover:text-crimson transition-colors">{it.name}</h3>
                  <p className="font-body text-neutral-400 mt-3 leading-relaxed">{it.review}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
