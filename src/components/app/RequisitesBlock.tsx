import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import HintIcon from "@/components/ui/hint-icon";

const CHECK_INN_URL = "https://functions.poehali.dev/9aea3fe4-6f69-411a-8a01-c3e94cb8888c";
const REQUISITES_URL = "https://functions.poehali.dev/2829317d-bede-423b-a3e3-96d2eb06c843";
const LS_KEY = "requisites";

type EntityType = "ip" | "self_employed" | "individual" | "ooo";


const entityOptions: { value: EntityType; label: string; icon: string }[] = [
  { value: "self_employed", label: "Самозанятый", icon: "UserCheck" },
  { value: "ip", label: "ИП", icon: "Briefcase" },
  { value: "individual", label: "Физ. лицо", icon: "User" },
  { value: "ooo", label: "ООО", icon: "Building2" },
];

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

interface Props {
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
}

export default function RequisitesBlock({ fullName, setFullName, phone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem("openRequisites") === "1";
    } catch { return false; }
  });

  useEffect(() => {
    if (!isOpen) return;
    try { sessionStorage.removeItem("openRequisites"); } catch { /* ignore */ }
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [entityType, setEntityType] = useState<EntityType | null>(() => loadSaved().entityType ?? null);
  const [innOgrnip, setInnOgrnip] = useState<string>(() => loadSaved().innOgrnip ?? "");
  const [inn, setInn] = useState<string>(() => loadSaved().inn ?? "");
  const [ogrnip, setOgrnip] = useState<string>(() => loadSaved().ogrnip ?? "");
  const [address, setAddress] = useState<string>(() => loadSaved().address ?? "");
  const [bik, setBik] = useState<string>(() => loadSaved().bik ?? "");
  const [bankName, setBankName] = useState<string>(() => loadSaved().bankName ?? "");
  const [corrAccount, setCorrAccount] = useState<string>(() => loadSaved().corrAccount ?? "");
  const [checkingAccount, setCheckingAccount] = useState<string>(() => loadSaved().checkingAccount ?? "");
  const [okpo, setOkpo] = useState<string>(() => loadSaved().okpo ?? "");
  const [kpp, setKpp] = useState<string>(() => loadSaved().kpp ?? "");
  const [signPhone, setSignPhone] = useState<string>(() => loadSaved().signPhone ?? "");
  const [signEmail, setSignEmail] = useState<string>(() => loadSaved().signEmail ?? "");
  const [bikChecking, setBikChecking] = useState(false);
  const [bikError, setBikError] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ valid: boolean; message?: string; name?: string; ogrnip?: string; inn?: string } | null>(null);
  const [saved, setSaved] = useState<boolean>(() => loadSaved().saved ?? false);
  const [saving, setSaving] = useState(false);
  const [showManualFill, setShowManualFill] = useState<boolean>(() => loadSaved().showManualFill ?? false);
  const [editing, setEditing] = useState(false);
  const [identityConfirmOpen, setIdentityConfirmOpen] = useState(false);
  const [identityConfirmMessage, setIdentityConfirmMessage] = useState("");
  const [identityLockedMessage, setIdentityLockedMessage] = useState("");

  // Форма блокируется, только если реквизиты действительно заполнены и сохранены.
  // При первом заполнении (данных ещё нет) поля доступны сразу, без кнопки «Изменить».
  const hasFilledRequisites = Boolean((inn || "").trim() || (ogrnip || "").trim() || (fullName || "").trim());
  const readOnly = saved && hasFilledRequisites && !editing;

  // Загружаем реквизиты из БД при монтировании
  useEffect(() => {
    if (!phone) return;
    fetch(REQUISITES_URL, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const r = data.requisites;
        if (!r) {
          // Реквизитов ещё нет — форма открыта для первого заполнения
          setSaved(false);
          return;
        }
        if (r.entity_type) setEntityType(r.entity_type as EntityType);
        if (r.full_name) { setFullName(r.full_name); }
        if (r.inn) setInn(r.inn);
        if (r.ogrnip) { setOgrnip(r.ogrnip); setShowManualFill(true); }
        if (r.address) setAddress(r.address);
        if (r.bik) setBik(r.bik);
        if (r.bank_name) setBankName(r.bank_name);
        if (r.corr_account) setCorrAccount(r.corr_account);
        if (r.checking_account) setCheckingAccount(r.checking_account);
        if (r.okpo) setOkpo(r.okpo);
        if (r.kpp) setKpp(r.kpp);
        if (r.sign_phone) setSignPhone(r.sign_phone);
        if (r.sign_email) setSignEmail(r.sign_email);
        setSaved(Boolean(r.inn || r.ogrnip || r.full_name));
      })
      .catch(() => {});
  }, [phone]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ entityType, innOgrnip, inn, ogrnip, address, bik, bankName, corrAccount, checkingAccount, okpo, kpp, signPhone, signEmail, saved, showManualFill, fullName }));
  }, [entityType, innOgrnip, inn, ogrnip, address, bik, bankName, corrAccount, checkingAccount, okpo, kpp, signPhone, signEmail, saved, showManualFill, fullName]);

  const saveToDb = async (opts?: { confirmIdentity?: boolean }) => {
    if (!phone) return;
    setSaving(true);
    try {
      const res = await fetch(REQUISITES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({
          entity_type: entityType,
          full_name: fullName,
          inn, ogrnip, address, bik,
          bank_name: bankName,
          corr_account: corrAccount,
          checking_account: checkingAccount,
          okpo,
          kpp,
          sign_phone: signPhone,
          sign_email: signEmail,
          confirm_identity_change: !!opts?.confirmIdentity,
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setIdentityConfirmMessage(data.message || "Вы меняете лицо, от которого подписываются документы. Подтверждаете изменение?");
        setIdentityConfirmOpen(true);
        return;
      }

      if (res.status === 423) {
        const data = await res.json().catch(() => ({}));
        setIdentityLockedMessage(data.message || "Изменить лицо, от которого подписываются документы, можно не чаще 1 раза в 30 дней.");
        return;
      }

      if (!res.ok) return;

      setSaved(true);
      setEditing(false);
      setIdentityConfirmOpen(false);
      setIdentityLockedMessage("");
    } finally {
      setSaving(false);
    }
  };

  const innMaxLen = entityType === "ooo" ? 10 : 12;

  const ipInputIsInn = entityType === "ip" && innOgrnip.length === 12;
  const ipInputIsOgrnip = entityType === "ip" && innOgrnip.length === 15;

  const handleCheckAuto = async (value: string, opts?: { silent?: boolean }) => {
    const isOgrnip = value.length === 15;
    setChecking(true);
    setCheckResult(null);
    setSaved(false);
    try {
      const res = await fetch(CHECK_INN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inn: isOgrnip ? "" : value,
          ogrnip: isOgrnip ? value : "",
          entity_type: entityType,
        }),
      });
      const data = await res.json();
      if (!opts?.silent || data.valid) setCheckResult(data);
      if (data.valid) {
        // Успешная сверка с ФНС — это ещё не сохранение: поля должны остаться доступными
        if (data.name) setFullName(data.name);
        if (entityType === "ip" && data.ogrnip) setOgrnip(data.ogrnip);
        if (data.inn) setInn(data.inn);
        else if (!isOgrnip) setInn(value);
        if (data.address) setAddress(data.address);
        setShowManualFill(true);
      }
    } catch {
      if (!opts?.silent) {
        setCheckResult({ valid: false, message: "Ошибка при сверке с сайтом ФНС. Пожалуйста, проверьте внесённые данные" });
      }
    } finally {
      setChecking(false);
    }
  };

  const handleBikCheck = async (value: string) => {
    setBikChecking(true);
    setBikError("");
    setBankName("");
    setCorrAccount("");
    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Token 32d3311132a01e28fb77b87dd83b9452f3c7b353",
        },
        body: JSON.stringify({ query: value, count: 1 }),
      });
      const data = await res.json();
      const item = data.suggestions?.[0];
      if (item) {
        setBankName(item.value || "");
        setCorrAccount(item.data?.correspondent_account || "");
      } else {
        setBikError("Банк не найден. Проверьте БИК");
      }
    } catch {
      setBikError("Ошибка при проверке БИК");
    } finally {
      setBikChecking(false);
    }
  };

  const handleSelectEntity = (type: EntityType) => {
    setEntityType(type);
    setInn("");
    setOgrnip("");
    setInnOgrnip("");
    setAddress("");
    setBik("");
    setBankName("");
    setCorrAccount("");
    setCheckingAccount("");
    setOkpo("");
    setKpp("");
    setCheckResult(null);
    setSaved(false);
    setShowManualFill(false);
  };

  const handleReset = () => {
    setEntityType(null);
    setInn("");
    setOgrnip("");
    setInnOgrnip("");
    setAddress("");
    setBik("");
    setBankName("");
    setCorrAccount("");
    setCheckingAccount("");
    setOkpo("");
    setKpp("");
    setSignPhone("");
    setSignEmail("");
    setCheckResult(null);
    setSaved(false);
    setShowManualFill(false);
    setEditing(false);
    setIdentityLockedMessage("");
    setIdentityConfirmOpen(false);
  };

  return (
    <div ref={rootRef} className="card-warm rounded-2xl p-4 shadow-sm">
      <div className="w-full flex items-center gap-2">
        <button
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => setIsOpen((v) => !v)}
        >
          <Icon name="FileText" size={15} className="text-primary flex-shrink-0" />
          <p className="text-sm font-medium text-left truncate">Мои реквизиты</p>
        </button>
        <HintIcon text="Мои данные для подстановки в документы" />
        {saved && <span className="doc-tag bg-green-100 text-green-700 text-[10px] flex-shrink-0">Сохранено</span>}
        <button onClick={() => setIsOpen((v) => !v)} className="flex-shrink-0">
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground" />
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">

          {/* Форма деятельности */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Форма деятельности <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {entityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => !readOnly && handleSelectEntity(opt.value)}
                  disabled={readOnly}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-70 ${
                    entityType === opt.value
                      ? "gold-gradient text-white border-transparent shadow-sm"
                      : "bg-white/60 border-border text-foreground"
                  }`}
                >
                  <Icon name={opt.icon} size={14} />
                  {opt.label}
                </button>
              ))}
            </div>
            {!entityType && (
              <p className="text-xs text-muted-foreground mt-2">Выберите форму деятельности, чтобы продолжить</p>
            )}
          </div>

          {/* Единое поле ИНН / ОГРНИП для всех форм деятельности */}
          {entityType && !showManualFill && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {entityType === "ip" ? (
                  <>
                    ИНН / ОГРНИП
                    {innOgrnip.length > 0 && (
                      <span className="ml-2 text-primary font-medium">
                        {ipInputIsInn ? "— ИНН" : ipInputIsOgrnip ? "— ОГРНИП" : ""}
                      </span>
                    )}
                  </>
                ) : (
                  `ИНН (${innMaxLen} цифр)`
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={entityType === "ip" ? innOgrnip : inn}
                  onChange={(e) => {
                    if (entityType === "ip") {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                      setInnOgrnip(val);
                      setCheckResult(null);
                      setSaved(false);
                    } else {
                      const val = e.target.value.replace(/\D/g, "").slice(0, innMaxLen);
                      setInn(val);
                      setCheckResult(null);
                      setSaved(false);
                    }
                  }}
                  placeholder={entityType === "ip" ? "Введите ИНН (12 цифр) или ОГРНИП (15 цифр)" : entityType === "ooo" ? "7707083893" : "123456789012"}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                />
                {checking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="Loader" size={14} className="animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Результат проверки */}
          {checkResult && !showManualFill && (
            <div className={`rounded-xl px-3 py-2.5 text-sm flex items-start gap-2 ${
              checkResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              <Icon name={checkResult.valid ? "CheckCircle" : "AlertCircle"} size={15} className="flex-shrink-0 mt-0.5" />
              <span>
                {checkResult.valid
                  ? entityType === "self_employed"
                    ? "Статус самозанятого (плательщика НПД) подтверждён на сайте ФНС"
                    : "Данные подтверждены в реестре ФНС"
                  : checkResult.message}
              </span>
            </div>
          )}

          {/* Когда ИНН/ОГРНИП введён полностью — даём заполнить по реестру ФНС или внести данные самостоятельно */}
          {entityType && !showManualFill && !checking && (
            entityType === "ip"
              ? (innOgrnip.length === 12 || innOgrnip.length === 15)
              : inn.length === innMaxLen
          ) && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCheckAuto(entityType === "ip" ? innOgrnip : inn)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform"
              >
                <Icon name="Search" size={14} />
                Заполнить данные с сайта налоговой
              </button>
              <button
                onClick={() => { setShowManualFill(true); setCheckResult(null); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white/60 text-sm font-medium text-foreground active:scale-[0.98] transition-transform"
              >
                <Icon name="PenLine" size={14} />
                Внести данные вручную
              </button>
            </div>
          )}

          {/* Заполненные поля — из реестра ФНС или вручную */}
          {showManualFill && entityType && (
            <div className="space-y-2">
              {!readOnly && (
                <button
                  onClick={() => { setShowManualFill(false); setCheckResult(null); }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground"
                >
                  <Icon name="ChevronLeft" size={12} />
                  Изменить ИНН
                </button>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {entityType === "ooo" ? "Наименование организации" : "ФИО"}
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white/70">
                  {entityType === "ip" && (
                    <>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">ИП</span>
                      <div className="w-px h-4 bg-border flex-shrink-0" />
                    </>
                  )}
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
                    readOnly={readOnly}
                    placeholder={entityType === "ooo" ? 'ООО «Ромашка»' : "Иванова Анна Сергеевна"}
                    className="flex-1 text-sm outline-none bg-transparent read-only:opacity-70"
                  />
                </div>
              </div>
              <div className={entityType === "ip" || entityType === "ooo" ? "grid grid-cols-2 gap-2" : ""}>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ИНН</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inn}
                    onChange={(e) => { setInn(e.target.value.replace(/\D/g, "").slice(0, innMaxLen)); setSaved(false); }}
                    readOnly={readOnly}
                    placeholder={entityType === "ooo" ? "7707083893" : "123456789012"}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                  />
                </div>
                {entityType === "ip" && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">ОГРНИП</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ogrnip}
                      onChange={(e) => { setOgrnip(e.target.value.replace(/\D/g, "").slice(0, 15)); setSaved(false); }}
                      readOnly={readOnly}
                      placeholder="315774600123456"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                    />
                  </div>
                )}
                {entityType === "ooo" && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">КПП</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={kpp}
                      onChange={(e) => { setKpp(e.target.value.replace(/\D/g, "").slice(0, 9)); setSaved(false); }}
                      readOnly={readOnly}
                      placeholder="770701001"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {entityType === "ooo" ? "Юридический адрес" : "Адрес регистрации (по прописке)"}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setSaved(false); }}
                  readOnly={readOnly}
                  placeholder="105066, г. Москва, ул. Примерная, д. 1, кв. 1"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ОКПО (для товарных накладных)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={okpo}
                  onChange={(e) => { setOkpo(e.target.value.replace(/\D/g, "").slice(0, 10)); setSaved(false); }}
                  readOnly={readOnly}
                  placeholder="12345678"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                />
              </div>

              {/* Контакты для документов */}
              <div className="pt-1">
                <p className="text-xs font-medium text-foreground mb-2">Контакты для документов</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Телефон для подписания</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={signPhone}
                      onFocus={() => { if (!signPhone) { setSignPhone("+7 "); setSaved(false); } }}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Позволяем полностью стереть номер — не навязываем +7, если поле очищено
                        if (!val || val === "+7" || val === "+7 ") { setSignPhone(""); setSaved(false); return; }
                        setSignPhone(val.startsWith("+7") ? val : `+7 ${val.replace(/\D/g, "")}`);
                        setSaved(false);
                      }}
                      readOnly={readOnly}
                      placeholder="+7 900 000-00-00"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">E-mail для документов</label>
                    <input
                      type="email"
                      value={signEmail}
                      onChange={(e) => { setSignEmail(e.target.value); setSaved(false); }}
                      readOnly={readOnly}
                      placeholder="mail@example.ru"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Эти данные будут подставляться в документы для подписания и отзыва согласий</p>
              </div>

              {/* Банковские реквизиты */}
              <div className="pt-1">
                <p className="text-xs font-medium text-foreground mb-2">Банковские реквизиты</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">БИК</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={bik}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                          setBik(val);
                          setBankName("");
                          setCorrAccount("");
                          setBikError("");
                          setSaved(false);
                          if (val.length === 9) setTimeout(() => handleBikCheck(val), 0);
                        }}
                        readOnly={readOnly}
                        placeholder="044525225"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                      />
                      {bikChecking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Icon name="Loader" size={14} className="animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {bikError && <p className="text-[11px] text-red-500 mt-1">{bikError}</p>}
                  </div>

                  {bankName && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Банк</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => { setBankName(e.target.value); setSaved(false); }}
                        readOnly={readOnly}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                      />
                    </div>
                  )}

                  {corrAccount && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Корр. счёт</label>
                      <input
                        type="text"
                        value={corrAccount}
                        onChange={(e) => { setCorrAccount(e.target.value); setSaved(false); }}
                        readOnly={readOnly}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                      />
                    </div>
                  )}

                  {bankName && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Расчётный счёт</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={checkingAccount}
                        onChange={(e) => { setCheckingAccount(e.target.value.replace(/\D/g, "").slice(0, 20)); setSaved(false); }}
                        readOnly={readOnly}
                        placeholder="40802810000000000000"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Кнопки: Сброс, Изменить (разблокировать поля) и Сохранить — всегда видны на своих местах */}
          {entityType && (
            <div className="flex justify-between gap-2 items-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white/60 text-muted-foreground text-xs"
              >
                <Icon name="RotateCcw" size={12} />
                Сбросить
              </button>
              <div className="flex gap-2">
                {readOnly && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-medium shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all"
                  >
                    <Icon name="Pencil" size={12} />
                    Изменить
                  </button>
                )}
                <button
                  onClick={() => saveToDb()}
                  disabled={saving || readOnly}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-gradient text-white text-xs font-medium shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none disabled:hover:shadow-sm disabled:hover:brightness-100"
                >
                  <Icon name={saving ? "Loader" : "Save"} size={12} className={saving ? "animate-spin" : ""} />
                  {saving ? "Сохраняю..." : "Сохранить"}
                </button>
              </div>
            </div>
          )}

          {identityLockedMessage && (
            <div className="rounded-xl px-3 py-2.5 text-sm flex items-start gap-2 bg-amber-50 text-amber-700 border border-amber-200">
              <Icon name="Lock" size={15} className="flex-shrink-0 mt-0.5" />
              <span>{identityLockedMessage}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            Данные будут автоматически подставляться во все документы
          </p>
        </div>
      )}

      {identityConfirmOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center px-6">
          <div className="bg-background rounded-2xl p-5 w-full max-w-xs shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="ShieldAlert" size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm font-semibold">Смена лица по договорам</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{identityConfirmMessage}</p>
            <div className="space-y-2">
              <button
                onClick={() => saveToDb({ confirmIdentity: true })}
                disabled={saving}
                className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Сохраняю..." : "Подтверждаю, сохранить"}
              </button>
              <button
                onClick={() => setIdentityConfirmOpen(false)}
                className="w-full py-2.5 rounded-xl border border-border bg-white/70 text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}