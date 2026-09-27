import Icon from "@/components/ui/icon";
import ImagePlaceholder from "./ImagePlaceholder";

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
        <p className="text-base text-muted-foreground leading-relaxed">
          Никакой чёткой программы «по минутам». Мы просто выезжаем на природу — туда, где тишина, простор и настоящий Байкал. Без психологов, коучей и тренингов. Только мы.
        </p>
      </div>
      <ImagePlaceholder label="Фото: природа / выезд" />
    </section>
  );
}
