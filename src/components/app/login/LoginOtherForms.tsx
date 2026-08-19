import Icon from "@/components/ui/icon";
import PuzzleCaptcha from "@/components/auth/PuzzleCaptcha";
import PhoneInput from "@/components/ui/phone-input";
import { useLoginScreen } from "./useLoginScreen";

type State = ReturnType<typeof useLoginScreen>;

interface Props {
  m: State;
  devBlock: React.ReactNode;
}

export default function LoginOtherForms({ m, devBlock }: Props) {
  const {
    mode, setMode,
    phone, setPhone,
    code, setCode,
    login, setLogin,
    password, setPassword,
    email, setEmail,
    recoverChannel, setRecoverChannel,
    newPasswordConfirm, setNewPasswordConfirm,
    showLoginPassword, setShowLoginPassword,
    showNewPassword, setShowNewPassword,
    showNewPasswordConfirm, setShowNewPasswordConfirm,
    showAdminPassword, setShowAdminPassword,
    captchaKey, setCaptchaPassToken, captchaPassToken,
    codeFromAdmin, setCodeFromAdmin,
    loading,
    setError,
    handleVerifyCode,
    handleRecoverVerify,
    handlePassword,
    handleRecoverRequest,
    handleRecoverNew,
    handleAdmin,
    handleAdminForgot,
  } = m;

  return (
    <>
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
          <button
            onClick={() => {
              setMode(codeFromAdmin ? "admin" : mode === "code" ? "phone" : "recover");
              setCodeFromAdmin(false);
              setCode("");
              setError("");
            }}
            className="w-full py-1 text-xs text-muted-foreground"
          >
            Назад
          </button>
        </>
      )}

      {/* PASSWORD LOGIN */}
      {mode === "password" && (
        <>
          <div className="relative">
            <input
              type={showLoginPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Icon name={showLoginPassword ? "EyeOff" : "Eye"} size={17} />
            </button>
          </div>
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
            <>
              <PhoneInput value={phone} onChange={setPhone}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium outline-none focus:border-primary" />
              <PuzzleCaptcha key={captchaKey} onVerified={setCaptchaPassToken} />
            </>
          ) : (
            <input type="email" placeholder="you@mail.ru" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
          )}
          <button onClick={handleRecoverRequest} disabled={loading || (recoverChannel === "sms" && !captchaPassToken)}
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
          <div className="relative">
            <input type={showNewPassword ? "text" : "password"} autoCapitalize="none" placeholder="Новый пароль (от 6 до 20 символов)" value={password}
              onChange={(e) => setPassword(e.target.value.replace(/[^\x21-\x7E]/g, "").slice(0, 20))} autoFocus
              className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
            <button type="button" onClick={() => setShowNewPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name={showNewPassword ? "EyeOff" : "Eye"} size={17} />
            </button>
          </div>
          <div className="relative">
            <input type={showNewPasswordConfirm ? "text" : "password"} autoCapitalize="none" placeholder="Повторите новый пароль" value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value.replace(/[^\x21-\x7E]/g, "").slice(0, 20))}
              className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
            <button type="button" onClick={() => setShowNewPasswordConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name={showNewPasswordConfirm ? "EyeOff" : "Eye"} size={17} />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground px-1 -mt-1">
            Латинские буквы, цифры и знаки, от 6 до 20 символов
          </p>
          <button onClick={handleRecoverNew} disabled={loading || !password || password !== newPasswordConfirm}
            className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Icon name="Loader" size={15} className="animate-spin" />}
            Сохранить и войти
          </button>
        </>
      )}

      {/* ADMIN */}
      {mode === "admin" && (
        <>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 px-1">Телефон Заведующей</label>
            <PhoneInput
              value={login}
              onChange={setLogin}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 px-1">Пароль</label>
            <div className="relative">
              <input type={showAdminPassword ? "text" : "password"} autoComplete="current-password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
              <button type="button" onClick={() => setShowAdminPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Icon name={showAdminPassword ? "EyeOff" : "Eye"} size={17} />
              </button>
            </div>
          </div>
          <button onClick={handleAdmin} disabled={loading}
            className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Icon name="Loader" size={15} className="animate-spin" />}
            Войти
          </button>
          <p className="text-[11px] text-center text-muted-foreground">
            Первый вход — введённый пароль станет постоянным. С нового устройства придёт код в SMS
          </p>
          <div className="flex items-center justify-between">
            <button onClick={handleAdminForgot} disabled={loading} className="text-xs text-primary">Забыли пароль?</button>
            <button onClick={() => { setMode("phone"); setError(""); }} className="text-xs text-muted-foreground">Назад</button>
          </div>
        </>
      )}
    </>
  );
}