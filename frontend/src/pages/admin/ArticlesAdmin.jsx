import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api, resolveImg } from "@/lib/api";
import { Field, TextArea, ImageField } from "@/pages/admin/fields";

const EMPTY = { title: "", slug: "", excerpt: "", body: "", coverImage: "", category: "", published: true };

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null); // object or null
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/articles?all=true").then((r) => setArticles(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title.trim()) return toast.error("Titlul e obligatoriu");
    setSaving(true);
    try {
      if (editing.id) await api.put(`/articles/${editing.id}`, editing);
      else await api.post("/articles", editing);
      toast.success("Articol salvat");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error("Salvarea a eșuat");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Ștergi acest articol?")) return;
    await api.delete(`/articles/${id}`);
    toast.success("Articol șters");
    load();
  };

  return (
    <div className="bg-surface border border-white/10 p-6 md:p-8" data-testid="admin-articles">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl uppercase tracking-tight">Articole</h2>
        <button data-testid="article-new" onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-2 bg-crimson text-white px-5 py-2 font-ui uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors">
          <Plus size={14} /> Articol nou
        </button>
      </div>

      <div className="space-y-3">
        {articles.map((art) => (
          <div key={art.id} data-testid={`article-row-${art.slug}`} className="flex items-center gap-4 bg-obsidian border border-white/10 p-3">
            <div className="w-16 h-16 shrink-0 bg-surface overflow-hidden">
              {art.coverImage ? <img src={resolveImg(art.coverImage)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700 font-display">DCC</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-ui font-semibold truncate">{art.title}</div>
              <div className="text-xs text-neutral-500 font-body">{art.category} {art.published ? "" : "· ciornă"}</div>
            </div>
            <button onClick={() => setEditing(art)} data-testid={`article-edit-${art.slug}`} className="text-neutral-400 hover:text-white transition-colors p-2"><Edit3 size={16} /></button>
            <button onClick={() => remove(art.id)} data-testid={`article-delete-${art.slug}`} className="text-neutral-400 hover:text-crimson transition-colors p-2"><Trash2 size={16} /></button>
          </div>
        ))}
        {articles.length === 0 && <p className="font-body text-neutral-500">Niciun articol încă.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4" onClick={() => setEditing(null)}>
          <div className="bg-surface border border-white/15 w-full max-w-2xl my-8 p-6 md:p-8" onClick={(ev) => ev.stopPropagation()} data-testid="article-modal">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl uppercase tracking-tight">{editing.id ? "Editează articol" : "Articol nou"}</h3>
              <button onClick={() => setEditing(null)} className="text-neutral-400 hover:text-crimson"><X size={22} /></button>
            </div>
            <div className="space-y-5">
              <Field label="Titlu" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} testid="article-title" />
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Categorie" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
                <Field label="Slug (opțional)" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              </div>
              <TextArea label="Rezumat" value={editing.excerpt} onChange={(v) => setEditing({ ...editing, excerpt: v })} rows={2} testid="article-excerpt" />
              <ImageField label="Imagine copertă" value={editing.coverImage} onChange={(v) => setEditing({ ...editing, coverImage: v })} testid="article-cover" />
              <TextArea label="Conținut" value={editing.body} onChange={(v) => setEditing({ ...editing, body: v })} rows={10} testid="article-content" />
              <label className="flex items-center gap-3 font-ui text-sm text-neutral-300">
                <input type="checkbox" checked={editing.published} onChange={(ev) => setEditing({ ...editing, published: ev.target.checked })} data-testid="article-published" />
                Publicat
              </label>
              <button onClick={save} disabled={saving} data-testid="article-save" className="w-full bg-crimson text-white font-ui uppercase tracking-widest font-bold px-8 py-3 hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                {saving ? "Se salvează..." : "Salvează articol"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
