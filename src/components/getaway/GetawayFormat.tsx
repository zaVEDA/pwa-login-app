import Icon from "@/components/ui/icon";
import ImagePlaceholder from "./ImagePlaceholder";

const formatPoints = [
  {
    icon: "Waves",
    title: "Расслабиться",
    text: "Даём телу и психике состояние покоя, чтобы вернуть себе чувствование.",
  },
  {
    icon: "BatteryCharging",
    title: "Наполниться",
    text: "Собираемся с силами и заряжаемся энергией, чтобы действовать и принимать решения из этого чувствования.",
  },
];

export default function GetawayFormat() {
  return (
    <section id="format" className="px-5 py-14 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold mb-4 tracking-wider uppercase"
          style={{ color: "hsl(140 40% 32%)" }}>
          <Icon name="Sparkles" size={14} />
          Формат
        </span>
        <h2 className="font-cormorant text-3xl md:text-4xl font-semibold mb-4" style={{ color: "hsl(24 20% 13%)" }}>
          Это не ретрит с расписанием
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          Никакой чёткой программы «по минутам» — только два главных ориентира. Мы просто выезжаем на природу — туда, где тишина, простор и настоящий Аршан.
        </p>
        <div className="space-y-4">
          {formatPoints.map((point, idx) => (
            <div key={point.title} className="flex gap-4">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-cormorant font-bold text-sm"
                style={{ background: "hsl(140 40% 45% / 0.12)", color: "hsl(140 40% 32%)" }}
              >
                {idx + 1}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "hsl(24 20% 13%)" }}>
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ImagePlaceholder label="Фото: природа / выезд" />
    </section>
  );
}