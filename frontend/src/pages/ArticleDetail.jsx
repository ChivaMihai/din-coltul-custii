import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, resolveImg } from "@/lib/api";
import { Reveal } from "@/components/site/Reveal";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/articles/${slug}`).then((r) => setArticle(r.data)).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound)
    return (
      <div className="bg-obsidian min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-display text-5xl uppercase">Articol inexistent</h1>
        <Link to="/articole" className="font-ui uppercase tracking-widest text-crimson">← Înapoi la articole</Link>
      </div>
    );

  if (!article) return <div className="min-h-screen bg-obsidian" />;

  return (
    <div data-testid="article-detail-page" className="bg-obsidian min-h-screen">
      <section className="relative z-10 pt-32 md:pt-40 px-5 md:px-10 max-w-4xl mx-auto">
        <Reveal>
          <Link to="/articole" data-testid="article-back" className="inline-flex items-center gap-2 font-ui uppercase tracking-widest text-sm text-neutral-400 hover:text-crimson transition-colors mb-10">
            <ArrowLeft size={16} /> Toate articolele
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          {article.category && (
            <span className="font-ui uppercase tracking-widest text-xs text-crimson">{article.category}</span>
          )}
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-[0.9] tracking-tight mt-4">
            {article.title}
          </h1>
        </Reveal>
      </section>

      {article.coverImage && (
        <Reveal delay={0.2}>
          <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-10 mt-12">
            <div className="overflow-hidden aspect-[16/9] border border-white/10">
              <img src={resolveImg(article.coverImage)} alt={article.title} className="w-full h-full object-cover" data-testid="article-cover" />
            </div>
          </div>
        </Reveal>
      )}

      <article className="relative z-10 max-w-3xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="font-body text-lg md:text-xl text-neutral-300 leading-relaxed whitespace-pre-line" data-testid="article-body">
          {article.body}
        </div>
      </article>
    </div>
  );
}
