import { useState } from "react";
import Icon from "@/components/ui/icon";

const CAR_BMW_FRONT_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/2a9dfac2-182a-4b3b-bba9-f4d32dc79745.png";
const CAR_CROWN_SIDE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/f7b63fa7-f492-481e-96cd-bfea29f8616d.png";
const CAR_INTERIOR_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/466e706b-2682-4a4b-8482-62204e3717f8.png";
const CAR_CROWN_BLACK_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/34c5d05c-f0c8-4a93-a1c7-7ed186545d3c.png";

const carImages = [CAR_CROWN_SIDE_IMAGE, CAR_CROWN_BLACK_IMAGE, CAR_BMW_FRONT_IMAGE, CAR_INTERIOR_IMAGE];

const ROOM_BED_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/aa3429c8-53ec-442e-a148-1f8e58d5ef22.png";
const ROOM_LOUNGE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/f31a80f6-db70-47c5-b6cc-134e51201559.png";
const ROOM_OVERVIEW_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/68717564-0f33-48bc-8959-0f97cbc564c2.png";
const ROOM_BATHROOM_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/db757be6-3feb-49bf-a713-cd6375467db9.png";

const roomImages = [ROOM_BED_IMAGE, ROOM_LOUNGE_IMAGE, ROOM_OVERVIEW_IMAGE, ROOM_BATHROOM_IMAGE];

const roomFeatureGroups = [
  {
    title: "В номере",
    icon: "BedDouble",
    items: [
      "Кондиционирование / система климат-контроля",
      "Обогреватель",
      "Рабочее пространство",
      "Шкаф / гардероб",
      "Москитная сетка",
      "Дополнительные подушки и одеяла",
      "Светонепроницаемые шторы",
      "Балкон",
    ],
  },
  {
    title: "Ванная комната",
    icon: "ShowerHead",
    items: ["Собственный санузел", "Тапочки", "Туалетно-косметические принадлежности", "Душ"],
  },
  {
    title: "Кухня",
    icon: "CookingPot",
    items: ["Холодильник", "Столовые приборы", "Обеденный стол", "Кофе / чай", "Чайник"],
  },
  {
    title: "Электроника и развлечения",
    icon: "Tv",
    items: ["Телевизор", "WiFi"],
  },
  {
    title: "Вид",
    icon: "Mountain",
    items: ["Вид на горы и внутренний двор"],
  },
];

export default function GetawayLogistics() {
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);

  return (
    <section className="px-5 pt-14 pb-6 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 text-xs font-semibold mb-4 tracking-wider uppercase justify-center"
          style={{ color: "hsl(140 40% 32%)" }}>
          <Icon name="MapPin" size={14} />
          Организация
        </span>
        <h2 className="font-cormorant text-3xl md:text-4xl font-semibold" style={{ color: "hsl(24 20% 13%)" }}>
          Всё продумано за вас
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="grid grid-cols-2 gap-2">
          {carImages.map((img, idx) => (
            <div
              key={img}
              className="rounded-2xl overflow-hidden border-2 shadow-sm"
              style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
            >
              <img
                src={img}
                alt={`Автомобиль для поездки — фото ${idx + 1}`}
                className="w-full aspect-[4/3] object-cover"
                style={img === CAR_CROWN_SIDE_IMAGE ? { objectPosition: "50% 85%" } : undefined}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {roomImages.map((img, idx) => (
            <div
              key={img}
              className="rounded-2xl overflow-hidden border-2 shadow-sm"
              style={{ borderColor: "hsl(140 30% 55% / 0.35)" }}
            >
              <img
                src={img}
                alt={`Номер в отеле — фото ${idx + 1}`}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center -mt-6 mb-10">
        Варианты машин зависят от количества гостей
      </p>

      <div
        className="rounded-2xl border bg-white/60 overflow-hidden"
        style={{ borderColor: "hsl(36 28% 82%)" }}
      >
        <button
          type="button"
          onClick={() => setRoomDetailsOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <div>
            <h3 className="font-cormorant text-xl md:text-2xl font-bold mb-1" style={{ color: "hsl(140 40% 28%)" }}>
              Новый корпус с 18 номерами повышенной комфортности
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              В номере 2 односпальные кровати спринг-бокс, которые по необходимости объединяются в одну
              большую двуспальную. Возможно предоставление дополнительного места в виде раскладушки за
              отдельную плату. Площадь номера — 24 кв.м.
            </p>
          </div>
          <Icon
            name="ChevronDown"
            size={20}
            className="flex-shrink-0 transition-transform duration-200 mt-1"
            style={{ color: "hsl(140 40% 32%)", transform: roomDetailsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {roomDetailsOpen && (
          <div className="px-5 pb-6 grid sm:grid-cols-2 gap-6">
            {roomFeatureGroups.map((group) => (
              <div key={group.title}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={group.icon} size={16} style={{ color: "hsl(140 40% 32%)" }} />
                  <h4 className="text-sm font-semibold" style={{ color: "hsl(24 20% 13%)" }}>
                    {group.title}
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {group.items.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon
                        name="Check"
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: "hsl(140 40% 42%)" }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}