import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, setToken, AuthUser } from "@/lib/auth";

const specialtyColors = [
  { emoji: "🧠", label: "Психолог", bg: "linear-gradient(135deg, #FDCEDF, #F17EAA)" },
  { emoji: "🎯", label: "Коуч", bg: "linear-gradient(135deg, #FFE5B4, #FF9F45)" },
  { emoji: "🔮", label: "Астролог", bg: "linear-gradient(135deg, #D6C7FF, #9B7BFF)" },
  { emoji: "✨", label: "Нумеролог", bg: "linear-gradient(135deg, #C9F2E0, #4FBF8B)" },
  { emoji: "📚", label: "Репетитор", bg: "linear-gradient(135deg, #C7E4FF, #5B9BF5)" },
  { emoji: "👶", label: "Няня", bg: "linear-gradient(135deg, #FFE9C7, #F5B95B)" },
  { emoji: "📷", label: "Фотограф", bg: "linear-gradient(135deg, #D6E8FF, #7BAEFF)" },
  { emoji: "🏠", label: "Арендодатель", bg: "linear-gradient(135deg, #FFD9C7, #F58B5B)" },
  { emoji: "✨", label: "Мастер", bg: "linear-gradient(135deg, #F5D9FF, #C77BFF)" },
  { emoji: "💬", label: "Консультант", bg: "linear-gradient(135deg, #C7FFF0, #5BE0C7)" },
  { emoji: "💻", label: "Программист", bg: "linear-gradient(135deg, #D0D9FF, #6B7FE8)" },
  { emoji: "🎭", label: "Актёр", bg: "linear-gradient(135deg, #FFD6E0, #F55B8B)" },
  { emoji: "🧹", label: "Фея чистоты", bg: "linear-gradient(135deg, #E0F5FF, #6BC7F5)" },
];

type Mode = "phone" | "code" | "password" | "recover" | "recover_code" | "recover_new" | "admin";

interface Props {
  selectedSpecialty: string | null;
  setSelectedSpecialty: (v: string | null) => void;
  onAuth: (user: AuthUser) => void;
  onDemo: () => void;
}

