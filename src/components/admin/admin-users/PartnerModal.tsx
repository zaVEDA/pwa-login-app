import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi, PartnerReferral } from "@/lib/auth";

const PLAN_LABELS: Record<string, string> = {
  start: "Опора", medium: "Рост", pro: "Творец", family: "Для родных", test: "ТЕСТ", trial: "Тест-драйв",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ru-RU");
}

interface UserRow {
  id: number;
  full_name: string | null;
  phone: string | null;
  partner_code_word?: string | null;
  partner_referrals_count?: number;
}

interface Props {
  user: UserRow;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PartnerModal({ user, onClose, onUpdated }: Props) {
  const [codeWord, setCodeWord] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [referrals, setReferrals] = useState<PartnerReferral[] | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isPartner = !!user.partner_code_word;

  const loadReferrals = () => {
    setLoadingReferrals(true);
    authApi.adminPartnerReferrals(user.id)
      .then(({ status, data }) => {
        if (status === 200) setReferrals(data.items || []);
      })
      .finally(() => setLoadingReferrals(false));
  };

  useEffect(() => {
    if (isPartner) loadReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignPartner = async () => {
    setError("");
    if (!codeWord.trim()) return setError("Введите кодовое слово");
    setSaving(true);
    try {
      const { status, data } = await authApi.adminCreateTrialCode(codeWord.trim(), expiresAt || null, user.id);
      if (status !== 200) { setError(data.error || "Не удалось назначить"); return; }
      onUpdated();
      onClose();
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const removePartner = async () => {
    setRemoving(true);
    try {
      const { status, data } = await authApi.adminListTrialCodes();
      if (status === 200 && data.items) {
        const item = data.items.find((i: { partner_user_id?: number | null; id: number }) => i.partner_user_id === user.id);
        if (item) await authApi.adminDeleteTrialCode(item.id);
      }
      onUpdated();
      onClose();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mt-auto bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up-panel">
        <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon name="HandCoins" size={17} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-cormorant text-xl font-semibold truncate">{user.full_name || user.phone || "Партнёр"}</h2>
            <p className="text-xs text-muted-foreground">Партнёрская программа</p>
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

          {!isPartner ? (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Назначьте этому пользователю личное кодовое слово. Все, кто зарегистрируется и введёт это слово,
                получат тестовый тариф и закрепятся за ним в списке рефералов.
              </p>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Кодовое слово партнёра</label>
                <input
                  value={codeWord}
                  onChange={(e) => setCodeWord(e.target.value)}
                  placeholder="Например: Мария2026"
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
              <button
                onClick={assignPartner}
                disabled={saving}
                className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium disabled:opacity-60"
              >
                Сделать партнёром
              </button>
            </>
          ) : (
            <>
              <div className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Кодовое слово: «{user.partner_code_word}»</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Рефералов: {referrals ? referrals.length : (user.partner_referrals_count ?? 0)}
                  </p>
                </div>
                <button
                  onClick={removePartner}
                  disabled={removing}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium disabled:opacity-60 flex-shrink-0"
                >
                  Открепить
                </button>
              </div>

              <p className="text-xs font-medium text-muted-foreground pt-1">Пришли по коду</p>

              {loadingReferrals && (
                <div className="flex items-center justify-center py-6">
                  <Icon name="Loader" size={18} className="animate-spin text-primary" />
                </div>
              )}

              {!loadingReferrals && referrals && referrals.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Пока никто не зашёл по этому слову</p>
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
          )}
        </div>
      </div>
    </div>
  );
}
