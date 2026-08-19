import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import PhoneInput from "@/components/ui/phone-input";
import { CONTRACTS_URL } from "@/components/app/tabs/constants";

interface SharedDocData {
  title: string;
  contract_number: string;
  contract_date: string | null;
  client_name: string | null;
  status: string;
  signed_at: string | null;
  signer_name: string | null;
  file_url: string;
  expires_at: string;
}

const digitsOnly = (v: string) => v.replace(/\D/g, "");

const fmt = (v?: string | null) => {
  if (!v) return "—";
  const d = v.slice(0, 10).split("-");
  return d.length === 3 ? `${d[2]}.${d[1]}.${d[0]}` : v;
};

export default function SharedDoc() {
  const { token } = useParams();
  const [data, setData] = useState<SharedDocData | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "expired" | "missing">("loading");
  const [left, setLeft] = useState("");
  const [signOpen, setSignOpen] = useState(false);
  const [signStep, setSignStep] = useState<"form" | "code">("form");
  const [signName, setSignName] = useState("");
  const [signPhone, setSignPhone] = useState("");
  const [signAgree, setSignAgree] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [signError, setSignError] = useState("");
  const [signCode, setSignCode] = useState("");
  const [codeSentNotice, setCodeSentNotice] = useState(false);

  const loadDoc = () => {
    if (!token) { setState("missing"); return; }
    fetch(`${CONTRACTS_URL}?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const raw = await r.json();
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (r.status === 410) { setState("expired"); return; }
        if (!r.ok || !parsed.file_url) { setState("missing"); return; }
        setData(parsed);
        setSignName(parsed.client_name || "");
        setState("ok");
      })
      .catch(() => setState("missing"));
  };

  useEffect(loadDoc, [token]);

  const requestSignCode = async () => {
    if (!token || signLoading) return;
    if (signName.trim().length < 3) { setSignError("Введите ФИО полностью"); return; }
    if (digitsOnly(signPhone).length !== 10) { setSignError("Введите корректный номер телефона"); return; }
    if (!signAgree) { setSignError("Подтвердите согласие на подписание"); return; }
    setSignLoading(true);
    setSignError("");
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "request_sign_code",
          signer_phone: digitsOnly(signPhone),
        }),
      });
      if (!res.ok) { setSignError("Не удалось отправить код. Попробуйте ещё раз"); return; }
      setSignStep("code");
      setCodeSentNotice(true);
      setTimeout(() => setCodeSentNotice(false), 4000);
    } catch {
      setSignError("Нет связи с сервером");
    } finally {
      setSignLoading(false);
    }
  };

  const submitSign = async () => {
    if (!token || signLoading) return;
    if (signCode.trim().length !== 4) { setSignError("Введите код из SMS полностью"); return; }
    setSignLoading(true);
    setSignError("");
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "client_sign",
          signer_name: signName.trim(),
          signer_phone: digitsOnly(signPhone),
          sign_code: signCode.trim(),
        }),
      });
      if (res.status === 409) { setSignError("Документ уже подписан"); loadDoc(); return; }
      if (res.status === 400) {
        const raw = await res.json().catch(() => ({}));
        const err = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (err.error === "code_invalid") { setSignError("Неверный код. Проверьте SMS и попробуйте ещё раз"); return; }
        if (err.error === "code_expired") { setSignError("Код истёк или попыток слишком много. Запросите новый код"); setSignStep("form"); return; }
        setSignError("Не удалось подписать, попробуйте ещё раз");
        return;
      }
      if (!res.ok) { setSignError("Не удалось подписать, попробуйте ещё раз"); return; }
      setSignOpen(false);
      setSignStep("form");
      setSignCode("");
      loadDoc();
    } catch {
      setSignError("Нет связи с сервером");
    } finally {
      setSignLoading(false);
    }
  };

  useEffect(() => {
    if (!data?.expires_at) return;
    const tick = () => {
      const end = new Date(data.expires_at.replace(" ", "T")).getTime();
      const diff = end - Date.now();
      if (diff <= 0) { setState("expired"); setLeft(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h > 0) {
        setLeft(`${h} ч ${String(m).padStart(2, "0")} мин`);
      } else {
        const s = Math.floor((diff % 60000) / 1000);
        setLeft(`${m} мин ${String(s).padStart(2, "0")} сек`);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [data]);

  const signed = data?.status === "signed";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-md">
        {state === "loading" && (
          <div className="flex flex-col items-center py-20">
            <Icon name="Loader" size={26} className="animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-3">Открываем документ</p>
          </div>
        )}

        {(state === "expired" || state === "missing") && (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <Icon name={state === "expired" ? "TimerOff" : "FileX"} size={26} className="text-amber-600" />
            </div>
            <p className="text-base font-semibold">
              {state === "expired" ? "Срок ссылки истёк" : "Документ не найден"}
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {state === "expired"
                ? "Ссылка на документ действует 24 часа. Попросите отправителя прислать новую."
                : "Возможно, ссылка указана неверно или документ был удалён."}
            </p>
          </div>
        )}

        {state === "ok" && data && (
          <>
            <div className="card-warm rounded-2xl p-5 border shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${signed ? "bg-blue-50 border border-blue-200" : "bg-primary/10"}`}>
                  <Icon name={signed ? "ShieldCheck" : "FileText"} size={20} className={signed ? "text-blue-700" : "text-primary"} />
                </div>
                <div className="min-w-0">
                  <h1 className="font-cormorant text-xl font-semibold leading-tight">{data.title}</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    № {data.contract_number} от {fmt(data.contract_date)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <p>Кому: {data.client_name || "—"}</p>
                {signed && (
                  <>
                    <p className="text-blue-700">Подписан: {data.signer_name || "—"}</p>
                    <p className="text-blue-700">Дата подписания: {fmt(data.signed_at)}</p>
                  </>
                )}
              </div>

              {signed && (
                <div className="mt-4 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                  <Icon name="BadgeCheck" size={14} className="text-blue-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Документ подписан простой электронной подписью. В PDF есть печать и реквизиты подписания.
                  </p>
                </div>
              )}

              <a
                href={data.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 w-full py-3.5 rounded-xl text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${signed ? "bg-blue-700" : "gold-gradient"}`}
              >
                <Icon name={signed ? "Stamp" : "FileDown"} size={16} />
                Открыть документ (PDF)
              </a>

              {!signed && (
                <button
                  onClick={() => setSignOpen(true)}
                  className="mt-2.5 w-full py-3.5 rounded-xl bg-blue-700 text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Icon name="PenLine" size={16} />
                  Подписать документ
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Icon name="Clock" size={13} />
              Ссылка действует ещё {left}
            </div>
          </>
        )}
      </div>

      {signOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-5">
          <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <Icon name={signStep === "code" ? "MessageSquare" : "ShieldCheck"} size={17} className="text-blue-700" />
                </div>
                <p className="text-sm font-semibold">
                  {signStep === "code" ? "Введите код из SMS" : "Подписание документа"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {signStep === "code"
                  ? `Код отправлен на номер +7 ${signPhone.replace(/\D/g, "")}. Введите его, чтобы подтвердить подписание.`
                  : "Простая электронная подпись по 63-ФЗ. После подписания документ изменить нельзя."}
              </p>
            </div>

            {signStep === "form" ? (
              <>
                <div className="px-5 py-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ваше ФИО</label>
                    <input
                      value={signName}
                      onChange={(e) => setSignName(e.target.value)}
                      placeholder="Иванова Анна Петровна"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ваш телефон</label>
                    <PhoneInput
                      value={signPhone}
                      onChange={setSignPhone}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => setSignAgree(!signAgree)}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-white/70 text-left"
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 border ${signAgree ? "bg-blue-600 border-transparent" : "border-border bg-white"}`}>
                      {signAgree && <Icon name="Check" size={13} className="text-white" />}
                    </div>
                    <span className="text-xs leading-snug">
                      Подтверждаю согласие подписать документ простой электронной подписью
                    </span>
                  </button>

                  <div className="text-[11px] text-muted-foreground bg-muted/50 border border-border rounded-xl px-3 py-2.5 leading-relaxed">
                    Мы пришлём код по SMS на указанный телефон. Ввод кода — ваше подтверждение подписания. В документ будут внесены: ФИО, телефон, дата и время, IP-адрес и отпечаток документа.
                  </div>

                  {signError && (
                    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                      <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-[11px] text-red-600">{signError}</p>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 space-y-2">
                  <button
                    onClick={requestSignCode}
                    disabled={signLoading}
                    className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Icon name={signLoading ? "Loader" : "MessageSquare"} size={15} className={signLoading ? "animate-spin" : ""} />
                    {signLoading ? "Отправляем код..." : "Получить код по SMS"}
                  </button>
                  <button onClick={() => setSignOpen(false)} className="w-full py-2.5 text-sm text-muted-foreground">
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="px-5 py-4 space-y-3">
                  {codeSentNotice && (
                    <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                      <Icon name="CheckCircle" size={14} className="text-green-600 flex-shrink-0" />
                      <p className="text-[11px] text-green-700">Код отправлен по SMS</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Код из SMS</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      value={signCode}
                      onChange={(e) => setSignCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="0000"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-lg tracking-[0.4em] text-center outline-none focus:border-primary"
                    />
                  </div>

                  {signError && (
                    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                      <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-[11px] text-red-600">{signError}</p>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 space-y-2">
                  <button
                    onClick={submitSign}
                    disabled={signLoading || signCode.length !== 4}
                    className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Icon name={signLoading ? "Loader" : "PenLine"} size={15} className={signLoading ? "animate-spin" : ""} />
                    {signLoading ? "Подписываю..." : "Подтвердить и подписать"}
                  </button>
                  <button
                    onClick={() => { setSignStep("form"); setSignCode(""); setSignError(""); }}
                    className="w-full py-2.5 text-sm text-muted-foreground"
                  >
                    Изменить данные
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}