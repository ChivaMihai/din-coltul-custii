import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api, resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";
import PageHeader from "@/components/site/PageHeader";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/articles").then((r) => setArticles(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="articles-page" className="bg-obsidian min-h-screen">
      <PageHeader
        overline="Articole"
        title="Jurnalul din spatele mănușilor"
        intro="Experiențe reale, lecții și gânduri din drumul meu prin MMA. Fără filtre."
      />

      <section className="relative z-10 px-5 md:px-10 max-w-[1600px] mx-auto pb-24 md:pb-32">
        {loading ? (
          <p className="font-ui text-neutral-500">Se încarcă...</p>
        ) : articles.length === 0 ? (
          <p className="font-ui text-neutral-500" data-testid="articles-empty">Niciun articol încă. Revino curând.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {articles.map((art, i) => (
              <Reveal key={art.id} delay={(i % 2) * 0.1}>
                <Link
                  to={`/articole/${art.slug}`}
                  data-testid={`article-card-${art.slug}`}
                  className="group block bg-obsidian hover:bg-surface transition-colors h-full"
                >
                  <div className="relative overflow-hidden aspect-[16/10] bg-surface">
                    {art.coverImage ? (
                      <img
                        src={resolveImg(art.coverImage)}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700 font-display text-2xl">DCC</div>
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    {art.category && (
                      <span className="font-ui uppercase tracking-widest text-xs text-crimson">{art.category}</span>
                    )}
                    <h3 className="font-display text-3xl md:text-4xl uppercase tracking-tight mt-3 group-hover:text-crimson transition-colors">
                      {art.title}
                    </h3>
                    <p className="font-body text-neutral-400 mt-3 leading-relaxed line-clamp-2">{art.excerpt}</p>
                    <div className="flex items-center gap-2 mt-6 font-ui uppercase tracking-widest text-sm text-neutral-300">
                      Citește <ArrowUpRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
