import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { authApi, TrialCodeItem, UserSearchItem, CodeReferral } from "@/lib/auth";

const PLAN_LABELS: Record<string, string> = {
  start: "Опора", medium: "Рост", pro: "Творец", family: "Для родных", test: "ТЕСТ", trial: "Тест-драйв",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ru-RU");
}

interface Props {
  code: TrialCodeItem;
  onClose: () => void;
  onUpdated: () => void;
}

export default function AttachCodeUserModal({ code, onClose, onUpdated }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [detaching, setDetaching] = useState(false);
  const [error, setError] = useState("");
  const [referrals, setReferrals] = useState<CodeReferral[] | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAttached = !!code.anchor_user_id;

  const loadReferrals = () => {
    setLoadingReferrals(true);
    authApi.adminCodeReferrals(code.id)
      .then(({ status, data }) => {
        if (status === 200) setReferrals(data.items || []);
      })
      .finally(() => setLoadingReferrals(false));
  };

  useEffect(() => {
    if (isAttached) loadReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      authApi.adminSearchUsers(query.trim())
        .then(({ status, data }) => { if (status === 200) setResults(data.items || []); })
        .finally(() => setSearching(false));
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const attach = async (userId: number) => {
    setError("");
    setAttaching(true);
    try {
      const { status, data } = await authApi.adminAttachCodeUser(code.id, userId);
      if (status !== 200) { setError(data.error || "Не удалось прикрепить"); return; }
      onUpdated();
      onClose();
    } catch {
      setError("Ошибка соединения");
    } finally {
      setAttaching(false);
    }
  };

  const detach = async () => {
    setDetaching(true);
    try {
      await authApi.adminDetachCodeUser(code.id);
      onUpdated();
      onClose();
    } finally {
      setDetaching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mt-auto bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up-panel">
        <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon name="UserPlus" size={17} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-cormorant text-xl font-semibold truncate">«{code.code_word}»</h2>
            <p className="text-xs text-muted-foreground">Прикрепление пользователя к слову</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border bg-white/60 flex items-center justify-center flex-shrink-0">
            <Icon name="X" size={15} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {isAttached ? (
            <>
              <div className="bg-white/60 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{code.anchor_name || code.anchor_phone || "Пользователь"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{code.anchor_phone || "—"}</p>
                </div>
                <button
                  onClick={detach}
                  disabled={detaching}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium disabled:opacity-60 flex-shrink-0"
                >
                  Открепить
                </button>
              </div>

              <p className="text-xs font-medium text-muted-foreground pt-1">
                Вошли по этому слову позже ({referrals ? referrals.length : 0})
              </p>

              {loadingReferrals && (
                <div className="flex items-center justify-center py-6">
                  <Icon name="Loader" size={18} className="animate-spin text-primary" />
                </div>
              )}

              {!loadingReferrals && referrals && referrals.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Пока никто больше не входил по этому слову</p>
              )}

              {!loadingReferrals && referrals && referrals.length > 0 && (
                <div className="space-y-2">
                  {referrals.map((r) => (
                    <div key={r.id} className="bg-white/60 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.full_name || r.phone || "Без имени"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{r.phone || r.email || "—"}</p>
                        </div>
                        {r.plan && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                            {PLAN_LABELS[r.plan] || r.plan}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Зарегистрирован {fmtDate(r.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Найдите уже зарегистрированного пользователя и прикрепите его к этому кодовому слову.
                Все, кто войдёт по этому слову позже, будут считаться привязанными к нему же.
              </p>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Телефон, имя или почта"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
                />
              </div>

              {searching && (
                <div className="flex items-center justify-center py-4">
                  <Icon name="Loader" size={16} className="animate-spin text-primary" />
                </div>
              )}

              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Никого не нашли</p>
              )}

              {!searching && results.length > 0 && (
                <div className="space-y-2">
                  {results.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => attach(u.id)}
                      disabled={attaching}
                      className="w-full bg-white/60 rounded-xl p-3 flex items-center justify-between gap-2 text-left disabled:opacity-60"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.full_name || u.phone || "Без имени"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{u.phone || u.email || "—"}</p>
                      </div>
                      <Icon name="ChevronRight" size={15} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
