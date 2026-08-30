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
    image: "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/0a9f382e-5c66-47df-af3d-2bd4813c4a9c.jpg",
    items: [
      "Если вы ничего не продаёте и не покупаете",
      "Не сдаёте и не берёте в аренду",
      "Не приобретаете б/у вещи и не получаете разные услуги по ремонту",
    ],
  },
  { items: ["А также если у вас есть большой пустой шкаф, который нечем заполнить — и вы решили хранить там все документы 3 года"] },
  { items: ["Если вы НЕ получаете от клиентов НИКАКИХ персональных данных: номер телефона, ФИО, электронная почта и т.д."] },
  { items: ["Вы любите работать с бумажными документами, и ваши клиенты с радостью их подписывают и отправляют вам"] },
  { items: ["Вы редко переезжаете, путешествуете и вообще любите проводить время за компьютером с документами"] },
  { items: ["Вы всё время топите печку и, дабы не жечь чистую бумагу, собираете согласия на обработку перс. данных и соглашения — на бумаге"] },
  { items: ["Ваш ноутбук не разряжается неожиданно в самый неподходящий момент, и вы не ищете розетку в аэропорту, чтобы выставить счёт или отправить договор"] },
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

      <div className="relative">
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {slides.map((slide, i) => (
              <CarouselItem key={i}>
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-7 shadow-sm h-full flex flex-col">
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt=""
                      className="w-full aspect-[16/9] object-cover rounded-xl mb-5"
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] rounded-xl mb-5 border-2 border-dashed flex flex-col items-center justify-center gap-1.5"
                      style={{ borderColor: "hsl(36 28% 82%)", background: "hsl(36 25% 96%)" }}>
                      <Icon name="ImagePlus" size={28} className="text-primary/40" />
                      <span className="text-xs text-muted-foreground/70">Здесь скоро будет картинка</span>
                    </div>
                  )}
                  <ul className={`space-y-4 flex-1 ${slide.items.length === 1 ? "flex items-center justify-center" : ""}`}>
                    {slide.items.map((r, idx) => (
                      <li
                        key={idx}
                        className={
                          slide.items.length === 1
                            ? "text-xl sm:text-2xl font-bold text-foreground leading-snug text-center px-2"
                            : "text-lg sm:text-xl font-bold text-foreground leading-snug pl-6 relative"
                        }
                      >
                        {slide.items.length > 1 && <span className="absolute left-0 top-1 text-primary">•</span>}
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <button
          onClick={() => api?.scrollPrev()}
          aria-label="Предыдущий слайд"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-border flex items-center justify-center active:scale-90 transition-transform"
        >
          <Icon name="ChevronLeft" size={18} className="text-primary" />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          aria-label="Следующий слайд"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-border flex items-center justify-center active:scale-90 transition-transform"
        >
          <Icon name="ChevronRight" size={18} className="text-primary" />
        </button>
      </div>

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
    </div>
  );
}