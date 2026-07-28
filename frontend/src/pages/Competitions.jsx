import { useContent } from "@/context/ContentContext";
import { resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function Competitions() {
  const { content } = useContent();
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const c = content.competitions || {};

  return (
    <div data-testid="competitions-page" className="bg-obsidian min-h-screen">
      <PageHeader overline={c.overline} title={c.title} intro={c.intro} />

      {c.image && (
        <Reveal>
          <div className="relative z-10 max-w-[1600px] mx-auto px-5 md:px-10 mb-20">
            <div className="overflow-hidden aspect-[21/9] border border-white/10">
              <img src={resolveImg(c.image)} alt="Competiție" className="w-full h-full object-cover" data-testid="competitions-image" />
            </div>
          </div>
        </Reveal>
      )}

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-24 md:pb-32">
        <div className="border-l border-white/15 ml-3 md:ml-6">
          {(c.fights || []).map((f, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div data-testid={`fight-${i}`} className="relative pl-8 md:pl-14 pb-16 last:pb-0">
                <span className="absolute left-0 top-2 -translate-x-1/2 w-4 h-4 bg-crimson rounded-full ring-4 ring-obsidian" />
                <div className="font-ui uppercase tracking-widest text-xs text-crimson">{f.date} · {f.location}</div>
                <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tight mt-2">{f.title}</h3>
                <div className="font-ui text-lg text-white mt-2 font-semibold">{f.result}</div>
                <p className="font-body text-neutral-400 mt-4 max-w-2xl leading-relaxed">{f.description}</p>
                {f.lesson && (
                  <div className="mt-5 bg-surface border-l-2 border-crimson p-5 max-w-2xl">
                    <span className="font-ui uppercase tracking-widest text-xs text-neutral-500">Lecția</span>
                    <p className="font-body text-neutral-200 mt-1">{f.lesson}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
