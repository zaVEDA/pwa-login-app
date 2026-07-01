import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser } from "@/lib/auth";

interface Props {
  user: AuthUser;
  onDone: (u: AuthUser) => void;
  onSkip: () => void;
}

export default function ProfileSetup({ user, onDone, onSkip }: Props) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [login, setLogin] = useState(user.login || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!fullName.trim()) return setError("Укажите ФИО");
    if (!login.trim()) return setError("Придумайте логин");
    if (password.length < 6) return setError("Пароль не короче 6 символов");
    setLoading(true);
    try {
      const r = await authApi.updateProfile({ full_name: fullName.trim(), email: email.trim(), login: login.trim(), password });
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
          <p className="text-sm text-muted-foreground mt-1">Эти данные понадобятся для входа и документов</p>
        </div>

        <div className="card-warm rounded-2xl p-6 shadow-lg shadow-amber-900/10 space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ФИО</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иванова Анна Сергеевна"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Электронная почта</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.ru"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
            <p className="text-[11px] text-muted-foreground mt-1">Понадобится для восстановления доступа</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Логин</label>
            <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="anna_smirnova"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 6 символов"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
            <p className="text-[11px] text-muted-foreground mt-1">Дальше сможете входить по логину и паролю</p>
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
