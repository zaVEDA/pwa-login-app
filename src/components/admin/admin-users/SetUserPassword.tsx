import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";

type AccessItem = {
  id: number;
  target: "app" | "lawyer_landing";
  login: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  status: "active" | "pending" | "expired";
};

const TARGET_LABEL: Record<string, string> = {
  app: "Для приложения",
  lawyer_landing: "Лендинг для юриста",
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  active: { label: "Активен", cls: "text-green-700 bg-green-100" },
  pending: { label: "Ожидает", cls: "text-amber-700 bg-amber-100" },
  expired: { label: "Истёк", cls: "text-red-600 bg-red-100" },
};

function fmt(dt: string | null): string {
  if (!dt) return "—";
  const d = new Date(dt.replace(" ", "T"));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SetUserPassword() {
  const [target, setTarget] = useState<"app" | "lawyer_landing">("app");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [items, setItems] = useState<AccessItem[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const loadList = () => {
    authApi.adminListAccess().then(({ status, data }) => {
      if (status === 200 && data.items) setItems(data.items);
      setListLoading(false);
    }).catch(() => setListLoading(false));
  };

  useEffect(() => { loadList(); }, []);

  const save = async () => {
    setError("");
    setDone(false);
    if (target === "app" && !login.trim()) return setError("Укажите логин пользователя");
    if (password.length < 6) return setError("Пароль не короче 6 символов");
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      return setError("Дата окончания должна быть позже начала");
    }
    setLoading(true);
    try {
      const { status, data } = await authApi.adminGrantAccess({
        target,
        login: login.trim(),
        password,
        starts_at: startsAt ? startsAt.replace("T", " ") + ":00" : null,
        expires_at: expiresAt ? expiresAt.replace("T", " ") + ":00" : null,
      });
      if (status !== 200) { setError(data.error || "Не удалось сохранить"); return; }
      setDone(true);
      setPassword(""); setLogin(""); setStartsAt(""); setExpiresAt("");
      loadList();
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (id: number) => {
    const { status } = await authApi.adminRevokeAccess(id);
    if (status === 200) loadList();
  };

  return (
    <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="Lock" size={15} className="text-primary" />
        <p className="font-cormorant text-lg font-semibold">Назначить пароль пользователю</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      {done && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
          <Icon name="CheckCircle" size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700">Доступ назначен</p>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Назначение</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as "app" | "lawyer_landing")}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
        >
          <option value="app">Для приложения</option>
          <option value="lawyer_landing">Лендинг для юриста</option>
        </select>
      </div>

      {target === "app" && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Логин или телефон</label>
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин или телефон"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Новый пароль</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Не короче 6 символов"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Действует с (необязательно)</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Действует до (необязательно)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="w-full py-2.5 rounded-lg gold-gradient text-white text-xs font-medium disabled:opacity-60"
      >
        Сохранить доступ
      </button>

      {!listLoading && items.length > 0 && (
        <div className="pt-1 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Выданные доступы</p>
          {items.map((it) => {
            const st = STATUS_META[it.status];
            return (
              <div key={it.id} className="bg-white/60 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{it.login || "—"}</p>
                      <span className={`text-[10px] rounded-md px-1.5 py-0.5 ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{TARGET_LABEL[it.target] || it.target}</p>
                  </div>
                  <button
                    onClick={() => revoke(it.id)}
                    className="text-[11px] text-red-500 flex items-center gap-1 flex-shrink-0"
                  >
                    <Icon name="Trash2" size={12} /> Отозвать
                  </button>
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  {it.starts_at || it.expires_at
                    ? <>с <b className="text-foreground/70">{fmt(it.starts_at)}</b> по <b className="text-foreground/70">{fmt(it.expires_at)}</b></>
                    : "без ограничения по сроку"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
