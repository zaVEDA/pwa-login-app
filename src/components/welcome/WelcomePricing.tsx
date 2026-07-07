import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

const PRESALE_UNTIL = new Date("2026-07-15T23:59:59");
const isPresale = new Date() <= PRESALE_UNTIL;

const paidPlans = [
  { id: "start", label: "Опора", desc: "До 15 документов в месяц, до 9 подписей по смс, шаблоны из базы", icon: "Sprout", month: 1444, halfYear: 6868, presaleHalfYear: 5955 },
  { id: "medium", label: "Рост", desc: "Безграничное создание документов, до 33 подписей по смс в месяц", icon: "TrendingUp", month: 3333, halfYear: 15555, presaleHalfYear: 12333, popular: true },
  { id: "pro", label: "Творец", desc: "До 88 подписей по смс в месяц, свой шаблон + доп. шаблоны за доплату", icon: "PenTool", month: 7777, halfYear: 38888, presaleHalfYear: 33777 },
];

export default function WelcomePricing() {
  return (
    <section id="pricing" className="px-5 py-14 max-w-3xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Тарифы</p>
      <h2 className="font-cormorant text-3xl font-semibold mb-3 text-center" style={{ color: "hsl(24 20% 13%)" }}>
        Выберите подходящий тариф
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto mb-3">
        Зайдите и ознакомьтесь с приложением уже сейчас, а оплачивать подписку начнёте, когда работа пойдёт активно.
      </p>
      <p className="text-xs font-semibold text-center mb-8" style={{ color: "hsl(35 72% 38%)" }}>
        Запуск первой версии приложения — с 15 июля
      </p>

      {isPresale && (
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 mb-8 max-w-md mx-auto">
          <Icon name="Sparkles" size={14} className="text-primary flex-shrink-0" />
          <p className="text-xs text-primary font-medium">Предпродажа по сниженной цене на подписку 6 месяцев — до 15 июля</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {paidPlans.map((p) => {
          const halfYearPrice = isPresale ? p.presaleHalfYear : p.halfYear;
          return (
            <a key={p.id} href="/"
              onClick={() => reachGoal("welcome_pricing_plan_click", { plan: p.id })}
              className={`block p-5 rounded-2xl border relative transition-transform hover:scale-[1.02] ${p.popular ? "shadow-md" : "bg-white/60"}`}
              style={{
                borderColor: p.popular ? "hsl(35 72% 48% / 0.4)" : "hsl(36 28% 82%)",
                background: p.popular ? "linear-gradient(145deg, hsl(35 72% 48% / 0.08), hsl(40 80% 62% / 0.12))" : undefined,
              }}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: "hsl(35 72% 48%)", color: "white" }}>Популярный</span>
              )}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: p.popular ? "hsl(35 72% 48%)" : "hsl(35 72% 48% / 0.12)" }}>
                <Icon name={p.icon} size={20} className={p.popular ? "text-white" : ""} style={!p.popular ? { color: "hsl(35 72% 42%)" } : undefined} />
              </div>
              <h3 className="font-cormorant text-xl font-semibold mb-1">{p.label}</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed min-h-[48px]">{p.desc}</p>
              <div className="mb-1">
                <span className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>{p.month.toLocaleString("ru-RU")} ₽</span>
                <span className="text-xs text-muted-foreground"> /мес</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground">
                {isPresale && <span className="line-through opacity-60 mr-1">{p.halfYear.toLocaleString("ru-RU")} ₽</span>}
                {halfYearPrice.toLocaleString("ru-RU")} ₽ за 6 мес.
              </p>
            </a>
          );
        })}
      </div>

      <div className="mt-6 px-5 py-3.5 rounded-xl bg-primary/10 border border-primary/20 text-center">
        <p className="text-sm font-bold" style={{ color: "hsl(35 72% 38%)" }}>
          При покупке тарифа на 6 месяцев отсчёт подписки начнётся с 1 сентября
        </p>
      </div>
    </section>
  );
}