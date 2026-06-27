import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CHECK_INN_URL = "https://functions.poehali.dev/9aea3fe4-6f69-411a-8a01-c3e94cb8888c";
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
}

export default function RequisitesBlock({ fullName, setFullName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [entityType, setEntityType] = useState<EntityType | null>(() => loadSaved().entityType ?? null);
  const [innOgrnip, setInnOgrnip] = useState<string>(() => loadSaved().innOgrnip ?? "");
  const [inn, setInn] = useState<string>(() => loadSaved().inn ?? "");
  const [ogrnip, setOgrnip] = useState<string>(() => loadSaved().ogrnip ?? "");
  const [address, setAddress] = useState<string>(() => loadSaved().address ?? "");
  const [bik, setBik] = useState<string>(() => loadSaved().bik ?? "");
  const [bankName, setBankName] = useState<string>(() => loadSaved().bankName ?? "");
  const [corrAccount, setCorrAccount] = useState<string>(() => loadSaved().corrAccount ?? "");
  const [checkingAccount, setCheckingAccount] = useState<string>(() => loadSaved().checkingAccount ?? "");
  const [bikChecking, setBikChecking] = useState(false);
  const [bikError, setBikError] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ valid: boolean; message?: string; name?: string; ogrnip?: string; inn?: string } | null>(null);
  const [saved, setSaved] = useState<boolean>(() => loadSaved().saved ?? false);
  const [offerFill, setOfferFill] = useState(false);
  const [showManualFill, setShowManualFill] = useState<boolean>(() => loadSaved().showManualFill ?? false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ entityType, innOgrnip, inn, ogrnip, address, bik, bankName, corrAccount, checkingAccount, saved, showManualFill, fullName }));
  }, [entityType, innOgrnip, inn, ogrnip, address, bik, bankName, corrAccount, checkingAccount, saved, showManualFill, fullName]);

  const innMaxLen = entityType === "ooo" ? 10 : 12;

  const ipInputIsInn = entityType === "ip" && innOgrnip.length === 12;
  const ipInputIsOgrnip = entityType === "ip" && innOgrnip.length === 15;

  const handleCheckAuto = async (value: string) => {
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
      setCheckResult(data);
      if (data.valid && entityType === "ip") {
        setSaved(true);
        if (data.name) setFullName(data.name);
        if (data.ogrnip) setOgrnip(data.ogrnip);
        if (data.inn) setInn(data.inn);
        else if (!isOgrnip) setInn(value);
        setShowManualFill(true);
      }
    } catch {
      setCheckResult({ valid: false, message: "Ошибка при сверке с сайтом ФНС. Пожалуйста, проверьте внесённые данные" });
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
    setCheckResult(null);
    setSaved(false);
    setShowManualFill(false);
  };

  return (
    <div className="card-warm rounded-2xl p-4 shadow-sm">
      <button
        className="w-full flex items-center gap-2"
        onClick={() => setIsOpen((v) => !v)}
      >
        <Icon name="FileText" size={15} className="text-primary" />
        <p className="text-sm font-medium flex-1 text-left">Мои реквизиты</p>
        {saved && <span className="doc-tag bg-green-100 text-green-700 text-[10px]">Сохранено</span>}
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">

          {/* Форма деятельности */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Форма деятельности <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {entityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectEntity(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
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

          {/* Поля для ИП */}
          {entityType === "ip" && !showManualFill && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                ИНН / ОГРНИП
                {innOgrnip.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    {ipInputIsInn ? "— ИНН" : ipInputIsOgrnip ? "— ОГРНИП" : ""}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={innOgrnip}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                    setInnOgrnip(val);
                    setCheckResult(null);
                    setSaved(false);
                    setShowManualFill(false);
                    if (val.length === 12 || val.length === 15) {
                      setTimeout(() => handleCheckAuto(val), 0);
                    }
                  }}
                  placeholder="Введите ИНН (12 цифр) или ОГРНИП (15 цифр)"
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

          {/* ИНН для самозанятого и физлица */}
          {(entityType === "self_employed" || entityType === "individual") && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ИНН (12 цифр)</label>
              <input
                type="number"
                value={inn}
                onChange={(e) => { setInn(e.target.value.slice(0, 12)); setCheckResult(null); setSaved(false); }}
                placeholder="123456789012"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* ИНН для ООО */}
          {entityType === "ooo" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ИНН организации (10 цифр)</label>
              <input
                type="number"
                value={inn}
                onChange={(e) => { setInn(e.target.value.slice(0, innMaxLen)); setCheckResult(null); setSaved(false); }}
                placeholder="7707083893"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* Результат проверки */}
          {checkResult && (
            <div className={`rounded-xl px-3 py-2.5 text-sm flex items-start gap-2 ${
              checkResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              <Icon name={checkResult.valid ? "CheckCircle" : "AlertCircle"} size={15} className="flex-shrink-0 mt-0.5" />
              <span>{checkResult.valid ? "Данные подтверждены в реестре ФНС" : checkResult.message}</span>
            </div>
          )}



          {/* Заполненные поля после проверки ФНС */}
          {showManualFill && entityType === "ip" && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ФИО предпринимателя</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white/70">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">ИП</span>
                  <div className="w-px h-4 bg-border flex-shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
                    placeholder="Иванова Анна Сергеевна"
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ИНН</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inn}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                      setInn(val);
                      setSaved(false);
                      setCheckResult(null);
                      if (val.length === 12) setTimeout(() => handleCheckAuto(val), 0);
                    }}
                    placeholder="123456789012"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ОГРНИП</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ogrnip}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                      setOgrnip(val);
                      setSaved(false);
                      setCheckResult(null);
                      if (val.length === 15) setTimeout(() => handleCheckAuto(val), 0);
                    }}
                    placeholder="315774600123456"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Адрес регистрации (по прописке)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setSaved(false); }}
                  placeholder="105066, г. Москва, ул. Примерная, д. 1, кв. 1"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Используется в документах как юридический адрес ИП</p>
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
                        placeholder="044525225"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
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
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
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
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
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
                        placeholder="40802810000000000000"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Сброс */}
          {entityType && (
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white/60 text-muted-foreground text-xs"
              >
                <Icon name="RotateCcw" size={12} />
                Сбросить
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            Данные будут автоматически подставляться во все документы
          </p>
        </div>
      )}
    </div>
  );
}