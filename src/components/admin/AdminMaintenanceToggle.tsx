import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";
import { toast } from "sonner";

export default function AdminMaintenanceToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authApi.getMaintenance().then(({ data }) => {
      setEnabled(Boolean(data.maintenance));
    }).catch(() => setEnabled(false));
  }, []);

  const toggle = async () => {
    if (enabled === null || saving) return;
    const next = !enabled;
    setSaving(true);
    const { status, data } = await authApi.adminSetMaintenance(next);
    setSaving(false);
    if (status !== 200) {
      toast.error(data.error || "Не удалось изменить настройку");
      return;
    }
    setEnabled(next);
    localStorage.setItem("maintenanceCache", next ? "1" : "0");
    toast.success(next ? "Заглушка включена для всех" : "Заглушка выключена — вход открыт");
  };

  const on = enabled === true;

  return (
    <div className="rounded-2xl border border-border bg-white/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${on ? "bg-amber-100" : "bg-green-100"}`}>
            <Icon name={on ? "Construction" : "DoorOpen"} size={18} className={on ? "text-amber-600" : "text-green-600"} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight">
              {enabled === null ? "Загрузка…" : on ? "Заглушка включена" : "Заглушка выключена"}
            </p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
              {on
                ? "Все пользователи видят «Приложение в разработке»"
                : "Вход в приложение открыт для всех"}
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          disabled={enabled === null || saving}
          role="switch"
          aria-checked={on}
          className={`relative w-14 h-8 rounded-full flex-shrink-0 transition-colors disabled:opacity-50 ${on ? "bg-amber-500" : "bg-muted-foreground/30"}`}
          title={on ? "Выключить заглушку" : "Включить заглушку"}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`}
          />
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
        Ваш вход Заведующей и режим «Гость» работают всегда, независимо от заглушки.
      </p>
    </div>
  );
}
