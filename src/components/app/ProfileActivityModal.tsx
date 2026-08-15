import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser } from "@/lib/auth";

interface Props {
  user?: AuthUser | null;
  fullName: string;
  phone: string;
  onClose: () => void;
  onSaved?: (user: AuthUser) => void;
}

const formatPhone = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "").replace(/^8/, "7");
  if (d.length < 11) return raw;
  return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
};

export default function ProfileActivityModal({ user, fullName, phone, onClose, onSaved }: Props) {
  const [name, setName] = useState(user?.full_name || fullName || "");
  const [activity, setActivity] = useState(user?.activity_description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const nameOk = name.trim().length > 0;
  const activityOk = activity.trim().length >= 5;

  const handleSave = async () => {
    setError("");
    setDone(false);
    if (!nameOk) return setError("Напишите, как к вам обращаться");
    if (!activityOk) return setError("Опишите, чем вы занимаетесь");
    setLoading(true);
    try {
      const r = await authApi.updateProfile({
        full_name: name.trim(),
        activity_description: activity.trim(),
      });
      if (r.status !== 200) {
        setError(r.data.error || "Не удалось сохранить");
        return;
      }
      onSaved?.(r.data.user);
      setDone(true);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col mx-auto"
      style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}
    >
      <div className="absolute inset-0 bg-background" />
      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center"
          >
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
          <h2 className="font-cormorant text-2xl font-semibold">Профиль и деятельность</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <Icon name="CheckCircle" size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700">Изменения сохранены</p>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Номер телефона</label>
            <div className="w-full px-4 py-3 rounded-xl border border-border bg-black/[0.03] text-sm flex items-center gap-2">
              <Icon name="Check" size={14} className="text-green-600 flex-shrink-0" />
              <span className="flex-1">{formatPhone(phone)}</span>
              <span className="text-[11px] text-muted-foreground">подтверждён</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Как к вам обращаться</label>
            <input
              type="text"
              autoCapitalize="words"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 40));
                setDone(false);
              }}
              placeholder="Например, Анна Петровна"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Может не совпадать с официальными данными
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Чем вы занимаетесь</label>
            <textarea
              rows={5}
              value={activity}
              onChange={(e) => {
                setActivity(e.target.value.slice(0, 500));
                setDone(false);
              }}
              placeholder="Например: психолог, консультирую онлайн, работаю со взрослыми"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className={`text-[11px] ${activity && !activityOk ? "text-amber-700" : "text-muted-foreground"}`}>
                Своими словами — так мы подберём для вас нужные документы
              </p>
              <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">{activity.length}/500</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !nameOk || !activityOk}
            className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Icon name="Loader" size={15} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
