import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser, PlanType, getToken } from "@/lib/auth";

const PLAN_PAYMENT_URL = "https://functions.poehali.dev/5c0694ef-904a-425c-b8f9-2e179922854b";
const PRESALE_UNTIL = new Date("2026-07-15T23:59:59");
const isPresale = new Date() <= PRESALE_UNTIL;

interface PaidPlanOption {
  id: "start" | "medium" | "pro";
  label: string;
  desc: string;
  icon: string;
  month: number;
  halfYear: number;
  presaleHalfYear: number;
}

const paidPlans: PaidPlanOption[] = [
  { id: "start", label: "Опора", desc: "До 15 документов в месяц, до 9 подписей по ПЭП, шаблоны из базы", icon: "Sprout", month: 1444, halfYear: 6868, presaleHalfYear: 5955 },
  { id: "medium", label: "Рост", desc: "Безграничное создание документов, до 33 подписей по ПЭП в месяц", icon: "TrendingUp", month: 3333, halfYear: 15555, presaleHalfYear: 12333 },
  { id: "pro", label: "Творец", desc: "До 88 подписей по ПЭП в месяц, свой шаблон + доп. шаблоны за доплату", icon: "PenTool", month: 7777, halfYear: 38888, presaleHalfYear: 33777 },
];

interface Props {
  currentPlan: PlanType | null;
  familyRequestStatus?: "pending" | "approved" | "rejected" | null;
  onClose: () => void;
  onSelected: (user: AuthUser) => void;
}

export default function PlanModal({ currentPlan, familyRequestStatus, onClose, onSelected }: Props) {
  const [openPlan, setOpenPlan] = useState<PaidPlanOption["id"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeWord, setCodeWord] = useState("");
  const [familySent, setFamilySent] = useState(false);

  const payPlan = async (plan: PaidPlanOption["id"], period: "month" | "half_year") => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(PLAN_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() },
        body: JSON.stringify({
          plan,
          period,
          success_url: `${window.location.origin}/?payment=success`,
          fail_url: `${window.location.origin}/?payment=fail`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError(data.error || "Не удалось начать оплату");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const sendFamilyRequest = async () => {
    setError("");
    if (!codeWord.trim()) {
      setError("Введите кодовое слово");
      return;
    }
    setLoading(true);
    try {
      const { status, data } = await authApi.requestFamilyPlan(codeWord.trim());
      if (status === 200) {
        setFamilySent(true);
      } else {
        setError(data.error || "Не удалось отправить заявку");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-background" />
      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50 flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
          <h2 className="font-cormorant text-2xl font-semibold">Выбрать тариф</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {isPresale && (
            <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Icon name="Sparkles" size={14} className="text-primary flex-shrink-0" />
              <p className="text-xs text-primary">Предпродажа: скидка на подписку 6 месяцев — до 15 июля</p>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {paidPlans.map((p) => {
            const active = currentPlan === p.id;
            const open = openPlan === p.id;
            const halfYearPrice = isPresale ? p.presaleHalfYear : p.halfYear;
            return (
              <div key={p.id} className={`rounded-2xl border overflow-hidden transition-all ${active ? "border-primary/50 bg-primary/10" : "border-border bg-white/60"}`}>
                <button
                  onClick={() => setOpenPlan(open ? null : p.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "gold-gradient" : "bg-primary/10"}`}>
                    <Icon name={p.icon} size={18} className={active ? "text-white" : "text-primary"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                  {active ? (
                    <Icon name="CheckCircle" size={18} className="text-primary flex-shrink-0" />
                  ) : (
                    <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-2">
                    <button
                      onClick={() => payPlan(p.id, "month")}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-border text-left disabled:opacity-60"
                    >
                      <span className="text-xs font-medium">1 месяц</span>
                      <span className="text-sm font-semibold">{p.month.toLocaleString("ru-RU")} ₽</span>
                    </button>
                    <button
                      onClick={() => payPlan(p.id, "half_year")}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl gold-gradient text-white text-left disabled:opacity-60"
                    >
                      <span className="text-xs font-medium">6 месяцев {isPresale && "· предпродажа"}</span>
                      <span className="flex items-center gap-1.5">
                        {isPresale && <span className="text-[10px] line-through opacity-70">{p.halfYear.toLocaleString("ru-RU")} ₽</span>}
                        <span className="text-sm font-semibold">{halfYearPrice.toLocaleString("ru-RU")} ₽</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Для родных */}
          <div className={`rounded-2xl border p-4 ${currentPlan === "family" ? "border-primary/50 bg-primary/10" : "border-border bg-white/60"}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${currentPlan === "family" ? "gold-gradient" : "bg-primary/10"}`}>
                <Icon name="Heart" size={18} className={currentPlan === "family" ? "text-white" : "text-primary"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Для родных</p>
                <p className="text-xs text-muted-foreground mt-0.5">Бесплатный доступ по кодовому слову — заявку подтверждает администратор</p>
              </div>
              {currentPlan === "family" && <Icon name="CheckCircle" size={18} className="text-primary flex-shrink-0" />}
            </div>

            {currentPlan !== "family" && (
              familySent || familyRequestStatus === "pending" ? (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-2">
                  <Icon name="Clock" size={13} />
                  Заявка отправлена, ожидайте подтверждения
                </div>
              ) : familyRequestStatus === "rejected" ? (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mt-2">
                  <Icon name="XCircle" size={13} />
                  Заявка отклонена. Проверьте кодовое слово и попробуйте снова
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input
                    value={codeWord}
                    onChange={(e) => setCodeWord(e.target.value)}
                    placeholder="Кодовое слово"
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={sendFamilyRequest}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl gold-gradient text-white text-xs font-medium flex-shrink-0 disabled:opacity-60"
                  >
                    Отправить
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}