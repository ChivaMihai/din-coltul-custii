import { useContent } from "@/context/ContentContext";
import { resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function About() {
  const { content } = useContent();
  if (!content) return <div className="min-h-screen bg-obsidian" />;
  const a = content.about || {};

  return (
    <div data-testid="about-page" className="bg-obsidian min-h-screen">
      <PageHeader overline={a.overline} title={a.title} />

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-24 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative overflow-hidden aspect-[3/4] bg-surface border border-white/10">
                {a.image ? (
                  <img src={resolveImg(a.image)} alt="Portret" className="w-full h-full object-cover" data-testid="about-image" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 font-ui text-sm">
                    Adaugă poza ta din admin
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <span className="font-ui uppercase tracking-widest text-xs text-crimson">De la 15 ani pe saltea</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7 space-y-8">
            {(a.paragraphs || []).map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className="font-body text-lg md:text-xl text-neutral-300 leading-relaxed">{p}</p>
              </Reveal>
            ))}

            {a.quote && (
              <Reveal delay={0.3}>
                <blockquote className="border-l-2 border-crimson pl-6 md:pl-8 mt-12">
                  <p className="font-display text-3xl md:text-5xl uppercase leading-[0.95] tracking-tight">
                    “{a.quote}”
                  </p>
                </blockquote>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
