import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi, FamilyRequestItem } from "@/lib/auth";

export function FamilyCodeSettings() {
  const [codeWord, setCodeWord] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [savedExpires, setSavedExpires] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    authApi.adminGetFamilyCode().then(({ status, data }) => {
      if (status === 200) {
        setSavedCode(data.code_word ?? null);
        setSavedExpires(data.expires_at ? data.expires_at.slice(0, 10) : null);
        setCodeWord(data.code_word ?? "");
        setExpiresAt(data.expires_at ? data.expires_at.slice(0, 10) : "");
        setEditing(!data.code_word);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setError("");
    if (!codeWord.trim()) return setError("Введите кодовое слово");
    setSaving(true);
    try {
      const { status, data } = await authApi.adminSetFamilyCode(codeWord.trim(), expiresAt || null);
      if (status !== 200) { setError(data.error || "Не удалось сохранить"); return; }
      setSavedCode(data.code_word ?? null);
      setSavedExpires(data.expires_at ?? null);
      setEditing(false);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="KeyRound" size={15} className="text-primary" />
        <p className="font-cormorant text-lg font-semibold">Кодовое слово «Для родных»</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {!editing ? (
        <div className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">«{savedCode}»</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {savedExpires ? `Действует до ${new Date(savedExpires).toLocaleDateString("ru-RU")}` : "Без срока действия"}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium flex items-center gap-1.5"
          >
            <Icon name="Pencil" size={12} /> Изменить
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Кодовое слово (кириллица, символы, цифры)</label>
            <input
              value={codeWord}
              onChange={(e) => setCodeWord(e.target.value)}
              placeholder="Например: Семья2026!"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Действует до (необязательно)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2 rounded-lg gold-gradient text-white text-xs font-medium disabled:opacity-60"
            >
              Сохранить
            </button>
            {savedCode && (
              <button
                onClick={() => { setEditing(false); setCodeWord(savedCode || ""); setExpiresAt(savedExpires || ""); setError(""); }}
                className="flex-1 py-2 rounded-lg border border-border text-xs font-medium"
              >
                Отмена
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FamilyRequests() {
  const [items, setItems] = useState<FamilyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expiryDrafts, setExpiryDrafts] = useState<Record<number, string>>({});

  const load = () => {
    authApi.adminListFamilyRequests().then(({ status, data }) => {
      if (status === 200 && data.items) setItems(data.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decide = async (id: number, decision: "approved" | "rejected") => {
    if (decision === "approved" && !expiryDrafts[id]) {
      return;
    }
    setBusyId(id);
    try {
      await authApi.adminDecideFamilyRequest(id, decision, expiryDrafts[id]);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const pending = items.filter((i) => i.status === "pending");

  if (loading) return null;
  if (pending.length === 0) return null;

  return (
    <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="Heart" size={15} className="text-primary" />
        <p className="font-cormorant text-lg font-semibold">Заявки «Для родных»</p>
        <span className="doc-tag bg-amber-100 text-amber-700 text-[10px] ml-auto">{pending.length}</span>
      </div>
      {pending.map((r) => (
        <div key={r.id} className="bg-white/60 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{r.full_name || "Без имени"}</p>
              <p className="text-xs text-muted-foreground">{r.phone}</p>
            </div>
            <span className="text-xs text-primary bg-primary/10 rounded-lg px-2 py-1">«{r.code_word}»</span>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Тариф действует до</label>
            <input
              type="date"
              value={expiryDrafts[r.id] || ""}
              onChange={(e) => setExpiryDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs outline-none focus:border-primary/60"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => decide(r.id, "approved")}
              disabled={busyId === r.id || !expiryDrafts[r.id]}
              className="flex-1 py-2 rounded-lg gold-gradient text-white text-xs font-medium disabled:opacity-60"
            >
              Подтвердить
            </button>
            <button
              onClick={() => decide(r.id, "rejected")}
              disabled={busyId === r.id}
              className="flex-1 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-medium disabled:opacity-60"
            >
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
