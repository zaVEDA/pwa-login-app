import Icon from "@/components/ui/icon";

const CHURCH_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/f84cbca9-5a37-4c1a-921d-212a1ce131ad.png";

const stops = [
  {
    time: "10:00",
    icon: "Car",
    title: "Старт из Иркутска",
    text: "Забираем каждого с указанного адреса на комфортных авто — никуда добираться самостоятельно не нужно.",
  },
  {
    time: "День 1",
    icon: "Church",
    title: "Храм Казанской иконы Божией Матери",
    text: "Усть-Куда, 1803 год. Один из старейших действующих храмов Иркутской области — тихое и намоленное место для начала пути.",
    image: CHURCH_IMAGE,
  },
];

export default function GetawayItinerary() {
  return (
    <section id="route" className="px-5 py-14 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold mb-4 tracking-wider uppercase justify-center"
          style={{ color: "hsl(140 40% 32%)" }}
        >
          <Icon name="Route" size={14} />
          Маршрут
        </span>
        <h2 className="font-cormorant text-3xl md:text-4xl font-semibold mb-3" style={{ color: "hsl(24 20% 13%)" }}>
          Как проходит первый день
        </h2>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 60% 35%)" }}
        >
          <Icon name="CalendarClock" size={13} />
          Даты уточняются
        </span>
      </div>

      <div className="relative pl-8 md:pl-10">
        <div
          className="absolute left-3 md:left-4 top-2 bottom-2 w-px"
          style={{ background: "hsl(140 30% 55% / 0.35)" }}
        />

        <div className="space-y-10">
          {stops.map((stop) => (
            <div key={stop.title} className="relative">
              <div
                className="absolute -left-8 md:-left-10 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4"
                style={{ background: "hsl(140 40% 42%)", borderColor: "hsl(38 35% 96%)" }}
              >
              </div>

              <span
                className="inline-block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "hsl(140 40% 32%)" }}
              >
                {stop.time}
              </span>

              <div className="flex items-start gap-3 mb-2">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(140 40% 45% / 0.12)" }}
                >
                  <Icon name={stop.icon} size={18} style={{ color: "hsl(140 40% 32%)" }} />
                </div>
                <h3 className="font-cormorant text-2xl font-semibold pt-1.5" style={{ color: "hsl(24 20% 13%)" }}>
                  {stop.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">{stop.text}</p>

              {stop.image && (
                <div
                  className="rounded-3xl overflow-hidden border-2 shadow-sm max-w-2xl"
                  style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
                >
                  <img
                    src={stop.image}
                    alt="Храм Казанской иконы Божией Матери, Усть-Куда"
                    className="w-full aspect-[16/10] object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-white/70 border shadow-sm"
        style={{ borderColor: "hsl(36 28% 82%)" }}
      >
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(35 72% 48% / 0.12)" }}
        >
          <Icon name="BedDouble" size={20} style={{ color: "hsl(35 60% 40%)" }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1">Гостиницы в центре Иркутска</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Отдельно предложу несколько вариантов комфортных гостиниц в центре Иркутска — выберем вместе перед поездкой.
          </p>
        </div>
      </div>
    </section>
  );
}
