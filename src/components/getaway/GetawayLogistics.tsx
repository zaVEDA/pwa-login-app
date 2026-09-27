import Icon from "@/components/ui/icon";
import ImagePlaceholder from "./ImagePlaceholder";

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
    </section>
  );
}
