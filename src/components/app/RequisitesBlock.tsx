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
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ valid: boolean; message?: string; name?: string; ogrnip?: string; inn?: string } | null>(null);
  const [saved, setSaved] = useState<boolean>(() => loadSaved().saved ?? false);
  const [offerFill, setOfferFill] = useState(false);
  const [showManualFill, setShowManualFill] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ entityType, innOgrnip, inn, ogrnip, saved }));
  }, [entityType, innOgrnip, inn, ogrnip, saved]);

  const innMaxLen = entityType === "ooo" ? 10 : 12;

  // Определяем тип введённого значения для ИП
  const ipInputIsOgrnip = entityType === "ip" && innOgrnip.length === 15;
  const ipInputIsInn = entityType === "ip" && innOgrnip.length === 12;

  const canCheck =
    entityType === "ip"
      ? (ipInputIsInn || ipInputIsOgrnip)
      : entityType === "ooo"
      ? inn.length === 10
      : inn.length === 12;

  const handleCheck = async () => {
    if (!canCheck) return;
    setChecking(true);
    setCheckResult(null);
    setSaved(false);
    try {
      const res = await fetch(CHECK_INN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inn: entityType === "ip" ? (ipInputIsOgrnip ? "" : innOgrnip) : inn,
          ogrnip: entityType === "ip" && ipInputIsOgrnip ? innOgrnip : "",
          entity_type: entityType,
        }),
      });
      const data = await res.json();
      setCheckResult(data);
      if (data.valid) {
        setSaved(true);
        if (entityType === "ip") {
          if (data.name) setFullName(data.name);
          if (data.ogrnip) setOgrnip(data.ogrnip);
          if (data.inn) setInn(data.inn);
          else if (!ipInputIsOgrnip) setInn(innOgrnip);
          setShowManualFill(true);
        }
      }
    } catch {
      setCheckResult({ valid: false, message: "Ошибка при сверке с сайтом ФНС. Пожалуйста, проверьте внесённые данные" });
    } finally {
      setChecking(false);
    }
  };

  const handleSelectEntity = (type: EntityType) => {
    setEntityType(type);
    setInn("");
    setOgrnip("");
    setInnOgrnip("");
    setCheckResult(null);
    setSaved(false);
    setShowManualFill(false);
  };

  const handleReset = () => {
    setEntityType(null);
    setInn("");
    setOgrnip("");
    setInnOgrnip("");
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
                }}
                placeholder="Введите ИНН (12 цифр) или ОГРНИП (15 цифр)"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
              />
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
                    onChange={(e) => { setInn(e.target.value.replace(/\D/g, "").slice(0, 12)); setSaved(false); }}
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
                    onChange={(e) => { setOgrnip(e.target.value.replace(/\D/g, "").slice(0, 15)); setSaved(false); }}
                    placeholder="315774600123456"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Кнопки */}
          {entityType && (
            <div className="flex gap-2">
              <button
                onClick={handleCheck}
                disabled={!canCheck || checking}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  canCheck && !checking
                    ? "gold-gradient text-white shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {checking ? (
                  <>
                    <Icon name="Loader" size={14} className="animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="ShieldCheck" size={14} />
                    Проверить в ФНС
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2.5 rounded-xl border border-border bg-white/60 text-muted-foreground"
              >
                <Icon name="RotateCcw" size={14} />
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