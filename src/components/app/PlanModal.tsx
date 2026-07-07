import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser, PlanType } from "@/lib/auth";

interface PlanOption {
  id: PlanType;
  label: string;
  desc: string;
  icon: string;
}

const plans: PlanOption[] = [
  { id: "start", label: "Начальный", desc: "Базовые возможности для старта", icon: "Sprout" },
  { id: "medium", label: "Средний", desc: "Больше документов и функций", icon: "TrendingUp" },
  { id: "pro", label: "Про", desc: "Полный набор инструментов", icon: "Crown" },
  { id: "family", label: "Для родных", desc: "Общий доступ для семьи", icon: "Heart" },
];

interface Props {
  currentPlan: PlanType | null;
  onClose: () => void;
  onSelected: (user: AuthUser) => void;
}

export default function PlanModal({ currentPlan, onClose, onSelected }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState("");

  const choose = async (plan: PlanType) => {
    setError("");
    setLoadingPlan(plan);
    try {
      const { status, data } = await authApi.setPlan(plan);
      if (status === 200 && data.user) {
        onSelected(data.user);
        onClose();
      } else {
        setError(data.error || "Не удалось выбрать тариф");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoadingPlan(null);
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
          <p className="text-xs text-muted-foreground leading-relaxed">
            Выберите тариф — это закрепит его за вашим аккаунтом. Оплата и различия между тарифами появятся позже.
          </p>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {plans.map((p) => {
            const active = currentPlan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => choose(p.id)}
                disabled={loadingPlan !== null}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left active:scale-[0.98] transition-transform disabled:opacity-60 ${
                  active ? "border-primary/50 bg-primary/10" : "border-border bg-white/60"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "gold-gradient" : "bg-primary/10"}`}>
                  <Icon name={p.icon} size={18} className={active ? "text-white" : "text-primary"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
                {loadingPlan === p.id ? (
                  <Icon name="Loader" size={16} className="animate-spin text-primary flex-shrink-0" />
                ) : active ? (
                  <Icon name="CheckCircle" size={18} className="text-primary flex-shrink-0" />
                ) : (
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
