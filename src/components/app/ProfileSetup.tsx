import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser } from "@/lib/auth";

interface Props {
  user: AuthUser;
  onDone: (u: AuthUser) => void;
  onSkip: () => void;
}

const formatPhone = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "").replace(/^8/, "7");
  if (d.length < 11) return raw;
  return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
};

export default function ProfileSetup({ user, onDone, onSkip }: Props) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || user.login || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passOk = password.length >= 6 && /^[\x20-\x7E]+$/.test(password);

  const handleSave = async () => {
    setError("");
    const mail = email.trim().toLowerCase();
    if (!fullName.trim()) return setError("Напишите, как к вам обращаться");
    if (!mail) return setError("Укажите электронную почту");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return setError("Проверьте адрес почты");
    if (password.length < 6) return setError("Пароль не короче 6 символов");
    if (!/^[\x20-\x7E]+$/.test(password)) return setError("Пароль — только латинские буквы, цифры и знаки");
    setLoading(true);
    try {
      const r = await authApi.updateProfile({ full_name: fullName.trim(), email: mail, login: mail, password });
      if (r.status !== 200) { setError(r.data.error || "Не удалось сохранить"); return; }
      onDone(r.data.user);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-10 px-5 overflow-y-auto max-w-md mx-auto"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}
    >
      <div className="w-full animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Icon name="UserCheck" size={24} className="text-white" />
          </div>
          <h1 className="font-cormorant text-3xl font-semibold">Заполните профиль</h1>
          <p className="text-sm text-muted-foreground mt-1">Эти данные понадобятся для входа</p>
        </div>

        <div className="card-warm rounded-2xl p-6 shadow-lg shadow-amber-900/10 space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Номер телефона</label>
            <div className="w-full px-4 py-3 rounded-xl border border-border bg-black/[0.03] text-sm flex items-center gap-2">
              <Icon name="Check" size={14} className="text-green-600 flex-shrink-0" />
              <span className="flex-1">{formatPhone(user.phone)}</span>
              <span className="text-[11px] text-muted-foreground">подтверждён</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Как к вам обращаться</label>
            <input
              type="text"
              autoCapitalize="words"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.slice(0, 40))}
              placeholder="Например, Анна Петровна"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Обязательно. Может не совпадать с официальными данными
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Электронная почта (она же логин)</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mail.ru"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">По ней входите и восстанавливаете доступ</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                <Icon name={showPass ? "EyeOff" : "Eye"} size={17} />
              </button>
            </div>
            <p className={`text-[11px] mt-1 ${password && !passOk ? "text-amber-700" : "text-muted-foreground"}`}>
              От 6 символов: латинские буквы, цифры и знаки
            </p>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Icon name="Loader" size={15} className="animate-spin" />}
            Сохранить и продолжить
          </button>
          <button onClick={onSkip} className="w-full py-1 text-xs text-muted-foreground">Пропустить пока</button>
        </div>
      </div>
    </div>
  );
}