export default function LoginScreen({ selectedSpecialty, setSelectedSpecialty, onAuth, onDemo }: Props) {
  const [mode, setMode] = useState<Mode>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [recoverChannel, setRecoverChannel] = useState<"sms" | "email">("sms");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");

  const busy = (fn: () => Promise<void>) => async () => {
    setError("");
    setLoading(true);
    try { await fn(); } catch { setError("Ошибка сети. Попробуйте ещё раз."); }
    finally { setLoading(false); }
  };

  const handlePhoneNext = busy(async () => {
    if (phone.replace(/\D/g, "").length < 10) return setError("Введите корректный номер");
    if (!consent) return setError("Нужно согласие на обработку данных");
    const chk = await authApi.checkDevice(phone);
    if (chk.data.exists && chk.data.trusted && chk.data.has_password) {
      setMode("password");
      setLogin(phone);
      return;
    }
    const r = await authApi.requestCode({ purpose: "login", channel: "sms", phone });
    if (r.status !== 200) return setError(r.data.error || "Не удалось отправить код");
    setDevCode(r.data.dev_code || "");
    setMode("code");
  });

  const handleVerifyCode = busy(async () => {
    const r = await authApi.verifyCode({ purpose: "login", channel: "sms", phone, code });
    if (r.status !== 200) return setError(r.data.error || "Неверный код");
    setToken(r.data.token);
    onAuth(r.data.user);
  });

  const handlePassword = busy(async () => {
    const r = await authApi.loginPassword({ login, password });
    if (r.status !== 200) return setError(r.data.error || "Неверный логин или пароль");
    setToken(r.data.token);
    onAuth(r.data.user);
  });

  const handleRecoverRequest = busy(async () => {
    const p = recoverChannel === "sms" ? { phone } : { email };
    const r = await authApi.requestCode({ purpose: "reset", channel: recoverChannel, ...p });
    if (r.status !== 200) return setError(r.data.error || "Не удалось отправить код");
    setDevCode(r.data.dev_code || "");
    setMode("recover_code");
  });

  const handleRecoverVerify = busy(async () => {
    const p = recoverChannel === "sms" ? { phone } : { email };
    const r = await authApi.verifyCode({ purpose: "reset", channel: recoverChannel, code, ...p });
    if (r.status !== 200) return setError(r.data.error || "Неверный код");
    setToken(r.data.token);
    setMode("recover_new");
  });

  const handleRecoverNew = busy(async () => {
    if (password.length < 6) return setError("Пароль не короче 6 символов");
    const r = await authApi.resetPassword(password);
    if (r.status !== 200) return setError(r.data.error || "Не удалось сменить пароль");
    const me = await authApi.me();
    if (me.data.user) onAuth(me.data.user);
  });

  const handleAdmin = busy(async () => {
    const r = await authApi.loginPassword({ login: login || "zaVed", password });
    if (r.status !== 200) return setError(r.data.error || "Неверный логин или пароль");
    setToken(r.data.token);
    onAuth(r.data.user);
  });

  const errBlock = error && (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
      <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-600">{error}</p>
    </div>
  );

  const devBlock = devCode && (
    <p className="text-[11px] text-center text-muted-foreground">Демо-режим: код <span className="font-semibold text-primary">{devCode}</span></p>
  );

  const titles: Record<Mode, string> = {
    phone: "Войти в аккаунт",
    code: "Введите код из SMS",
    password: "Вход по паролю",
    recover: "Восстановление доступа",
    recover_code: "Введите код",
    recover_new: "Новый пароль",
    admin: "Вход для Заведующей",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-8 px-5 overflow-y-auto"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 50%, hsl(30 25% 87%) 100%)" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-end gap-2 mb-8" style={{ alignItems: "flex-end" }}>
          <svg width="72" height="112" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" style={{ marginRight: "-5px", marginTop: "12px" }}>
            <rect x="10" y="2" width="40" height="76" rx="10" stroke="#C8862A" strokeWidth="3.5" fill="none" />
            <rect x="19" y="2" width="18" height="7" rx="3.5" stroke="#C8862A" strokeWidth="2" fill="none" />
            <rect x="6" y="24" width="4" height="9" rx="2" fill="#C8862A" />
            <rect x="6" y="36" width="4" height="9" rx="2" fill="#C8862A" />
            <rect x="14" y="16" width="32" height="10" rx="5" stroke="#C8862A" strokeWidth="2.5" fill="none" />
            <rect x="16" y="26" width="28" height="26" stroke="#C8862A" strokeWidth="2" fill="none" />
            <rect x="14" y="52" width="32" height="10" rx="5" stroke="#C8862A" strokeWidth="2.5" fill="none" />
            <path d="M23 40 L29 47 L43 30" stroke="#C8862A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h1 className="font-cormorant font-semibold text-foreground leading-tight" style={{ fontSize: "3.4rem" }}>
              <span style={{ color: "hsl(35 72% 42%)" }}>За</span>Ведующая
            </h1>
            <p className="font-cormorant italic font-semibold text-foreground/90 leading-tight text-center whitespace-nowrap" style={{ fontSize: "1.7rem", letterSpacing: "0.12em" }}>
              Вашими документами
            </p>
          </div>
        </div>

        {/* Specialties */}
        {mode === "phone" && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-8 max-w-[380px] mx-auto">
            {specialtyColors.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSpecialty(s.label === selectedSpecialty ? null : s.label)}
                className={`flex items-center gap-1 pl-1 pr-2.5 py-1 rounded-full text-xs font-normal transition-all duration-200 border ${
                  selectedSpecialty === s.label
                    ? "shadow-sm border-transparent"
                    : "bg-white/80 border-border text-foreground hover:border-primary/40"
                }`}
                style={
                  selectedSpecialty === s.label
                    ? { background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 72% 38%)" }
                    : undefined
                }
              >
                <span className="w-4 h-4 flex items-center justify-center text-xs flex-shrink-0">
                  {s.emoji}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="card-warm rounded-2xl p-6 shadow-lg shadow-amber-900/10 space-y-4">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">{titles[mode]}</h2>
            <p className="text-muted-foreground text-sm">
              {mode === "phone" && "Первый вход — по номеру телефона через ПЭП"}
              {mode === "code" && `Код отправлен на ${phone}`}
              {mode === "password" && "Устройство распознано — введите пароль"}
              {mode === "recover" && "Выберите способ восстановления"}
              {mode === "recover_code" && "Введите код из сообщения"}
              {mode === "recover_new" && "Придумайте новый пароль"}
              {mode === "admin" && "Логин и пароль Заведующей"}
            </p>
          </div>

          {errBlock}

          {/* PHONE */}
          {mode === "phone" && (
            <>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+7</span>
                <input
                  type="tel"
                  placeholder="900 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
                />
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Я подписываю простой электронной подписью (ПЭП) согласие на обработку персональных данных и принимаю{" "}
                  <span className="text-primary">условия использования</span>
                </span>
              </label>
              <button
                onClick={handlePhoneNext}
                disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Продолжить
              </button>
            </>
          )}

          {/* SMS CODE */}
          {(mode === "code" || mode === "recover_code") && (
            <>
              {devBlock}
              <input
                type="tel"
                inputMode="numeric"
                placeholder="0000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                autoFocus
                className="w-full text-center tracking-[0.5em] text-xl font-semibold py-3 rounded-xl border border-border bg-white/70 outline-none focus:border-primary"
              />
              <button
                onClick={mode === "code" ? handleVerifyCode : handleRecoverVerify}
                disabled={loading || code.length < 4}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Подтвердить
              </button>
              <button onClick={() => { setMode(mode === "code" ? "phone" : "recover"); setCode(""); setError(""); }} className="w-full py-1 text-xs text-muted-foreground">
                Назад
              </button>
            </>
          )}

          {/* PASSWORD LOGIN */}
          {mode === "password" && (
            <>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handlePassword}
                disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Войти
              </button>
              <div className="flex items-center justify-between">
                <button onClick={() => { setMode("recover"); setError(""); }} className="text-xs text-primary">Забыли пароль?</button>
                <button onClick={() => { setMode("phone"); setPassword(""); setError(""); }} className="text-xs text-muted-foreground">Войти по SMS</button>
              </div>
            </>
          )}

          {/* RECOVER CHOICE */}
          {mode === "recover" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRecoverChannel("sms")}
                  className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${recoverChannel === "sms" ? "border-primary gold-gradient text-white" : "border-border bg-white/60"}`}
                >
                  По SMS
                </button>
                <button
                  onClick={() => setRecoverChannel("email")}
                  className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${recoverChannel === "email" ? "border-primary gold-gradient text-white" : "border-border bg-white/60"}`}
                >
                  По Email
                </button>
              </div>
              {recoverChannel === "sms" ? (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+7</span>
                  <input type="tel" placeholder="900 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
                </div>
              ) : (
                <input type="email" placeholder="you@mail.ru" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
              )}
              <button onClick={handleRecoverRequest} disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Отправить код
              </button>
              <button onClick={() => { setMode("phone"); setError(""); }} className="w-full py-1 text-xs text-muted-foreground">Назад</button>
            </>
          )}

          {/* RECOVER NEW PASSWORD */}
          {mode === "recover_new" && (
            <>
              <input type="password" placeholder="Новый пароль (мин. 6 символов)" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
              <button onClick={handleRecoverNew} disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Сохранить и войти
              </button>
            </>
          )}

          {/* ADMIN */}
          {mode === "admin" && (
            <>
              <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
              <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
              <button onClick={handleAdmin} disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Войти
              </button>
              <p className="text-[11px] text-center text-muted-foreground">Первый вход — введённый пароль станет постоянным</p>
              <button onClick={() => { setMode("phone"); setError(""); }} className="w-full py-1 text-xs text-muted-foreground">Назад</button>
            </>
          )}
        </div>

        {mode === "phone" && (
          <>
            <button onClick={onDemo}
              className="w-full mt-4 py-2.5 rounded-xl gold-gradient text-white text-xs font-medium shadow-sm shadow-amber-900/20 active:scale-[0.98] transition-transform">
              Посмотреть без регистрации →
            </button>
            <button onClick={() => { setMode("admin"); setError(""); }} className="w-full mt-3 py-1 text-[11px] text-muted-foreground">
              Вход для Заведующей
            </button>
          </>
        )}
      </div>
    </div>
  );
}