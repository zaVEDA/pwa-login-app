import Icon from "@/components/ui/icon";

export default function GetawayFooter() {
  return (
    <footer className="px-5 py-10 border-t" style={{ borderColor: "hsl(36 28% 82%)" }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="font-cormorant text-lg font-bold mb-1" style={{ color: "hsl(140 40% 28%)" }}>
            Getaway · Байкал и Аршан
          </p>
          <p className="text-xs text-muted-foreground">Путешествие — возвращение к себе</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <a href="tel:+79016625752" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:opacity-70"
            style={{ color: "hsl(140 40% 28%)" }}>
            <Icon name="Phone" size={15} />
            +7 901 662-57-52
          </a>
          <a href="https://t.me/+79016625752" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:opacity-70"
            style={{ color: "hsl(140 40% 28%)" }}>
            <Icon name="Send" size={15} />
            Telegram
          </a>
          <a href="mailto:89016625752@mail.ru" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:opacity-70"
            style={{ color: "hsl(140 40% 28%)" }}>
            <Icon name="Mail" size={15} />
            89016625752@mail.ru
          </a>
        </div>
      </div>
    </footer>
  );
}
