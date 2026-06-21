import Icon from "@/components/ui/icon";

const APP_URL = window.location.origin;
const DEMO_URL = window.location.origin + "/?demo=1";

const investOptions = [
  {
    title: "Минимальный вход",
    amount: "от 350 000 ₽",
    color: "hsl(38 40% 94%)",
    border: "hsl(36 28% 82%)",
    items: [
      "Договор процентного займа (официально)",
      "Ставка 36% годовых, срок 12–15 мес.",
      "Досрочный возврат до 4 мес. — ставка 10%",
    ],
  },
  {
    title: "Полное финансирование",
    amount: "1 500 000 ₽",
    color: "linear-gradient(135deg, hsl(35 72% 48% / 0.08), hsl(40 80% 62% / 0.12))",
    border: "hsl(35 72% 48% / 0.35)",
    accent: true,
    items: [
      "Те же условия займа",
      "Приоритет участия во 2-м раунде",
      "Возможность получить долю в ООО от 1%",
    ],
  },
];

export default function InvestorInvest() {
  return (
    <>
      {/* Условия инвестирования */}
      <section id="invest" className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Инвестирование</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Условия участия · Раунд 1
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {investOptions.map((opt, i) => (
            <div key={i} className="p-6 rounded-2xl border"
              style={{ background: opt.color, borderColor: opt.border, boxShadow: opt.accent ? "0 4px 24px hsl(35 72% 48% / 0.12)" : undefined }}>
              {opt.accent && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
                  style={{ background: "hsl(35 72% 48%)", color: "white" }}>Приоритет</span>
              )}
              <h3 className="font-cormorant text-xl font-semibold mb-1">{opt.title}</h3>
              <p className="font-cormorant text-4xl font-semibold mb-4" style={{ color: "hsl(35 72% 38%)" }}>{opt.amount}</p>
              <ul className="space-y-2">
                {opt.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/75">
                    <Icon name="CheckCircle" size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 2 раунд */}
        <div className="p-5 rounded-2xl border"
          style={{ background: "hsl(38 30% 93%)", borderColor: "hsl(36 28% 82%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Repeat2" size={16} style={{ color: "hsl(35 72% 42%)" }} />
            <span className="text-sm font-semibold">Второй раунд — через 2,5–3 месяца</span>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/70">
            <li>• Отчёт о проделанной работе и показателях</li>
            <li>• Финансовая модель и бизнес-план</li>
            <li>• Финансирование рекламы и разработки мобильной версии</li>
            <li>• Действующий инвестор получает предложение первым</li>
          </ul>
        </div>
      </section>

      {/* Контакты */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Связаться</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Готовы обсудить участие?
        </h2>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "hsl(36 28% 82%)" }}>
          <div className="p-6 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48% / 0.08), hsl(40 80% 62% / 0.1))" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 42%))" }}>
              <span className="font-cormorant text-2xl font-bold text-white">ЮК</span>
            </div>
            <div>
              <p className="font-semibold text-base">Кузнецова Юлия</p>
              <p className="text-sm text-muted-foreground mt-0.5">Основатель проекта · Москва (МСК)</p>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(36 28% 86%)" }}>
            <a href="tel:+79016625752"
              className="flex items-center gap-4 px-6 py-4 bg-white/60 hover:bg-white/90 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name="Phone" size={16} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Телефон</p>
                <p className="text-sm font-medium">+7 901 662-57-52</p>
              </div>
            </a>
            <a href="https://t.me/+79016625752" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 px-6 py-4 bg-white/60 hover:bg-white/90 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(200 80% 50% / 0.1)" }}>
                <Icon name="Send" size={16} className="text-sky-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Telegram</p>
                <p className="text-sm font-medium">+7 901 662-57-52</p>
              </div>
            </a>
            <a href="mailto:89016625752@mail.ru"
              className="flex items-center gap-4 px-6 py-4 bg-white/60 hover:bg-white/90 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name="Mail" size={16} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">E-mail</p>
                <p className="text-sm font-medium">89016625752@mail.ru</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 max-w-3xl mx-auto">
        <div className="rounded-3xl p-10 relative overflow-hidden text-center"
          style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 40%))" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
          <h2 className="font-cormorant text-3xl font-semibold text-white mb-3 relative z-10">
            Посмотрите прототип
          </h2>
          <p className="text-white/80 text-sm mb-6 relative z-10">
            Работающее PWA-приложение доступно прямо сейчас — без регистрации
          </p>
          <div className="flex justify-center relative z-10">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03]"
              style={{ background: "white", color: "hsl(35 72% 38%)" }}
            >
              <Icon name="Smartphone" size={16} />
              Открыть демо
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 text-center border-t" style={{ borderColor: "hsl(36 28% 82%)" }}>
        <p className="font-cormorant text-lg font-medium mb-1" style={{ color: "hsl(35 72% 42%)" }}>ООО «ЗаВедующая»</p>
        <p className="text-xs text-muted-foreground">Инвестиционное предложение · 2026</p>
      </footer>
    </>
  );
}