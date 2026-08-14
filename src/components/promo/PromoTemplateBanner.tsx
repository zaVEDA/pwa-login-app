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
}

export default function PromoTemplateBanner({ compact = false }: Props) {
  const promo = usePromoStatus();
  if (!promo || !promo.active) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-md ${compact ? "px-4 py-3.5" : "px-6 py-5"}`}
      style={{ background: "linear-gradient(135deg, hsl(152 45% 34%), hsl(160 48% 27%))" }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(25%, -25%)" }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Gift" size={compact ? 16 : 20} className="text-white flex-shrink-0" />
          <p className={`font-bold text-white ${compact ? "text-sm" : "text-lg"}`}>
            Шаблон документа в подарок
          </p>
        </div>

        <p className={`text-white/90 font-medium ${compact ? "text-xs" : "text-sm"}`}>
          Первым 12 клиентам тарифа «Рост» на 6 месяцев — разработаем 1 шаблон по вашему запросу
        </p>

        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold text-white">
              Осталось {promo.left} из {promo.total}
            </span>
          </span>
          <span className="text-xs text-white/80 font-medium">до 21 августа</span>
        </div>

        <p className={`text-white/70 mt-2 leading-relaxed ${compact ? "text-[10px]" : "text-[11px]"}`}>
          * Если ваша деятельность экологична — не работаем с кальянными, вейп-магазинами, алкоголем и т.п.
        </p>
      </div>
    </div>
  );
}
