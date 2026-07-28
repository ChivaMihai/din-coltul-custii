import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Save, LogOut, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { Field, TextArea, ImageField, ListEditor } from "@/pages/admin/fields";
import ArticlesAdmin from "@/pages/admin/ArticlesAdmin";

const TABS = [
  { id: "settings", label: "Setări" },
  { id: "home", label: "Acasă" },
  { id: "about", label: "Despre mine" },
  { id: "competitions", label: "Competiții" },
  { id: "training", label: "Antrenamente" },
  { id: "mindset", label: "Mentalitate" },
  { id: "equipment", label: "Echipament" },
  { id: "contact", label: "Contact" },
  { id: "articles", label: "Articole" },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const { content, refresh } = useContent();
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState("settings");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (content && Object.keys(content).length > 0) {
    setDraft(JSON.parse(JSON.stringify(content)));
  }
}, [content]);

  if (!draft) return <div className="min-h-screen bg-obsidian flex items-center justify-center font-ui text-neutral-500">Se încarcă...</div>;

  const patch = (section, key, value) =>
    setDraft((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));
  const patchNested = (section, sub, key, value) =>
    setDraft((d) => ({ ...d, [section]: { ...d[section], [sub]: { ...d[section][sub], [key]: value } } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/content", { content: draft });
      await refresh();
      toast.success("Modificări salvate");
    } catch (e) {
      toast.error("Salvarea a eșuat");
    } finally {
      setSaving(false);
    }
  };

  const s = draft.settings || {};
  const h = draft.home || {};
  const a = draft.about || {};
  const c = draft.competitions || {};
  const t = draft.training || {};
  const m = draft.mindset || {};
  const e = draft.equipment || {};
  const ct = draft.contact || {};

  return (
    <div className="min-h-screen bg-obsidian text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="font-display text-2xl tracking-wide"><span className="text-crimson">/</span> Admin</div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" data-testid="admin-view-site" className="hidden sm:inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-ui uppercase tracking-widest text-xs hover:border-crimson transition-colors">
              <ExternalLink size={14} /> Vezi site
            </Link>
            {tab !== "articles" && (
              <button data-testid="admin-save" onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-crimson text-white px-5 py-2 font-ui uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                <Save size={14} /> {saving ? "Se salvează..." : "Salvează"}
              </button>
            )}
            <button data-testid="admin-logout" onClick={logout} className="inline-flex items-center gap-2 text-neutral-400 hover:text-crimson transition-colors px-2">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 grid lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible sticky top-24">
            {TABS.map((tb) => (
              <button
                key={tb.id}
                data-testid={`admin-tab-${tb.id}`}
                onClick={() => setTab(tb.id)}
                className={`text-left whitespace-nowrap px-4 py-3 font-ui uppercase tracking-widest text-sm border-l-2 transition-colors ${
                  tab === tb.id ? "border-crimson text-white bg-surface" : "border-transparent text-neutral-500 hover:text-white"
                }`}
              >
                {tb.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Panel */}
        <main className="lg:col-span-9 space-y-6">
          {tab === "settings" && (
            <Section title="Setări generale">
              <Field label="Numele site-ului" value={s.siteName} onChange={(v) => patch("settings", "siteName", v)} testid="set-sitename" />
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Instagram URL" value={s.socials?.instagram} onChange={(v) => patchNested("settings", "socials", "instagram", v)} />
                <Field label="YouTube URL" value={s.socials?.youtube} onChange={(v) => patchNested("settings", "socials", "youtube", v)} />
                <Field label="TikTok URL" value={s.socials?.tiktok} onChange={(v) => patchNested("settings", "socials", "tiktok", v)} />
                <Field label="Email contact" value={s.socials?.email} onChange={(v) => patchNested("settings", "socials", "email", v)} />
              </div>
            </Section>
          )}

          {tab === "home" && (
            <Section title="Pagina Acasă">
              <Field label="Titlu principal (hero)" value={h.heroTitle} onChange={(v) => patch("home", "heroTitle", v)} testid="home-herotitle" />
              <TextArea label="Text hero" value={h.heroText} onChange={(v) => patch("home", "heroText", v)} />
              <ImageField label="Imagine principală (competiție)" value={h.heroImage} onChange={(v) => patch("home", "heroImage", v)} testid="home-heroimage" />
              <Field label="Text buton" value={h.ctaText} onChange={(v) => patch("home", "ctaText", v)} />
              <Field label="Text bandă animată (separă cu ·)" value={h.marqueeText} onChange={(v) => patch("home", "marqueeText", v)} />
              <ListEditor label="Statistici" items={h.stats} onChange={(v) => patch("home", "stats", v)} emptyItem={{ value: "", label: "" }} testid="home-stats" fields={[{ key: "value", label: "Valoare" }, { key: "label", label: "Etichetă" }]} />
              <Field label="Titlu secțiune intro" value={h.introTitle} onChange={(v) => patch("home", "introTitle", v)} />
              <TextArea label="Text intro" value={h.introText} onChange={(v) => patch("home", "introText", v)} />
            </Section>
          )}

          {tab === "about" && (
            <Section title="Despre mine">
              <Field label="Supratitlu" value={a.overline} onChange={(v) => patch("about", "overline", v)} />
              <Field label="Titlu" value={a.title} onChange={(v) => patch("about", "title", v)} />
              <ImageField label="Poza ta" value={a.image} onChange={(v) => patch("about", "image", v)} testid="about-image" />
              <TextArea label="Paragrafe (câte unul pe rând)" rows={8} value={(a.paragraphs || []).join("\n")} onChange={(v) => patch("about", "paragraphs", v.split("\n").filter((x) => x.trim()))} testid="about-paragraphs" />
              <TextArea label="Citat" value={a.quote} onChange={(v) => patch("about", "quote", v)} rows={2} />
            </Section>
          )}

          {tab === "competitions" && (
            <Section title="Competiții">
              <Field label="Supratitlu" value={c.overline} onChange={(v) => patch("competitions", "overline", v)} />
              <Field label="Titlu" value={c.title} onChange={(v) => patch("competitions", "title", v)} />
              <TextArea label="Intro" value={c.intro} onChange={(v) => patch("competitions", "intro", v)} />
              <ImageField label="Imagine" value={c.image} onChange={(v) => patch("competitions", "image", v)} />
              <ListEditor label="Lupte" items={c.fights} onChange={(v) => patch("competitions", "fights", v)} emptyItem={{ date: "", location: "", title: "", result: "", description: "", lesson: "" }} testid="comp-fights"
                fields={[{ key: "date", label: "Data" }, { key: "location", label: "Locație" }, { key: "title", label: "Titlu eveniment" }, { key: "result", label: "Rezultat" }, { key: "description", label: "Descriere", type: "textarea" }, { key: "lesson", label: "Lecția", type: "textarea" }]} />
            </Section>
          )}

          {tab === "training" && (
            <Section title="Antrenamente">
              <Field label="Supratitlu" value={t.overline} onChange={(v) => patch("training", "overline", v)} />
              <Field label="Titlu" value={t.title} onChange={(v) => patch("training", "title", v)} />
              <TextArea label="Intro" value={t.intro} onChange={(v) => patch("training", "intro", v)} />
              <ImageField label="Imagine" value={t.image} onChange={(v) => patch("training", "image", v)} />
              <ListEditor label="Discipline" items={t.disciplines} onChange={(v) => patch("training", "disciplines", v)} emptyItem={{ name: "", description: "" }} testid="train-disc"
                fields={[{ key: "name", label: "Nume" }, { key: "description", label: "Descriere", type: "textarea" }]} />
            </Section>
          )}

          {tab === "mindset" && (
            <Section title="Mentalitate">
              <Field label="Supratitlu" value={m.overline} onChange={(v) => patch("mindset", "overline", v)} />
              <Field label="Titlu" value={m.title} onChange={(v) => patch("mindset", "title", v)} />
              <TextArea label="Intro" value={m.intro} onChange={(v) => patch("mindset", "intro", v)} />
              <ListEditor label="Capitole" items={m.chapters} onChange={(v) => patch("mindset", "chapters", v)} emptyItem={{ title: "", text: "" }} testid="mind-chapters"
                fields={[{ key: "title", label: "Titlu" }, { key: "text", label: "Text", type: "textarea" }]} />
            </Section>
          )}

          {tab === "equipment" && (
            <Section title="Echipament">
              <Field label="Supratitlu" value={e.overline} onChange={(v) => patch("equipment", "overline", v)} />
              <Field label="Titlu" value={e.title} onChange={(v) => patch("equipment", "title", v)} />
              <TextArea label="Intro" value={e.intro} onChange={(v) => patch("equipment", "intro", v)} />
              <ListEditor label="Produse" items={e.items} onChange={(v) => patch("equipment", "items", v)} emptyItem={{ name: "", rating: "", image: "", review: "" }} testid="equip-items"
                fields={[{ key: "name", label: "Nume" }, { key: "rating", label: "Rating (ex: 9/10)" }, { key: "review", label: "Recenzie", type: "textarea" }, { key: "image", label: "Imagine", type: "image" }]} />
            </Section>
          )}

          {tab === "contact" && (
            <Section title="Contact">
              <Field label="Supratitlu" value={ct.overline} onChange={(v) => patch("contact", "overline", v)} />
              <Field label="Titlu" value={ct.title} onChange={(v) => patch("contact", "title", v)} />
              <TextArea label="Text" value={ct.text} onChange={(v) => patch("contact", "text", v)} />
              <Field label="Email afișat" value={ct.email} onChange={(v) => patch("contact", "email", v)} />
            </Section>
          )}

          {tab === "articles" && <ArticlesAdmin />}
        </main>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-surface border border-white/10 p-6 md:p-8" data-testid="admin-section">
      <h2 className="font-display text-3xl uppercase tracking-tight mb-6">{title}</h2>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
