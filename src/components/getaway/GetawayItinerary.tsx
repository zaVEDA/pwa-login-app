import Icon from "@/components/ui/icon";

const CHURCH_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/f84cbca9-5a37-4c1a-921d-212a1ce131ad.png";
const BAIKAL_SHORE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/248c1cc8-24dc-4a8d-b960-741dd2e969c6.png";
const OMUL_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/65456cd1-1ecc-401b-970c-619d2a53b757.png";
const HOTEL_VIEW_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/e14124e1-7a6a-4079-b041-d20cc1e4adec.png";
const HOTEL_ROOM_VIEW_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/914dd1cb-bef7-4fce-93ac-2bbffbd0a472.png";
const HOTEL_ROOM_DETAILS_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/385a0cd3-58d7-4ae0-8fe7-c058d4c86b0a.png";
const MARAL_FARM_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/e749c1f7-3771-4fd6-a361-3d4b84ecf0e9.png";
const MATCHA_COCOA_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/f44ccb2e-7a56-4d32-b2ac-d561e6eaefb3.png";
const GIFTS_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/5ec7b3d0-073c-4f09-ad27-b35b3e17a3f6.png";
const CAFE_DRINKS_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/94e6a1bb-c1c0-40a1-a73f-3a1eeb9ac82a.png";
const MORNING_DANCE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/b6c3e6e7-564c-4d79-9392-84ebfb053036.jpg";
const ARSHAN_GORGE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/bddc5e84-2c20-4f6e-94c1-8eb9f1de79ab.jpg";
const ARSHAN_MOUNTAINS_GIRL_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/51fc9493-2e31-4011-bc52-ead7ccffdec3.jpg";
const ARSHAN_SKY_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/cb832e8e-23a9-42a2-9529-d51aeafa8e9e.jpg";

const stops = [
  {
    day: 1,
    time: "10:00",
    icon: "Car",
    title: "Старт из Иркутска",
    text: "Забираем каждого с указанного адреса на комфортных авто — никуда добираться самостоятельно не нужно.",
  },
  {
    day: 1,
    time: "День 1",
    icon: "Church",
    title: "Храм Казанской иконы Божией Матери",
    text: "Усть-Куда, 1803 год. Один из старейших действующих храмов Иркутской области — тихое и намоленное место для начала пути.",
    image: CHURCH_IMAGE,
  },
  {
    day: 1,
    time: "По пути",
    icon: "Waves",
    title: "Выходим поздороваться с Байкалом",
    text: "Остановимся на берегу — подышать, полюбоваться простором и сделать красивые фотографии, прежде чем ехать дальше в Аршан.",
    image: BAIKAL_SHORE_IMAGE,
  },
  {
    day: 1,
    time: "По пути",
    icon: "Fish",
    title: "Покупаем омуля",
    text: "Заедем за настоящим байкальским омулем — свежим или копчёным, чтобы попробовать в дороге и привезти гостинец.",
    image: OMUL_IMAGE,
  },
  {
    day: 1,
    time: "Аршан",
    icon: "Mountain",
    title: "Заселяемся в отель с видом и фермой маралов",
    text: "Номера с видом на горы и панорамные окна на природу. А рядом — своя ферма маралов, куда можно прийти познакомиться поближе.",
    images: [HOTEL_VIEW_IMAGE, HOTEL_ROOM_VIEW_IMAGE, HOTEL_ROOM_DETAILS_IMAGE, MARAL_FARM_IMAGE],
  },
  {
    day: 1,
    time: "Аршан",
    icon: "UtensilsCrossed",
    title: "Обедаем рыбкой и вкусностями вместе",
    text: "Садимся за общий стол — омуль и другие вкусности, приготовленные специально для нас.",
  },
  {
    day: 1,
    time: "Аршан",
    icon: "Luggage",
    title: "Отдыхаем и раскладываем вещи",
    text: "Немного времени, чтобы перевести дух и устроиться в номере — без спешки.",
  },
  {
    day: 1,
    time: "До 20:00",
    icon: "Camera",
    title: "Идём на ферму маралов",
    text: "Фотографируемся, наслаждаемся видами и свежим воздухом — успеваем застать маралов до вечера.",
  },
  {
    day: 1,
    time: "Вечер",
    icon: "Soup",
    title: "Ужинаем в кафе — по желанию",
    text: "Ужин самостоятельно: выбираем кафе по вкусу и настроению.",
    image: CAFE_DRINKS_IMAGE,
  },
  {
    day: 1,
    time: "~19:30",
    icon: "Gift",
    title: "Вечернее какао, знакомство и подарочки",
    text: "Собираемся на 1,5–2 часа за какао или матчей — знакомимся друг с другом и получаем небольшие подарочки.",
    images: [MATCHA_COCOA_IMAGE, GIFTS_IMAGE],
  },
  {
    day: 2,
    time: "9:00",
    icon: "Music",
    title: "Зарядка и завтрак",
    text: "Утром просыпаемся под лёгкую танцевальную зарядку на кухне, а затем вместе завтракаем.",
    image: MORNING_DANCE_IMAGE,
  },
  {
    day: 2,
    time: "День 2",
    icon: "TreePine",
    title: "Выезжаем на источники и водопады Аршана",
    text: "Небольшой поход с потрясающими видами на горы и ущелья. А рядом можно будет купить местные чаи, ягоды и травы.",
    images: [ARSHAN_GORGE_IMAGE, ARSHAN_MOUNTAINS_GIRL_IMAGE, ARSHAN_SKY_IMAGE],
  },
  {
    day: 2,
    time: "Обед и ужин",
    icon: "Soup",
    title: "Обедаем и ужинаем в кафе — по желанию",
    text: "Питание самостоятельно: выбираем кафе по вкусу и настроению.",
  },
  {
    day: 2,
    time: "Вечер",
    icon: "Coffee",
    title: "Встречаемся за чаем, какао и матча",
    text: "Собираемся вместе на пару часов — тёплый чай, какао или матча и приятные разговоры.",
  },
];

const dayLabels: Record<number, string> = {
  1: "Первый день",
  2: "Второй день",
  3: "Третий день",
};

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
          Как проходит путешествие
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
          {stops.map((stop, index) => {
            const isNewDay = index === 0 || stops[index - 1].day !== stop.day;
            return (
            <div key={stop.title}>
              {isNewDay && (
                <h3
                  className="font-cormorant text-xl md:text-2xl font-bold mb-4"
                  style={{ color: "hsl(140 40% 28%)" }}
                >
                  {dayLabels[stop.day] ?? `День ${stop.day}`}
                </h3>
              )}
              <div className="relative">
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
                    alt={stop.title}
                    className="w-full aspect-[16/10] object-cover"
                  />
                </div>
              )}

              {stop.images && (
                <div className="grid grid-cols-2 gap-3 max-w-2xl">
                  {stop.images.map((img, idx) => (
                    <div
                      key={img}
                      className="rounded-2xl overflow-hidden border-2 shadow-sm"
                      style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
                    >
                      <img
                        src={img}
                        alt={`${stop.title} — фото ${idx + 1}`}
                        className="w-full aspect-[4/3] object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
            );
          })}
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