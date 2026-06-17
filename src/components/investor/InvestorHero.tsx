import Icon from "@/components/ui/icon";

const DEMO_URL = window.location.origin + "/?demo=1";

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
];

const audienceExtra = [
  { emoji: "🏠", label: "Арендодатели" },
];

export default function InvestorHero() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(35 72% 48%), transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(140 30% 55%), transparent)" }} />
        </div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 tracking-wider uppercase"
            style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 72% 38%)" }}>
            Инвестиционное предложение · Раунд 1
          </span>
          <p className="font-cormorant text-2xl font-medium mb-2" style={{ color: "hsl(35 72% 42%)" }}>ООО «ЗаВедующая»</p>
          <h1 className="font-cormorant text-5xl md:text-6xl font-semibold leading-tight mb-5"
            style={{ color: "hsl(24 20% 13%)" }}>
            Сервис мобильного документооборота<br />
            <span style={{ color: "hsl(35 72% 48%)" }}>для помогающих специалистов</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Психологи, консультанты и коучи теряют время и деньги на бумажную работу. 
            Мы решаем это одним приложением.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 42%))", color: "white" }}
            >
              <Icon name="Smartphone" size={16} />
              Открыть демо приложения
            </a>
            <a href="#invest"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm border transition-all hover:bg-white/60"
              style={{ borderColor: "hsl(36 28% 82%)", color: "hsl(24 20% 13%)" }}>
              <Icon name="TrendingUp" size={16} />
              Условия инвестирования
            </a>
          </div>
        </div>
      </section>

      {/* Аудитория */}
      <section className="px-5 py-10 max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          {audience.map((a) => (
            <div key={a.label} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 border shadow-sm text-sm font-medium"
              style={{ borderColor: "hsl(36 28% 82%)" }}>
              <span className="text-xl">{a.emoji}</span>
              {a.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5 mb-2.5">
          {audienceMore.map((a) => (
            <div key={a.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 border text-xs font-medium text-foreground/70"
              style={{ borderColor: "hsl(36 28% 85%)" }}>
              <span className="text-base">{a.emoji}</span>
              {a.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {audienceExtra.map((a) => (
            <div key={a.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 border text-xs font-medium text-foreground/70"
              style={{ borderColor: "hsl(36 28% 85%)" }}>
              <span className="text-base">{a.emoji}</span>
              {a.label}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}