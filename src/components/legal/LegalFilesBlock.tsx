import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/5043035c-9bd0-4b6e-ab11-a2b1f897b997";

interface LegalFile {
  id: string;
  name: string;
  url: string;
  size: number;
  content_type: string;
  created_at?: string;
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1024 / 1024).toFixed(1)} МБ`;
}

function iconFor(name: string, type: string) {
  const n = name.toLowerCase();
  if (type.startsWith("image/")) return "Image";
  if (n.endsWith(".pdf")) return "FileText";
  if (n.endsWith(".doc") || n.endsWith(".docx")) return "FileType";
  return "File";
}

export default function LegalFilesBlock() {
  const [files, setFiles] = useState<LegalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const r = await fetch(API);
      const d = await r.json();
      setFiles(d.files || []);
    } catch {
      setError("Не удалось загрузить список файлов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || !list.length) return;
    setError("");
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        if (file.size > 20 * 1024 * 1024) { setError(`«${file.name}» больше 20 МБ`); continue; }
        const data = await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(String(fr.result).split(",")[1] || "");
          fr.onerror = rej;
          fr.readAsDataURL(file);
        });
        const r = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upload", name: file.name, content_type: file.type, data }),
        });
        const d = await r.json();
        if (d.file) setFiles((prev) => [d.file, ...prev]);
        else if (d.error) setError(d.error);
      }
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    }).catch(() => {});
  };

  return (
    <div className="mt-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Paperclip" size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground leading-tight">Прикреплённые файлы</h2>
          <p className="text-xs text-muted-foreground">Документы, PDF, сканы — сохраняются в облаке</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.rtf,.odt,image/*"
        className="hidden"
        onChange={onPick}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary rounded-xl py-4 text-sm text-muted-foreground transition-colors disabled:opacity-60"
      >
        {uploading ? (
          <><Icon name="Loader" size={16} className="animate-spin text-primary" /> Загрузка…</>
        ) : (
          <><Icon name="Upload" size={16} className="text-primary" /> Выбрать файлы или перетащить</>
        )}
      </button>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-6"><Icon name="Loader" size={18} className="animate-spin text-primary" /></div>
        ) : files.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Пока ничего не прикреплено</p>
        ) : (
          files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 border border-border rounded-xl px-3 py-2.5">
              <Icon name={iconFor(f.name, f.content_type)} size={18} className="text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <a href={f.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-foreground hover:text-primary truncate block">
                  {f.name}
                </a>
                <p className="text-xs text-muted-foreground">{fmtSize(f.size)}</p>
              </div>
              <a href={f.url} download target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Скачать">
                <Icon name="Download" size={15} />
              </a>
              <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Удалить">
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
