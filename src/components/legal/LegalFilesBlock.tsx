import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { getLegalAuth } from "@/components/legal/LegalGate";

const API = "https://functions.poehali.dev/5043035c-9bd0-4b6e-ab11-a2b1f897b997";

const authHeaders = () => ({
  "Content-Type": "application/json",
  "X-Legal-Auth": getLegalAuth(),
});

type FileStatus = "new" | "read" | "processed" | "review" | "done";

interface LegalFile {
  id: string;
  name: string;
  comment?: string;
  status?: FileStatus;
  url: string;
  size: number;
  content_type: string;
  created_at?: string;
}

const STATUSES: { key: FileStatus; label: string; cls: string }[] = [
  { key: "new", label: "Новый", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  { key: "read", label: "Прочитано", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "processed", label: "Обработано", cls: "bg-purple-100 text-purple-700 border-purple-200" },
  { key: "review", label: "На проверку", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: "done", label: "Готово", cls: "bg-green-100 text-green-700 border-green-200" },
];

function statusMeta(s?: FileStatus) {
  return STATUSES.find((x) => x.key === s) || STATUSES[0];
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} Б`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1024 / 1024).toFixed(1)} МБ`;
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
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
  const [newComment, setNewComment] = useState("");
  const [statusOpen, setStatusOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "list" }),
      });
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
          headers: authHeaders(),
          body: JSON.stringify({ action: "upload", name: file.name, content_type: file.type, comment: newComment.trim(), data }),
        });
        const d = await r.json();
        if (d.file) setFiles((prev) => [d.file, ...prev]);
        else if (d.error) setError(d.error);
      }
      setNewComment("");
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setStatus = async (id: string, status: FileStatus) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    setStatusOpen(null);
    await fetch(API, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ action: "set_status", id, status }),
    }).catch(() => {});
  };

  const remove = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    await fetch(API, {
      method: "POST",
      headers: authHeaders(),
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
          <p className="text-xs text-muted-foreground">Word, PDF, сканы — с комментарием и статусом</p>
        </div>
      </div>

      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Комментарий к документу (необязательно)</label>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Например: черновик оферты, прошу проверить пункт 4.2"
        rows={2}
        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:border-primary bg-background resize-none"
      />

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
          files.map((f) => {
            const st = statusMeta(f.status);
            return (
              <div key={f.id} className="border border-border rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Icon name={iconFor(f.name, f.content_type)} size={18} className="text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-foreground hover:text-primary truncate block">
                      {f.name}
                    </a>
                    <p className="text-xs text-muted-foreground">{fmtDate(f.created_at)} · {fmtSize(f.size)}</p>
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setStatusOpen(statusOpen === f.id ? null : f.id)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border inline-flex items-center gap-1 ${st.cls}`}
                    >
                      {st.label}
                      <Icon name="ChevronDown" size={12} />
                    </button>
                    {statusOpen === f.id && (
                      <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-xl shadow-lg py-1 w-36">
                        {STATUSES.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => setStatus(f.id, s.key)}
                            className="w-full text-left text-xs px-3 py-1.5 hover:bg-muted flex items-center justify-between"
                          >
                            {s.label}
                            {f.status === s.key && <Icon name="Check" size={13} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <a href={f.url} download target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground flex-shrink-0" title="Скачать">
                    <Icon name="Download" size={15} />
                  </a>
                  <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 flex-shrink-0" title="Удалить">
                    <Icon name="Trash2" size={15} />
                  </button>
                </div>

                {f.comment && (
                  <p className="mt-2 ml-8 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5 whitespace-pre-wrap">{f.comment}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
