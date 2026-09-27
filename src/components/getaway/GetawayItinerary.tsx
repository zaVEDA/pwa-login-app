import { useState } from "react";
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
const DATSAN_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/a9e5f8cc-db8b-4558-8738-d95782b0a7cf.png";
const HEART_LAKE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/0e7a6a7e-a921-4810-9589-0a93ab64f6a2.jpg";
const HEART_LAKE_GIRL_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/78f4d908-2101-4a9c-97a0-3525e0f25043.jpg";
const BANYA_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/e30e5d5c-2e00-47d1-900b-08f1869daf6e.png";

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
    highlight: true,
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
  {
    day: 3,
    time: "9:00",
    icon: "Music",
    title: "Зарядка, завтрак и беседа",
    text: "Утренняя зарядка, вместе завтракаем и делимся впечатлениями за тёплой беседой.",
  },
  {
    day: 3,
    time: "Свободный день",
    icon: "Sun",
    title: "Свободное время — как душе угодно",
    text: "Можно погулять по округе, сходить на ферму маралов, съездить на источники или просто отдохнуть с книгой.",
  },
  {
    day: 4,
    time: "9:00",
    icon: "Music",
    title: "Совместный завтрак и зарядка",
    text: "Начинаем день вместе — лёгкая зарядка и завтрак в тёплой компании.",
  },
  {
    day: 4,
    time: "Поездка",
    icon: "Landmark",
    title: "Нилова пустынь и Дацан",
    text: "Едем к целебным источникам Ниловой пустыни и знакомимся с буддийским дацаном — ярким и атмосферным местом.",
    image: DATSAN_IMAGE,
  },
  {
    day: 4,
    time: "Прогулка",
    icon: "Trees",
    title: "Прогулка по эко тропе",
    text: "Неспешная прогулка на свежем воздухе по благоустроенной эко тропе среди природы.",
  },
  {
    day: 4,
    time: "Вечер",
    icon: "Coffee",
    title: "Совместное чаепитие",
    text: "Как и в предыдущие вечера, собираемся вместе за чаем — подвести итоги дня и пообщаться.",
  },
  {
    day: 5,
    time: "9:00",
    icon: "Music",
    title: "Завтрак и зарядка",
    text: "Начинаем день как обычно — вместе завтракаем и делаем лёгкую зарядку.",
  },
  {
    day: 5,
    time: "По желанию",
    icon: "Mountain",
    title: "Поездка на озеро Сердце — для желающих",
    text: "Для тех, кто хочет — поездка к живописному озеру Сердце. В вашем распоряжении будут машины и водители. Остальные могут провести день свободно.",
    images: [HEART_LAKE_IMAGE, HEART_LAKE_GIRL_IMAGE],
  },
  {
    day: 5,
    time: "Вечер",
    icon: "Flame",
    title: "Баня",
    text: "Завершаем день в тёплой бане — расслабляемся и набираемся сил.",
    image: BANYA_IMAGE,
  },
  {
    day: 6,
    time: "9:00",
    icon: "Music",
    title: "Завтрак и зарядка",
    text: "Начинаем день как обычно — вместе завтракаем и делаем лёгкую зарядку.",
  },
  {
    day: 6,
    time: "Выезд",
    icon: "Waves",
    title: "Выезд на Байкал и шашлыки",
    text: "Едем на берег Байкала — свежий воздух, красивые виды и шашлыки в компании.",
  },
  {
    day: 6,
    time: "Вечер",
    icon: "Coffee",
    title: "Чаепитие",
    text: "Завершаем день тёплым чаепитием вместе.",
  },
  {
    day: 7,
    time: "9:00",
    icon: "Music",
    title: "Завтрак и зарядка",
    text: "Последнее совместное утро — завтракаем и делаем зарядку вместе.",
  },
  {
    day: 7,
    time: "На память",
    icon: "Camera",
    title: "Фото обнимашки",
    text: "Делаем общее фото на память перед прощанием.",
  },
  {
    day: 7,
    time: "Выезд",
    icon: "Car",
    title: "Сборы и выезд в Иркутск",
    text: "Собираем вещи и отправляемся обратно в Иркутск. По дороге можно будет купить рыбку.",
  },
];

