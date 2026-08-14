import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
const PLAN_PAYMENT_URL = "https://functions.poehali.dev/5c0694ef-904a-425c-b8f9-2e179922854b";

interface PromoStatus {
  total: number;
  taken: number;
  left: number;
  until: string;
  active: boolean;
}

export function usePromoStatus(pollMs = 60000) {
  const [promo, setPromo] = useState<PromoStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(PLAN_PAYMENT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "promo_status" }),
        });
        const data = await res.json();
        if (alive && data?.ok) setPromo(data);
      } catch {
        /* сеть недоступна — просто не показываем акцию */
      }
    };
    load();
    const t = setInterval(load, pollMs);
    return () => { alive = false; clearInterval(t); };
  }, [pollMs]);

  return promo;
}

interface Props {
  compact?: boolean;
  onWant?: () => void;
}

export default function PromoTemplateBanner({ compact = false, onWant }: Props) {
  const promo = usePromoStatus();
  if (!promo || !promo.active) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl text-center shadow-sm border ${compact ? "px-4 py-4" : "px-6 py-6"}`}
      style={{
        background: "linear-gradient(150deg, hsl(45 60% 96%), hsl(38 48% 92%))",
        borderColor: "hsl(35 55% 72%)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "linear-gradient(90deg, hsl(35 72% 52%), hsl(42 82% 58%))" }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Icon
            name="Gift"
            size={compact ? 18 : 22}
            className="flex-shrink-0"
            style={{ color: "hsl(35 72% 42%)" }}
          />
          <p
            className={`font-bold tracking-tight ${compact ? "text-base" : "text-xl"}`}
            style={{ color: "hsl(24 30% 16%)" }}
          >
            Шаблон документа в подарок
          </p>
        </div>

        <p
          className={`font-semibold mx-auto max-w-md leading-snug ${compact ? "text-[13px]" : "text-[15px]"}`}
          style={{ color: "hsl(24 18% 30%)" }}
        >
          Первым 12 клиентам тарифа «Рост» на 6 месяцев —
          <br className="hidden sm:block" /> разработаем 1 шаблон по вашему запросу
        </p>

        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 42%))" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className={`font-bold text-white ${compact ? "text-xs" : "text-sm"}`}>
              Осталось {promo.left} из {promo.total}
            </span>
          </span>
          <span
            className={`font-bold ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: "hsl(35 72% 38%)" }}
          >
            до 21 августа 2026
          </span>
        </div>

        <button
          type="button"
          onClick={onWant}
          className={`mt-3.5 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-white shadow-md active:scale-[0.98] transition-transform ${
            compact ? "px-5 py-2.5 text-sm" : "px-7 py-3 text-base"
          }`}
          style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 42%))" }}
        >
          <Icon name="Sparkles" size={compact ? 15 : 17} className="flex-shrink-0" />
          Хочу шаблон
        </button>

        <p
          className={`mt-3 mx-auto max-w-md leading-relaxed ${compact ? "text-[10px]" : "text-[11px]"}`}
          style={{ color: "hsl(24 12% 48%)" }}
        >
          * Если ваша деятельность экологична — не работаем с кальянными,
          вейп-магазинами, алкоголем, казино/ставки и т.п.
        </p>
      </div>
    </div>
  );
}
