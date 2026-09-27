import Icon from "@/components/ui/icon";

const includedItems = [
  {
    icon: "Route",
    title: "Трансфер Иркутск — Аршан — Байкал — Иркутск",
    text: "Доставка туда и обратно, а также выезд на Байкал в рамках программы.",
  },
  {
    icon: "Car",
    title: "Авто и водители",
    text: "Комфортный транспорт для группы до 3 человек на всё путешествие.",
  },
  {
    icon: "BedDouble",
    title: "Номер в гостинице",
    text: "Проживание в отеле в Аршане — у каждого свой номер.",
  },
  {
    icon: "Coffee",
    title: "Завтраки",
    text: "Готовим сами каждое утро и завтракаем все вместе.",
  },
  {
    icon: "Cup",
    title: "Чай, какао и вкусности по вечерам",
    text: "Общие вечерние чаепития с тёплыми напитками и угощениями.",
    fallbackIcon: "Coffee",
  },
  {
    icon: "Sandwich",
    title: "Перекусы в походах",
    text: "Берём с собой лёгкие перекусы на все прогулки и вылазки на природу.",
  },
  {
    icon: "MapPinned",
    title: "Гиды в походах",
    text: "Сопровождение на источниках, водопадах и других маршрутах.",
  },
  {
    icon: "Truck",
    title: "Транспорт до точек начала маршрутов",
    text: "Доставка до места старта каждого похода и обратно.",
  },
  {
    icon: "Flame",
    title: "Баня (1 раз)",
    text: "Один банный вечер включён в программу.",
  },
  {
    icon: "Heart",
    title: "Беседы и мероприятия",
    text: "Совместные встречи, знакомства и активности на протяжении всей поездки.",
  },
];

export default function GetawayIncluded() {
  return (
    <section className="px-5 py-14 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold mb-4 tracking-wider uppercase justify-center"
          style={{ color: "hsl(140 40% 32%)" }}
        >
          <Icon name="CheckCircle2" size={14} />
          Стоимость
        </span>
        <h2 className="font-cormorant text-3xl md:text-4xl font-semibold" style={{ color: "hsl(24 20% 13%)" }}>
          Что входит в стоимость
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {includedItems.map((item) => (
          <div
            key={item.title}
            className="flex gap-4 p-5 rounded-2xl bg-white/70 border shadow-sm"
            style={{ borderColor: "hsl(36 28% 82%)" }}
          >
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(140 40% 45% / 0.12)" }}
            >
              <Icon
                name={item.icon}
                fallback={item.fallbackIcon ?? "Check"}
                size={20}
                style={{ color: "hsl(140 40% 32%)" }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
