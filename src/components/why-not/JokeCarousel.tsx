import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";

interface Slide {
  image?: string;
  items: string[];
}

const slides: Slide[] = [
  {
    image: "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/b8ffa5bc-8027-48eb-b060-936c141309ec.jpg",
    items: [
      "Если вы ничего не продаёте и не покупаете",
      "Не сдаёте и не берёте в аренду",
      "Не приобретаете б/у вещи и не получаете разные услуги по ремонту",
    ],
  },
  {
    items: [
      "А также если у вас есть большой пустой шкаф, который нечем заполнить — и вы решили хранить там все документы 3 года",
      "Если вы НЕ получаете от клиентов НИКАКИХ персональных данных: номер телефона, ФИО, электронная почта и т.д.",
      "Вы любите работать с бумажными документами, и ваши клиенты с радостью их подписывают и отправляют вам",
    ],
  },
  {
    items: [
      "Вы редко переезжаете, путешествуете и вообще любите проводить время за компьютером с документами",
      "Вы всё время топите печку и, дабы не жечь чистую бумагу, собираете согласия на обработку перс. данных и соглашения — на бумаге",
      "Ваш ноутбук не разряжается неожиданно в самый неподходящий момент, и вы не ищете розетку в аэропорту, чтобы выставить счёт или отправить договор",
    ],
  },
];

export default function JokeCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="mb-4">
      <p className="text-base sm:text-lg font-bold text-foreground/90 leading-relaxed mb-4 px-1">
        Вам точно не нужны электронные документы, если...
      </p>

      <Carousel setApi={setApi} opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-7 shadow-sm h-full">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-64 sm:h-80 object-contain rounded-xl mb-5"
                    style={{ background: "hsl(36 25% 96%)" }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 rounded-xl mb-5 border-2 border-dashed flex flex-col items-center justify-center gap-1.5"
                    style={{ borderColor: "hsl(36 28% 82%)", background: "hsl(36 25% 96%)" }}>
                    <Icon name="ImagePlus" size={28} className="text-primary/40" />
                    <span className="text-xs text-muted-foreground/70">Здесь скоро будет картинка</span>
                  </div>
                )}
                <ul className="space-y-4">
                  {slide.items.map((r, idx) => (
                    <li key={idx} className="text-lg sm:text-xl font-bold text-foreground leading-snug pl-6 relative">
                      <span className="absolute left-0 top-1 text-primary">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            aria-label={`Слайд ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: current === i ? "20px" : "8px",
              background: current === i ? "hsl(35 72% 48%)" : "hsl(36 28% 82%)",
            }}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/70 text-center mt-2 flex items-center justify-center gap-1">
        <Icon name="Hand" size={11} />
        Листайте пальцем или стрелками →
      </p>
    </div>
  );
}