import Icon from "@/components/ui/icon";
import ImagePlaceholder from "./ImagePlaceholder";

export default function GetawayAtmosphere() {
  return (
    <section className="px-5 py-14 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
      <ImagePlaceholder label="Фото: атмосфера / отдых" className="order-2 md:order-1" />
      <div className="order-1 md:order-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold mb-4 tracking-wider uppercase"
          style={{ color: "hsl(140 40% 32%)" }}>
          <Icon name="Heart" size={14} />
          Атмосфера
        </span>
        <h2 className="font-cormorant text-3xl md:text-4xl font-semibold mb-4" style={{ color: "hsl(24 20% 13%)" }}>
          Пространство, где можно отпустить
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Я создаю доброжелательную обстановку, в которой люди забывают о заботах и расслабляются. Мы учимся слышать сигналы своего тела в соединении с природой и тишиной — без давления и программы, в своём темпе.
        </p>
      </div>
    </section>
  );
}
