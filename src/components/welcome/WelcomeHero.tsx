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
];

export default function WelcomeHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-16 pb-14 text-center max-w-3xl mx-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(35 72% 48%), transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(140 30% 55%), transparent)" }} />
      </div>
      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-end justify-center gap-2 mb-6">
          <svg width="52" height="80" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <rect x="10" y="2" width="40" height="76" rx="10" stroke="#C8862A" strokeWidth="3.5" fill="none" />
            <rect x="19" y="2" width="18" height="7" rx="3.5" stroke="#C8862A" strokeWidth="2" fill="none" />
            <rect x="6" y="24" width="4" height="9" rx="2" fill="#C8862A" />
            <rect x="6" y="36" width="4" height="9" rx="2" fill="#C8862A" />
            <rect x="14" y="16" width="32" height="10" rx="5" stroke="#C8862A" strokeWidth="2.5" fill="none" />
            <rect x="16" y="26" width="28" height="26" stroke="#C8862A" strokeWidth="2" fill="none" />
            <rect x="14" y="52" width="32" height="10" rx="5" stroke="#C8862A" strokeWidth="2.5" fill="none" />
            <path d="M23 40 L29 47 L43 30" stroke="#C8862A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="font-cormorant font-semibold leading-tight text-3xl" style={{ color: "hsl(24 20% 13%)" }}>
            <span style={{ color: "hsl(35 72% 42%)" }}>За</span>Ведующая
          </h2>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 tracking-wider uppercase"
          style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 72% 38%)" }}>
          Документы и подписи без головной боли
        </span>
        <h1 className="font-cormorant text-4xl md:text-6xl font-semibold leading-tight mb-5"
          style={{ color: "hsl(24 20% 13%)" }}>
          Работайте легально<br />
          <span style={{ color: "hsl(35 72% 48%)" }}>без бумажной волокиты</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed font-medium">
          Договоры, чеки и согласия за пару минут с телефона. Клиент подписывает документ электронной подписью — без встреч и распечаток.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
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