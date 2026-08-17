import { useState } from "react";
import Icon from "@/components/ui/icon";
import { formatDate } from "@/lib/date";
import { Contract } from "../constants";

interface Props {
  contract: Contract;
  menuId: number | null;
  setMenuId: (id: number | null) => void;
  onOpen: (c: Contract) => void;
  onStatus: (id: number, status: string) => void;
  onPdf: (c: Contract) => void;
  pdfLoadingId: number | null;
  shareId: number | null;
  setShareId: (id: number | null) => void;
  onShare: (c: Contract, channel: "telegram" | "whatsapp" | "sms" | "email", clientPhone?: string) => void;
}

const CHANNELS = [
  { id: "telegram" as const, icon: "Send", label: "Telegram" },
  { id: "whatsapp" as const, icon: "MessageCircle", label: "WhatsApp" },
  { id: "sms" as const, icon: "Smartphone", label: "SMS" },
  { id: "email" as const, icon: "Mail", label: "Почта" },
];

export default function ContractCard({
  contract, menuId, setMenuId, onOpen, onStatus, onPdf, pdfLoadingId, shareId, setShareId, onShare,
}: Props) {
  const signed = contract.status === "signed";
  const deleted = contract.status === "deleted";
  const [smsMode, setSmsMode] = useState(false);
  const [smsPhone, setSmsPhone] = useState(contract.client_phone || "");

  const draft = contract.status === "draft";

  return (
    <div className={`relative w-full card-warm rounded-2xl p-4 shadow-sm transition-opacity ${deleted ? "opacity-50" : ""}`}>
      <div className="flex gap-3">
        {/* Иконка */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${deleted ? "bg-gray-200" : "bg-primary/10"}`}>
          <Icon name={signed ? "ShieldCheck" : "FileSignature"} size={19} className={deleted ? "text-gray-400" : "text-primary"} />
        </div>

        {/* Текст — кликабельная зона */}
        <button
          onClick={() => onOpen(contract)}
          className="flex-1 min-w-0 text-left"
        >
          <p className={`text-sm font-medium leading-snug ${deleted ? "line-through text-muted-foreground" : ""}`}>
            {contract.title}
          </p>
          <p className={`text-xs text-muted-foreground mt-0.5 ${deleted ? "line-through" : ""}`}>
            № {contract.contract_number} · {formatDate(contract.contract_date)}
          </p>
          <p className={`text-xs text-muted-foreground mt-0.5 truncate ${deleted ? "line-through" : ""}`}>
            {contract.client_name || "Без клиента"}
          </p>
          {signed && contract.sign_id && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Icon name="BadgeCheck" size={10} />
              Подписан по СМС
            </span>
          )}
        </button>

        {/* Правый блок: кнопки + статус */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPdf(contract)}
              disabled={pdfLoadingId === contract.id || deleted}
              aria-label={signed ? "Скачать PDF с печатью" : "Скачать PDF"}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Icon name={pdfLoadingId === contract.id ? "Loader" : signed ? "Stamp" : "FileDown"} size={15} className={pdfLoadingId === contract.id ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => { setShareId(shareId === contract.id ? null : contract.id); setSmsMode(false); }}
              disabled={pdfLoadingId === contract.id || deleted}
              aria-label="Отправить"
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Icon name="Share2" size={14} />
            </button>
          </div>

          {shareId === contract.id && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setShareId(null); setSmsMode(false); }} />
              <div className="absolute right-3 top-12 z-40 w-56 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
                {!smsMode ? (
                  <>
                    <p className="px-3.5 pt-2.5 pb-1 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Отправить {signed ? "подписанный" : "документ"}
                    </p>
                    {CHANNELS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => c.id === "sms" ? setSmsMode(true) : onShare(contract, c.id)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors"
                      >
                        <Icon name={c.icon} size={15} className="text-primary" />
                        {c.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Телефон клиента
                    </p>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9001234567"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => { onShare(contract, "sms", smsPhone); setShareId(null); setSmsMode(false); }}
                      disabled={smsPhone.length < 10}
                      className="w-full py-2 rounded-lg gold-gradient text-white text-xs font-medium disabled:opacity-40"
                    >
                      Отправить SMS
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => setMenuId(menuId === contract.id ? null : contract.id)}
            className={`doc-tag flex items-center gap-1 active:scale-95 transition-transform ${
              deleted ? "bg-red-100 text-red-600" :
              contract.status === "sent" ? "bg-blue-100 text-blue-700" :
              signed ? "bg-green-100 text-green-700" :
              "bg-amber-100 text-amber-700"
            }`}
          >
            {deleted ? "Удалён" :
              contract.status === "sent" ? "Отправлен на подпись" :
              signed ? "Подписан" : "Создан"}
            <Icon name="ChevronDown" size={11} />
          </button>
        </div>
      </div>

      {/* Заметная кнопка отправки на подпись — только для черновиков */}
      {draft && (
        <button
          onClick={() => { setShareId(contract.id); setSmsMode(true); }}
          className="mt-3 w-full py-2.5 rounded-xl gold-gradient text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Icon name="FileSignature" size={14} />
          Отправить на подпись
        </button>
      )}

      {menuId === contract.id && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuId(null)} />
          <div className="absolute right-3 top-full -mt-1 z-40 w-44 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
            <button
              onClick={() => { setMenuId(null); onStatus(contract.id, "draft"); }}
              disabled={contract.status === "draft"}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-amber-50 transition-colors disabled:hover:bg-transparent ${contract.status === "draft" ? "text-primary font-medium" : "text-foreground"}`}
            >
              <Icon name="FileText" size={15} className={contract.status === "draft" ? "text-primary" : "text-muted-foreground"} />
              Создан
              {contract.status === "draft" && <Icon name="Check" size={14} className="ml-auto text-primary" />}
            </button>
            {contract.status === "sent" && (
              <div className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-primary font-medium bg-primary/5">
                <Icon name="Send" size={15} className="text-primary" />
                Отправлен на подпись
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">по SMS</span>
              </div>
            )}
            {signed && (
              <div className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-green-700 font-medium bg-green-50">
                <Icon name="CheckCircle" size={15} className="text-green-700" />
                Подписан
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">клиентом</span>
              </div>
            )}
            {deleted ? (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "draft"); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-primary hover:bg-amber-50 transition-colors border-t border-border"
              >
                <Icon name="RotateCcw" size={15} />
                Восстановить
              </button>
            ) : (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "deleted"); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 transition-colors border-t border-border"
              >
                <Icon name="Trash2" size={15} />
                Удалить
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}