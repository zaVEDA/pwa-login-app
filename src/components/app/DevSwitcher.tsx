import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const MODES = [
  { key: "landing", label: "Лендинг", sub: "для пользователей", icon: "Globe", href: "/" },
  { key: "legal", label: "Юристу", sub: "скрытая страница", icon: "Scale", href: "/legal-flow" },
  { key: "guest", label: "Гость", sub: "вход + тестовые доки", icon: "UserRound", href: "/app?demo=1" },
  { key: "admin", label: "Заведующая", sub: "мой админ-вход", icon: "ShieldCheck", href: "/app?enter=1&admin=1" },
] as const;

export default function DevSwitcher() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") localStorage.setItem("devSwitcher", "1");
    if (params.get("dev") === "0") localStorage.removeItem("devSwitcher");
    setEnabled(localStorage.getItem("devSwitcher") === "1");
  }, []);

  if (!enabled) return null;

  const go = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-card border border-border rounded-2xl shadow-xl p-2 w-56 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground px-2 py-1.5">
            Режим просмотра
          </p>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => go(m.href)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={m.icon} size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">{m.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{m.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full gold-gradient shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
        title="Переключение режимов"
      >
        <Icon name={open ? "X" : "LayoutGrid"} size={20} />
      </button>
    </div>
  );
}
