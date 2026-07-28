import { useRef, useState } from "react";
import { Upload, Trash2, Plus } from "lucide-react";
import { api, resolveImg } from "@/lib/api";
import { toast } from "sonner";

export function Field({ label, value, onChange, testid }) {
  return (
    <label className="block">
      <span className="font-ui uppercase tracking-widest text-xs text-neutral-400">{label}</span>
      <input
        data-testid={testid}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 bg-obsidian border border-white/15 px-4 py-2.5 font-body text-black focus:border-crimson outline-none transition-colors"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 4, testid }) {
  return (
    <label className="block">
      <span className="font-ui uppercase tracking-widest text-xs text-neutral-400">{label}</span>
      <textarea
        data-testid={testid}
        value={value || ""}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 bg-obsidian border border-white/15 px-4 py-2.5 font-body text-black focus:border-crimson outline-none transition-colors resize-y"
      />
    </label>
  );
}

export function ImageField({ label, value, onChange, testid }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("Imagine încărcată");
    } catch (e) {
      toast.error("Încărcarea a eșuat");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="font-ui uppercase tracking-widest text-xs text-neutral-400">{label}</span>
      <div className="mt-2 flex gap-4 items-start">
        <div className="w-28 h-28 shrink-0 bg-obsidian border border-white/15 overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={resolveImg(value)} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-neutral-700 text-xs font-ui">Fără imagine</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            data-testid={testid ? `${testid}-url` : undefined}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL imagine sau încarcă"
            className="w-full bg-obsidian border border-white/15 px-3 py-2 font-body text-sm text-white focus:border-crimson outline-none"
          />
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} data-testid={testid ? `${testid}-file` : undefined} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-ui uppercase tracking-widest text-xs hover:border-crimson hover:text-crimson transition-colors disabled:opacity-50"
          >
            <Upload size={14} /> {uploading ? "Se încarcă..." : "Încarcă imagine"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ListEditor({ label, items, onChange, fields, emptyItem, testid }) {
  const list = items || [];
  const update = (i, key, val) => {
    const next = list.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-ui uppercase tracking-widest text-sm text-white">{label}</span>
        <button
          type="button"
          data-testid={testid ? `${testid}-add` : undefined}
          onClick={() => onChange([...list, { ...emptyItem }])}
          className="inline-flex items-center gap-2 bg-crimson text-white px-4 py-2 font-ui uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors"
        >
          <Plus size={14} /> Adaugă
        </button>
      </div>
      <div className="space-y-6">
        {list.map((item, i) => (
          <div key={i} className="bg-obsidian border border-white/10 p-5 relative" data-testid={testid ? `${testid}-item-${i}` : undefined}>
            <button
              type="button"
              onClick={() => onChange(list.filter((_, idx) => idx !== i))}
              className="absolute top-4 right-4 text-neutral-500 hover:text-crimson transition-colors"
              data-testid={testid ? `${testid}-remove-${i}` : undefined}
            >
              <Trash2 size={16} />
            </button>
            <div className="grid md:grid-cols-2 gap-4 pr-8">
              {fields.map((f) =>
                f.type === "image" ? (
                  <div key={f.key} className="md:col-span-2">
                    <ImageField label={f.label} value={item[f.key]} onChange={(v) => update(i, f.key, v)} />
                  </div>
                ) : f.type === "textarea" ? (
                  <div key={f.key} className="md:col-span-2">
                    <TextArea label={f.label} value={item[f.key]} onChange={(v) => update(i, f.key, v)} rows={3} />
                  </div>
                ) : (
                  <Field key={f.key} label={f.label} value={item[f.key]} onChange={(v) => update(i, f.key, v)} />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
