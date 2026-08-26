import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi, TrialCodeItem } from "@/lib/auth";

export default function TrialCodeManagement() {
  const [items, setItems] = useState<TrialCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeWord, setCodeWord] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = () => {
    authApi.adminListTrialCodes().then(({ status, data }) => {
      if (status === 200 && data.items) setItems(data.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setError("");
    if (!codeWord.trim()) return setError("Введите кодовое слово");
    setSaving(true);
    try {
      const { status, data } = await authApi.adminCreateTrialCode(codeWord.trim(), expiresAt || null, comment.trim() || null);
      if (status !== 200) { setError(data.error || "Не удалось создать код"); return; }
      setCodeWord("");
      setExpiresAt("");
      setComment("");
      load();
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    try {
      await authApi.adminDeleteTrialCode(id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (it: TrialCodeItem) => {
    setEditId(it.id);
    setEditComment(it.comment || "");
    setEditExpiresAt(it.expires_at ? it.expires_at.slice(0, 10) : "");
  };

  const closeEdit = () => setEditId(null);

  const saveEdit = async (expiresOverride?: string) => {
    if (editId == null) return;
    setEditSaving(true);
    try {
      const { status, data } = await authApi.adminUpdateTrialCode(
        editId,
        editComment.trim() || null,
        (expiresOverride !== undefined ? expiresOverride : editExpiresAt) || null
      );
      if (status !== 200) { setError(data.error || "Не удалось сохранить"); return; }
      closeEdit();
      load();
    } catch {
      setError("Ошибка соединения");
    } finally {
      setEditSaving(false);
    }
  };

  const closeNow = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditExpiresAt(today);
    saveEdit(today);
  };

  if (loading) return null;

  return (
    <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="Ticket" size={15} className="text-primary" />
        <p className="font-cormorant text-lg font-semibold">Кодовые слова «Тест-драйв»</p>
      </div>
      <p className="text-xs text-muted-foreground">
        По коду тариф активируется сразу — на 3 дня, до 5 документов и 2 отправки. Можно создать сколько угодно кодов.
        Кто по какому слову зашёл — смотрите в разделе «Пользователи» через поиск.
      </p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <input
          value={codeWord}
          onChange={(e) => setCodeWord(e.target.value)}
          placeholder="Новое кодовое слово"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
        />
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий (необязательно)"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
          />
          <button
            onClick={create}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl gold-gradient text-white text-xs font-medium disabled:opacity-60 flex-shrink-0"
          >
            Создать
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">Срок действия кода необязателен — можно оставить пустым</p>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 pt-1">
          {items.map((it) => {
            const isEditing = editId === it.id;
            return (
              <div key={it.id} className="bg-white/60 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => (isEditing ? closeEdit() : openEdit(it))}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-sm font-medium truncate">«{it.code_word}»</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {it.expires_at ? `До ${new Date(it.expires_at).toLocaleDateString("ru-RU")}` : "Без срока"} · использован {it.used_count} раз
                    </p>
                    {it.comment && !isEditing && (
                      <p className="text-xs text-foreground/70 mt-0.5 truncate">💬 {it.comment}</p>
                    )}
                  </button>
                  <button
                    onClick={() => (isEditing ? closeEdit() : openEdit(it))}
                    className="w-8 h-8 rounded-lg border border-border text-muted-foreground flex items-center justify-center flex-shrink-0"
                  >
                    <Icon name={isEditing ? "ChevronUp" : "Pencil"} size={14} />
                  </button>
                  <button
                    onClick={() => remove(it.id)}
                    disabled={busyId === it.id}
                    className="w-8 h-8 rounded-lg border border-red-200 text-red-500 flex items-center justify-center flex-shrink-0 disabled:opacity-60"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <input
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Комментарий"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
                    />
                    <input
                      type="date"
                      value={editExpiresAt}
                      onChange={(e) => setEditExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit()}
                        disabled={editSaving}
                        className="flex-1 px-3.5 py-2 rounded-xl gold-gradient text-white text-xs font-medium disabled:opacity-60"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={closeNow}
                        disabled={editSaving}
                        className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium disabled:opacity-60 flex-shrink-0"
                      >
                        Закрыть сейчас
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
