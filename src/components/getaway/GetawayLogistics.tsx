import Icon from "@/components/ui/icon";
import ImagePlaceholder from "./ImagePlaceholder";

const CAR_BMW_FRONT_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/2a9dfac2-182a-4b3b-bba9-f4d32dc79745.png";
const CAR_CROWN_SIDE_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/f7b63fa7-f492-481e-96cd-bfea29f8616d.png";
const CAR_INTERIOR_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/466e706b-2682-4a4b-8482-62204e3717f8.png";
const CAR_CROWN_BLACK_IMAGE =
  "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/bucket/34c5d05c-f0c8-4a93-a1c7-7ed186545d3c.png";

const carImages = [CAR_CROWN_SIDE_IMAGE, CAR_CROWN_BLACK_IMAGE, CAR_BMW_FRONT_IMAGE, CAR_INTERIOR_IMAGE];

const items = [
  { icon: "Car", title: "Доставка", text: "Организую выезд из города до места и обратно — на люксовых авто на протяжении всего путешествия." },
  { icon: "BedDouble", title: "Проживание", text: "Размещаемся в гостинице — у каждого свой номер и комфортные условия." },
  { icon: "Coffee", title: "Завтраки", text: "Каждое утро готовлю сама и приглашаю всех в свой домик." },
  { icon: "Sunrise", title: "Зарядка", text: "По утрам собираемся вместе — мягкая зарядка на природе." },
];

export default function GetawayLogistics() {
  return (
    <section className="px-5 py-14 max-w-5xl mx-auto">
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
        <ImagePlaceholder label="Фото: авто / дорога" />
        <ImagePlaceholder label="Фото: номер / гостиница" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4 p-5 rounded-2xl bg-white/70 border shadow-sm"
            style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(140 40% 45% / 0.12)" }}>
              <Icon name={item.icon} size={20} style={{ color: "hsl(140 40% 32%)" }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold mb-4 tracking-wider uppercase justify-center"
            style={{ color: "hsl(140 40% 32%)" }}
          >
            <Icon name="Car" size={14} />
            Транспорт и дорога
          </span>
          <h2 className="font-cormorant text-3xl md:text-4xl font-semibold" style={{ color: "hsl(24 20% 13%)" }}>
            Едем с комфортом
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <p className="text-sm text-muted-foreground text-center mt-4">
          Варианты машин зависят от количества гостей
        </p>
      </div>
    </section>
  );
}