const dayLabels: Record<number, string> = {
  1: "Первый день",
  2: "Второй день",
  3: "Третий день",
  4: "Четвёртый день",
  5: "Пятый день",
  6: "Шестой день",
  7: "Седьмой день",
};

const groupByDay = () => {
  const groups: { day: number; items: typeof stops }[] = [];
  stops.forEach((stop) => {
    const last = groups[groups.length - 1];
    if (last && last.day === stop.day) last.items.push(stop);
    else groups.push({ day: stop.day, items: [stop] });
  });
  return groups;
};

export default function GetawayItinerary() {
  const dayGroups = groupByDay();
  const [openDay, setOpenDay] = useState<number | null>(dayGroups[0]?.day ?? null);

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
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-2"
          style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 60% 35%)" }}
        >
          <Icon name="CalendarClock" size={13} />
          Даты уточняются
        </span>
        <p className="text-xs text-muted-foreground">
          Расписание примерное — ориентируемся по погоде и дороге
        </p>
      </div>

      <div className="space-y-4">
        {dayGroups.map((group) => {
          const isOpen = openDay === group.day;
          const highlight = group.items.find((s) => s.highlight);
          return (
            <div
              key={group.day}
              className="rounded-2xl border bg-white/60 overflow-hidden"
              style={{ borderColor: "hsl(36 28% 82%)" }}
            >
              <div className="px-5 pt-4">
                <h3 className="font-cormorant text-xl md:text-2xl font-bold mb-3" style={{ color: "hsl(140 40% 28%)" }}>
                  {dayLabels[group.day] ?? `День ${group.day}`}
                </h3>

                {highlight && !isOpen && (
                  <div className="mb-4">
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "hsl(140 40% 32%)" }}
                    >
                      {highlight.time}
                    </span>
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "hsl(140 40% 45% / 0.12)" }}
                      >
                        <Icon name={highlight.icon} size={18} style={{ color: "hsl(140 40% 32%)" }} />
                      </div>
                      <h4 className="font-cormorant text-2xl font-semibold pt-1.5" style={{ color: "hsl(24 20% 13%)" }}>
                        {highlight.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">{highlight.text}</p>

                    {highlight.image && (
                      <div
                        className="rounded-3xl overflow-hidden border-2 shadow-sm max-w-2xl"
                        style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
                      >
                        <img
                          src={highlight.image}
                          alt={highlight.title}
                          className="w-full aspect-[16/10] object-cover"
                        />
                      </div>
                    )}

                    {highlight.images && (
                      <div className="grid grid-cols-2 gap-3 max-w-2xl">
                        {highlight.images.map((img, idx) => (
                          <div
                            key={img}
                            className="rounded-2xl overflow-hidden border-2 shadow-sm"
                            style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
                          >
                            <img
                              src={img}
                              alt={`${highlight.title} — фото ${idx + 1}`}
                              className="w-full aspect-[4/3] object-cover"
                              style={img === ARSHAN_MOUNTAINS_GIRL_IMAGE ? { objectPosition: "50% 15%" } : undefined}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOpenDay(isOpen ? null : group.day)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left border-t"
                style={{ borderColor: "hsl(36 28% 88%)" }}
              >
                <span className="text-sm font-medium" style={{ color: "hsl(140 40% 32%)" }}>
                  {isOpen ? "Скрыть остальные события дня" : "Показать остальные события дня"}
                </span>
                <Icon
                  name="ChevronDown"
                  size={20}
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{ color: "hsl(140 40% 32%)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {isOpen && (
                <div className="relative pl-8 md:pl-10 pr-5 pb-6">
                  <div
                    className="absolute left-3 md:left-4 top-0 bottom-6 w-px"
                    style={{ background: "hsl(140 30% 55% / 0.35)" }}
                  />

                  <div className="space-y-10">
                    {group.items.map((stop) => (
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
                          <h4 className="font-cormorant text-2xl font-semibold pt-1.5" style={{ color: "hsl(24 20% 13%)" }}>
                            {stop.title}
                          </h4>
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
                                  style={img === ARSHAN_MOUNTAINS_GIRL_IMAGE ? { objectPosition: "50% 15%" } : undefined}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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