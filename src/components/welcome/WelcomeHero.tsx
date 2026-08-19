import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

const audience = [
  { emoji: "🧠", label: "Психологи" },
  { emoji: "🎯", label: "Коучи" },
  { emoji: "💬", label: "Консультанты" },
  { emoji: "✨", label: "Мастера" },
];

const audienceMore = [
  { emoji: "📸", label: "Фотографы" },
  { emoji: "👶", label: "Няни" },
  { emoji: "📚", label: "Репетиторы" },
  { emoji: "🏠", label: "Арендодатели" },
  { emoji: "🎨", label: "Дизайнеры" },
  { emoji: "🚕", label: "Водители такси" },
  { emoji: "💻", label: "Программисты" },
  { emoji: "⚡", label: "Электрики" },
  { emoji: "🔧", label: "Сантехники" },
  { emoji: "🧹", label: "Феи чистоты" },
];

export default function WelcomeHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-12 pb-8 text-center max-w-3xl mx-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(35 72% 48%), transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(140 30% 55%), transparent)" }} />
      </div>
      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-end justify-center gap-2 mb-6">
          <img src="/logo-capydoc.png" alt="CapyDoc.ru" width="78" height="78" className="flex-shrink-0 rounded-xl" />
          <div className="flex flex-col items-stretch text-left">
            <span className="flex justify-between mx-auto text-[22px] font-black uppercase leading-none" style={{ color: "hsl(24 20% 13%)", width: "90%" }}>
              {"Сервис".split("").map((ch, i) => <span key={i}>{ch}</span>)}
            </span>
            <span className="font-cormorant font-semibold text-[36px] leading-tight whitespace-nowrap">
              <span style={{ color: "hsl(35 72% 42%)" }}>Capy</span><span style={{ color: "hsl(24 20% 13%)" }}>Doc.ru</span>
            </span>
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 tracking-wider uppercase"
          style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 72% 38%)" }}>
          Документы с подписью без головной боли
        </span>
        <h1 className="font-cormorant text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight mb-5"
          style={{ color: "hsl(24 20% 13%)" }}>
          Работайте легально<br />
          <span style={{ color: "hsl(35 72% 48%)" }}>без бумажной волокиты</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-2 leading-relaxed font-medium">
          Договоры, счета, акты, согласие на фото/видео съемку, перс.данные и другие документы за пару минут с телефона. Клиент подписывает документ электронной подписью по СМС — без встреч и распечаток.
        </p>
        <a
          href="/sms-operators"
          className="inline-flex items-center gap-1 text-sm font-medium mb-8 hover:underline underline-offset-2"
          style={{ color: "hsl(35 72% 42%)" }}
        >
          <Icon name="Signal" size={14} />
          Поддерживаемые операторы связи
        </a>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/app"
            onClick={() => reachGoal("welcome_hero_start")}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 42%))", color: "white" }}
          >
            <Icon name="Eye" size={16} />
            Зайти и ознакомиться
          </a>
          <a href="#pricing"
            onClick={() => reachGoal("welcome_hero_pricing_click")}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm border transition-all hover:scale-[1.02]"
            style={{ borderColor: "hsl(36 28% 82%)", color: "hsl(24 20% 13%)", background: "white" }}>
            <Icon name="Tag" size={16} />
            Смотреть тарифы
          </a>
        </div>

        {/* Аудитория */}
        <div className="mt-9 flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-3">
            {audience.map((a) => (
              <div key={a.label} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 border shadow-sm text-sm font-medium"
                style={{ borderColor: "hsl(36 28% 82%)" }}>
                <span className="text-xl">{a.emoji}</span>
                {a.label}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {audienceMore.map((a) => (
              <div key={a.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 border text-xs font-medium text-foreground/70"
                style={{ borderColor: "hsl(36 28% 82%)" }}>
                <span className="text-base">{a.emoji}</span>
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}