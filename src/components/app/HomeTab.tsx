import { useState } from "react";
import Icon from "@/components/ui/icon";
import InvoiceModal from "@/components/app/InvoiceModal";

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const themes = {
  honey: {
    label: "Янтарь",
    phraseIcon: "Leaf",
    phraseBg: "linear-gradient(135deg, hsl(40 60% 93%), hsl(38 50% 90%))",
    phraseBorder: "hsl(38 40% 82%)",
    phraseIconBg: "hsl(38 60% 85%)",
    phraseIconColor: "text-amber-700",
    phraseLabel: "text-amber-600",
    phraseText: "text-amber-950",
  },
  sage: {
    label: "Шалфей",
    phraseIcon: "Sprout",
    phraseBg: "linear-gradient(135deg, hsl(140 25% 92%), hsl(145 20% 89%))",
    phraseBorder: "hsl(140 20% 80%)",
    phraseIconBg: "hsl(140 30% 84%)",
    phraseIconColor: "text-emerald-700",
    phraseLabel: "text-emerald-600",
    phraseText: "text-emerald-950",
  },
  rose: {
    label: "Роза",
    phraseIcon: "Flower2",
    phraseBg: "linear-gradient(135deg, hsl(345 40% 93%), hsl(340 35% 90%))",
    phraseBorder: "hsl(345 30% 82%)",
    phraseIconBg: "hsl(345 40% 86%)",
    phraseIconColor: "text-rose-600",
    phraseLabel: "text-rose-500",
    phraseText: "text-rose-950",
  },
  clay: {
    label: "Глина",
    phraseIcon: "TreePine",
    phraseBg: "linear-gradient(135deg, hsl(20 40% 92%), hsl(18 35% 89%))",
    phraseBorder: "hsl(20 30% 81%)",
    phraseIconBg: "hsl(20 40% 84%)",
    phraseIconColor: "text-orange-800",
    phraseLabel: "text-orange-700",
    phraseText: "text-orange-950",
  },
} as const;

interface Props {
  colorTheme: keyof typeof themes;
  todayPhrase: string;
  setActiveTab: (t: Tab) => void;
  phone: string;
}

export default function HomeTab({ colorTheme, todayPhrase, setActiveTab, phone }: Props) {
  const theme = themes[colorTheme];
  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <div className="space-y-6 animate-slide-up">
      {showInvoice && <InvoiceModal onClose={() => setShowInvoice(false)} phone={phone} />}
      {/* Мотивирующая фраза дня */}
      <div className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: theme.phraseBg, border: `1px solid ${theme.phraseBorder}` }}>
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: theme.phraseIconBg }}>
            <Icon name={theme.phraseIcon} size={16} className={theme.phraseIconColor} />
          </div>
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${theme.phraseLabel}`}>Мысль дня</p>
            <p className={`font-cormorant text-lg font-medium leading-snug italic ${theme.phraseText}`}>«{todayPhrase}»</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-cormorant text-xl font-semibold mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowInvoice(true)}
            className="card-dark rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <Icon name="FilePlus" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Создать документ</p>
            <p className="text-xs text-muted-foreground mt-0.5">Договор, акт, счёт</p>
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name="LayoutTemplate" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Шаблоны</p>
            <p className="text-xs text-muted-foreground mt-0.5">Под вашу деятельность</p>
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name="GraduationCap" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">База знаний</p>
            <p className="text-xs text-muted-foreground mt-0.5">Законы и инструкции</p>
          </button>
          <button className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name="BarChart3" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Учёт доходов</p>
            <p className="text-xs text-muted-foreground mt-0.5">Доходы и налоги</p>
          </button>
        </div>
      </div>

      {/* Tax reminder */}
      <div
        className="rounded-2xl p-4 border border-primary/30"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.07))" }}
      >
        <div className="flex gap-3 items-start mb-3">
          <Icon name="Bell" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Налог за май</p>
            <p className="text-xs text-muted-foreground mt-0.5">До 25 июня нужно оплатить ₽1 872 в приложении «Мой налог»</p>
          </div>
        </div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.open("https://lknpd.nalog.ru/", "_blank"); }}
          className="w-full py-2 rounded-xl bg-primary/15 text-primary text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <Icon name="ExternalLink" size={12} />
          Открыть «Мой налог»
        </a>
      </div>
    </div>
  );
}