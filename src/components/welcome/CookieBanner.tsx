import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "cookie_consent_accepted";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[70] max-w-md mx-auto"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div
        className="card-warm rounded-2xl px-4 py-4 shadow-xl border flex flex-col gap-3"
        style={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Icon name="Cookie" size={18} className="text-white" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Мы используем cookie и похожие технологии, чтобы сайт работал корректно
            и был удобнее. Продолжая пользоваться сайтом, вы соглашаетесь на их
            использование.
          </p>
        </div>
        <button
          onClick={accept}
          className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.97] transition-transform"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
