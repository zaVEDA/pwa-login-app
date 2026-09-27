import Icon from "@/components/ui/icon";

const HERO_COVER_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/47414a47-24fe-4be4-bdab-df78329ad1ac.jpg";

export default function GetawayHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-20 pb-14 max-w-5xl mx-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(140 40% 45%), transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(35 72% 48%), transparent)" }} />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 tracking-wider uppercase"
          style={{ background: "hsl(140 40% 45% / 0.12)", color: "hsl(140 40% 30%)" }}>
          Getaway · Байкал и Аршан
        </span>
        <h1 className="font-cormorant text-4xl md:text-6xl font-semibold leading-tight mb-5"
          style={{ color: "hsl(24 20% 13%)" }}>
          Путешествие —<br />
          <span style={{ color: "hsl(140 40% 38%)" }}>возвращение к себе</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed font-medium">
          Без психологов и целей — просто время для тела, чтобы отдохнуть, и для души, чтобы наполниться. Возможность прокричаться в горах и наконец позволить себе проживать настоящие чувства.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#format"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, hsl(140 40% 42%), hsl(140 40% 32%))", color: "white" }}>
            <Icon name="Compass" size={16} />
            Узнать подробнее
          </a>
        </div>
      </div>

      <div
        className="relative z-10 rounded-3xl overflow-hidden border-2 shadow-sm aspect-[4/3] max-w-md mx-auto"
        style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
      >
        <img
          src={HERO_COVER_IMAGE}
          alt="Аршан — вид на горное озеро"
          className="w-full h-full object-cover object-top"
        />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-10">
        <span
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-semibold shadow-sm"
          style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 60% 35%)" }}
        >
          <Icon name="CalendarClock" size={18} />
          Старт с 12 октября
        </span>
        <span
          className="relative inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold shadow-md animate-pulse"
          style={{
            background: "linear-gradient(135deg, hsl(0 70% 58%), hsl(0 65% 48%))",
            color: "white",
            boxShadow: "0 0 0 4px hsl(0 70% 58% / 0.15), 0 4px 16px hsl(0 65% 48% / 0.35)",
          }}
        >
          <Icon name="Users" size={18} />
          Мини-группа — всего 6 мест
        </span>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Количество мест ограничено — набор закрывается по факту заполнения группы
      </p>
    </section>
  );
}