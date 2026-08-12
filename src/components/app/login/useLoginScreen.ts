import { useState } from "react";
import { authApi, setToken, AuthUser } from "@/lib/auth";
import { reachGoal } from "@/lib/metrika";

export type Mode = "phone" | "code" | "password" | "recover" | "recover_code" | "recover_new" | "admin";

interface Args {
  onAuth: (user: AuthUser) => void;
}

export function useLoginScreen({ onAuth }: Args) {
  const [mode, setMode] = useState<Mode>(
    () => (new URLSearchParams(window.location.search).get("admin") === "1" ? "admin" : "phone")
  );
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [recoverChannel, setRecoverChannel] = useState<"sms" | "email">("sms");
  const [email, setEmail] = useState("");
  const [consentPersonal, setConsentPersonal] = useState(false);
  const [consentOffer, setConsentOffer] = useState(false);
  const [consentPep, setConsentPep] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [codePurpose, setCodePurpose] = useState<"login" | "register">("login");
  const [codeFromAdmin, setCodeFromAdmin] = useState(false);
  const [captchaPassToken, setCaptchaPassToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Пройти дальше можно, только когда приняты все три документа
  const consent = consentPersonal && consentOffer && consentPep;

  const acceptAllConsents = () => {
    setConsentPersonal(true);
    setConsentOffer(true);
    setConsentPep(true);
  };

  const busy = (fn: () => Promise<void>) => async () => {
    setError("");
    setLoading(true);
    try { await fn(); } catch { setError("Ошибка сети. Попробуйте ещё раз."); }
    finally { setLoading(false); }
  };

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const passwordValid = /^[A-Za-z0-9!-/:-@[-`{-~]{1,6}$/.test(password);

  const handleRegister = busy(async () => {
    if (phone.replace(/\D/g, "").length < 10) return setError("Введите корректный номер телефона");
    if (!emailValid) return setError("Введите корректный email");
    if (!passwordValid) return setError("Пароль: латиница, цифры и знаки, до 6 символов");
    if (password !== passwordConfirm) return setError("Пароли не совпадают");
    if (!consentPersonal) return setError("Примите согласие на обработку персональных данных");
    if (!consentOffer) return setError("Примите публичную оферту");
    if (!consentPep) return setError("Примите соглашение об использовании ПЭП");
    if (!captchaPassToken) return setError("Пройдите проверку «не робот»");

    // Если аккаунт уже есть — вход по паролю (если задан) или по SMS
    const chk = await authApi.checkDevice(phone);
    if (chk.data.exists) {
      if (chk.data.has_password) {
        setMode("password");
        setLogin(phone);
        return;
      }
      const r = await authApi.requestCode({ purpose: "login", channel: "sms", phone, captcha_pass_token: captchaPassToken });
      if (r.status !== 200) { setCaptchaPassToken(""); setCaptchaKey((k) => k + 1); return setError(r.data.error || "Не удалось отправить код"); }
      setDevCode(r.data.dev_code || "");
      setCodePurpose("login");
      setMode("code");
      return;
    }

    // Новый пользователь: отправляем SMS-код. Аккаунт создастся только после его подтверждения.
    const r = await authApi.requestCode({
      purpose: "register",
      channel: "sms",
      phone,
      email: email.trim().toLowerCase(),
      password,
      consent,
      consent_personal: consentPersonal,
      consent_offer: consentOffer,
      consent_pep: consentPep,
      captcha_pass_token: captchaPassToken,
    });
    if (r.status !== 200) { setCaptchaPassToken(""); setCaptchaKey((k) => k + 1); return setError(r.data.error || "Не удалось отправить код"); }
    setDevCode(r.data.dev_code || "");
    setCodePurpose("register");
    setMode("code");
  });

  const handleVerifyCode = busy(async () => {
    const r = await authApi.verifyCode({ purpose: codePurpose, channel: "sms", phone, code });
    if (r.status !== 200) return setError(r.data.error || "Неверный код");
    setToken(r.data.token);
    reachGoal(codePurpose === "register" ? "registration_success" : "login_success", { method: "sms" });
    onAuth(r.data.user);
  });

  const handlePassword = busy(async () => {
    const r = await authApi.loginPassword({ login, password });
    if (r.status !== 200) return setError(r.data.error || "Неверный логин или пароль");
    setToken(r.data.token);
    reachGoal("login_success", { method: "password" });
    onAuth(r.data.user);
  });

  const handleRecoverRequest = busy(async () => {
    if (recoverChannel === "sms" && !captchaPassToken) return setError("Пройдите проверку «не робот»");
    const p = recoverChannel === "sms" ? { phone, captcha_pass_token: captchaPassToken } : { email };
    const r = await authApi.requestCode({ purpose: "reset", channel: recoverChannel, ...p });
    if (r.status !== 200) {
      if (recoverChannel === "sms") { setCaptchaPassToken(""); setCaptchaKey((k) => k + 1); }
      return setError(r.data.error || "Не удалось отправить код");
    }
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
    if (!/^[A-Za-z0-9!-/:-@[-`{-~]{6,20}$/.test(password))
      return setError("Пароль: латиница, цифры и знаки, от 6 символов");
    if (password !== newPasswordConfirm) return setError("Пароли не совпадают");
    const r = await authApi.resetPassword(password);
    if (r.status !== 200) return setError(r.data.error || "Не удалось сменить пароль");
    setCodeFromAdmin(false);
    const me = await authApi.me();
    if (me.data.user) onAuth(me.data.user);
  });

  // Заведующая забыла пароль — код в SMS, затем новый пароль
  const handleAdminForgot = busy(async () => {
    const digits = (login || "").replace(/\D/g, "");
    if (digits.length < 10) return setError("Введите номер телефона Заведующей");
    const r = await authApi.requestAdminSms(digits, "reset");
    if (r.status !== 200) return setError(r.data.error || "Не удалось отправить код");
    setPhone(r.data.phone);
    setRecoverChannel("sms");
    setCodeFromAdmin(true);
    setPassword("");
    setMode("recover_code");
  });

  const handleAdmin = busy(async () => {
    const digits = (login || "").replace(/\D/g, "");
    if (!digits) return setError("Введите номер телефона Заведующей");
    const r = await authApi.loginPassword({ login: digits, password });
    if (r.status !== 200) return setError(r.data.error || "Неверный логин или пароль");
    // Новое устройство: сначала подтверждаем код из SMS
    if (r.data.sms_required) {
      setPhone(r.data.phone);
      setCodePurpose("login");
      setCodeFromAdmin(true);
      setMode("code");
      return;
    }
    setToken(r.data.token);
    onAuth(r.data.user);
  });

  // Капчу можно двигать, только когда заполнены все поля и приняты условия
  const registerFieldsReady =
    phone.replace(/\D/g, "").length === 10 &&
    emailValid &&
    passwordValid &&
    password === passwordConfirm;

  return {
    emailValid,
    passwordValid,
    registerFieldsReady,
    mode, setMode,
    phone, setPhone,
    code, setCode,
    login, setLogin,
    password, setPassword,
    recoverChannel, setRecoverChannel,
    email, setEmail,
    consent,
    consentPersonal, setConsentPersonal,
    consentOffer, setConsentOffer,
    consentPep, setConsentPep,
    acceptAllConsents,
    showConsent, setShowConsent,
    loading,
    error, setError,
    devCode,
    codeFromAdmin, setCodeFromAdmin,
    captchaPassToken, setCaptchaPassToken,
    captchaKey,
    passwordConfirm, setPasswordConfirm,
    newPasswordConfirm, setNewPasswordConfirm,
    showPassword, setShowPassword,
    showPasswordConfirm, setShowPasswordConfirm,
    showLoginPassword, setShowLoginPassword,
    showNewPassword, setShowNewPassword,
    showNewPasswordConfirm, setShowNewPasswordConfirm,
    showAdminPassword, setShowAdminPassword,
    handleRegister,
    handleVerifyCode,
    handlePassword,
    handleRecoverRequest,
    handleRecoverVerify,
    handleRecoverNew,
    handleAdmin,
    handleAdminForgot,
  };
}