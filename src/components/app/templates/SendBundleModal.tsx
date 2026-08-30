import { useState } from "react";
import Icon from "@/components/ui/icon";
import PhoneInput from "@/components/ui/phone-input";
import { isBeforeLaunch, LAUNCH_DATE_SHORT } from "@/lib/launch";

interface Props {
  mainTitle: string;
  initialPhone?: string;
  sending?: boolean;
  error?: string;
  isTrial?: boolean;
  onClose: () => void;
  onSend: (p: { phone: string; sendMain: boolean; sendConsent: boolean }) => void;
}

export default function SendBundleModal({
  mainTitle, initialPhone = "", sending, error, isTrial, onClose, onSend,
}: Props) {
  const launchLocked = isBeforeLaunch() && !isTrial;
  const [phone, setPhone] = useState(initialPhone);
  const [sendMain, setSendMain] = useState(true);
  const [sendConsent, setSendConsent] = useState(true);

  const nothing = !sendMain && !sendConsent;

  const Row = ({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-white/70 text-left active:scale-[0.99] transition-transform"
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border ${
          checked ? "gold-gradient border-transparent" : "border-border bg-white"
        }`}
      >
        {checked && <Icon name="Check" size={13} className="text-white" />}
      </div>
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-3xl p-5 pb-10 shadow-2xl border-t border-border/50 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Отправить на подписание по СМС
        </p>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
            <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-[11px] text-red-600">{error}</p>
          </div>
        )}

        {isTrial && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Icon name="Stamp" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              На тарифе «Тест-драйв» документ будет с полупрозрачной голограммой «ТЕСТ» —
              и в отправленной клиенту версии, и при сохранении PDF.
            </p>
          </div>
        )}

        {launchLocked && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Icon name="Rocket" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Отправка документов клиенту по СМС станет доступна {LAUNCH_DATE_SHORT} — в день официального запуска сервиса.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Row checked={sendMain} onToggle={() => setSendMain((v) => !v)} label={mainTitle} />
          <Row checked={sendConsent} onToggle={() => setSendConsent((v) => !v)} label="Соглашение о перс. данных" />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Телефон клиента</label>
          <PhoneInput
            autoFocus
            value={phone}
            onChange={setPhone}
            className="w-full px-3.5 py-3 rounded-xl border border-border bg-white text-sm font-medium outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={() => onSend({ phone, sendMain, sendConsent })}
          disabled={phone.length < 10 || nothing || sending}
          className="w-full py-3.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Icon name={sending ? "Loader" : "Send"} size={15} className={sending ? "animate-spin" : ""} />
          {sending ? "Отправляю..." : "Отправить"}
        </button>

        <button onClick={onClose} className="w-full py-2.5 text-sm text-muted-foreground">
          Отмена
        </button>
      </div>
    </div>
  );
}