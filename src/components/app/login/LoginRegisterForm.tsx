import Icon from "@/components/ui/icon";
import PuzzleCaptcha from "@/components/auth/PuzzleCaptcha";
import { useLoginScreen } from "./useLoginScreen";

type State = ReturnType<typeof useLoginScreen>;

interface Props {
  m: State;
}

export default function LoginRegisterForm({ m }: Props) {
  const {
    phone, setPhone,
    displayName, setDisplayName,
    email, setEmail,
    password, setPassword,
    passwordConfirm, setPasswordConfirm,
    showPassword, setShowPassword,
    showPasswordConfirm, setShowPasswordConfirm,
    consentPersonal, setConsentPersonal,
    consentOffer, setConsentOffer,
    consentPep, setConsentPep,
    consent,
    setShowConsent,
    captchaKey, setCaptchaPassToken, captchaPassToken,
    loading,
    handleRegister,
    emailValid,
    passwordValid,
    registerFieldsReady,
  } = m;

  // Пока не заполнены поля и не приняты условия — капча заблокирована
  const captchaLocked = !registerFieldsReady || !consent;
  let captchaHint = "";
  if (phone.replace(/\D/g, "").length !== 10) {
    captchaHint = "Введите номер телефона";
  } else if (!displayName.trim()) {
    captchaHint = "Напишите, как к вам обращаться";
  } else if (!emailValid) {
    captchaHint = "Введите электронный адрес";
  } else if (!passwordValid) {
    captchaHint = "Придумайте пароль";
  } else if (password !== passwordConfirm) {
    captchaHint = "Пароли не совпадают — повторите пароль";
  } else if (!consent) {
    captchaHint = "Для регистрации и входа Вам необходимо принять условия использования сервиса (выше)";
  }

  return (
    <>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+7</span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="900 000-00-00"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
        />
      </div>
      <div>
        <input
          type="text"
          autoCapitalize="words"
          placeholder="Как к вам обращаться"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5 px-1 leading-snug">
          Так мы будем обращаться к вам в сервисе. Можно просто имя — например, «Анна» или «Анна Петровна».
        </p>
      </div>
      <input
        type="email"
        inputMode="email"
        autoCapitalize="none"
        placeholder="Электронная почта (логин)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
      />
      <div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoCapitalize="none"
            placeholder="Пароль (до 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^\x21-\x7E]/g, "").slice(0, 6))}
            className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={17} />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
          Латинские буквы, цифры и знаки, до 6 символов
        </p>
      </div>
      <div className="relative">
        <input
          type={showPasswordConfirm ? "text" : "password"}
          autoCapitalize="none"
          placeholder="Повторите пароль"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value.replace(/[^\x21-\x7E]/g, "").slice(0, 6))}
          className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
        />
        <button
          type="button"
          onClick={() => setShowPasswordConfirm((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <Icon name={showPasswordConfirm ? "EyeOff" : "Eye"} size={17} />
        </button>
      </div>

      {/* Три отдельных согласия — пройти дальше можно только приняв все */}
      <div className="space-y-2.5">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consentPersonal}
            onChange={(e) => setConsentPersonal(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
          />
          <span className="text-[11px] text-muted-foreground leading-relaxed">
            Я даю{" "}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowConsent(true); }}
              className="text-primary underline underline-offset-2"
            >
              согласие на обработку персональных данных
            </button>
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consentOffer}
            onChange={(e) => setConsentOffer(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
          />
          <span className="text-[11px] text-muted-foreground leading-relaxed">
            Я принимаю{" "}
            <a
              href="/offer"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary underline underline-offset-2"
            >
              публичную оферту
            </a>
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consentPep}
            onChange={(e) => setConsentPep(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
          />
          <span className="text-[11px] text-muted-foreground leading-relaxed">
            Я подтверждаю ввод кода из SMS как простую электронную подпись (ПЭП) и принимаю{" "}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowConsent(true); }}
              className="text-primary underline underline-offset-2"
            >
              соглашение об использовании ПЭП
            </button>
          </span>
        </label>
      </div>

      <PuzzleCaptcha
        key={captchaKey}
        onVerified={setCaptchaPassToken}
        disabled={captchaLocked}
        disabledHint={captchaHint}
      />
      <button
        onClick={handleRegister}
        disabled={loading || !consent || !captchaPassToken || !password || password !== passwordConfirm}
        className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Icon name="Loader" size={15} className="animate-spin" />}
        Зарегистрироваться
      </button>
    </>
  );
}