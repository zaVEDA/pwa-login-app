import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import PhoneInput from "@/components/ui/phone-input";

interface Props {
  preview: boolean;
  locked: boolean;
  pdfLoading: boolean;
  savedId: number | null;
  copied: boolean;
  shareOpen: boolean;
  confirmClose: boolean;
  saving: boolean;
  onShowPreview: () => void;
  onBackToFill: () => void;
  onDownload: () => void;
  onOpenShare: () => void;
  onOpenSign: () => void;
  onCopy: () => void;
  onCloseShare: () => void;
  onShare: (channel: "telegram" | "whatsapp" | "sms" | "email", clientPhone?: string) => void;
  onSaveAndClose: () => void;
  onCloseWithoutSaving: () => void;
  onCancelClose: () => void;
}

export default function TemplateFillFooter({
  preview,
  locked,
  pdfLoading,
  savedId,
  copied,
  shareOpen,
  confirmClose,
  onShowPreview,
  onBackToFill,
  onDownload,
  onOpenShare,
  onOpenSign,
  onCopy,
  onCloseShare,
  onShare,
  onSaveAndClose,
  onCloseWithoutSaving,
  onCancelClose,
}: Props) {
  const [smsMode, setSmsMode] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");

  useEffect(() => {
    if (!shareOpen) setSmsMode(false);
  }, [shareOpen]);

  return (
    <>
      <div
        className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-5 pt-4 bg-background border-t border-border/50"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
      >
        {!preview ? (
          <button
            onClick={onShowPreview}
            className="w-full py-3.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="FileText" size={16} />
            Показать документ
          </button>
        ) : (
          <div className="space-y-2">
            {!locked && savedId && (
              <button
                onClick={() => { onOpenSign(); setSmsMode(true); }}
                disabled={pdfLoading}
                className="w-full py-3.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                <Icon name="FileSignature" size={16} />
                Отправить на подпись
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={onDownload}
                disabled={pdfLoading}
                className={`flex-1 py-3 rounded-xl text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 ${
                  locked ? "bg-blue-700 text-white" : !savedId ? "gold-gradient text-white" : "border border-border bg-white/70 text-foreground"
                }`}
              >
                <Icon name={pdfLoading ? "Loader" : locked ? "Stamp" : "Download"} size={15} className={pdfLoading ? "animate-spin" : ""} />
                {locked ? "PDF с печатью" : "Скачать Word"}
              </button>
              {!savedId && (
                <button
                  onClick={onCopy}
                  disabled={pdfLoading}
                  className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  <Icon name={copied ? "Check" : "Copy"} size={15} className={copied ? "text-green-600" : ""} />
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              )}
              {savedId && locked && (
                <button
                  onClick={onOpenShare}
                  disabled={pdfLoading}
                  className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  <Icon name="Share2" size={15} />
                  Отправить
                </button>
              )}
            </div>
            {!locked && (
              <button
                onClick={onBackToFill}
                className="w-full py-2.5 text-sm text-muted-foreground flex items-center justify-center gap-1.5"
              >
                <Icon name="ChevronLeft" size={14} />
                Вернуться к заполнению
              </button>
            )}
          </div>
        )}
      </div>

      {shareOpen && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end" onClick={() => { onCloseShare(); setSmsMode(false); }}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-background rounded-t-3xl p-5 pb-10 space-y-2 shadow-2xl border-t border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            {!smsMode ? (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Отправить {locked ? "подписанный документ" : "документ"}
                </p>
                {[
                  { id: "telegram" as const, icon: "Send", label: "Telegram", color: "text-sky-500" },
                  { id: "whatsapp" as const, icon: "MessageCircle", label: "WhatsApp", color: "text-green-500" },
                  { id: "sms" as const, icon: "Smartphone", label: "SMS", color: "text-purple-500" },
                  { id: "email" as const, icon: "Mail", label: "Электронная почта", color: "text-orange-500" },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => ch.id === "sms" ? setSmsMode(true) : onShare(ch.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white/60 active:scale-[0.98] transition-transform"
                  >
                    <Icon name={ch.icon} size={18} className={ch.color} />
                    <span className="text-sm font-medium">{ch.label}</span>
                  </button>
                ))}
                <button onClick={onCloseShare} className="w-full py-3 text-sm text-muted-foreground">
                  Отмена
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Телефон клиента
                </p>
                <PhoneInput
                  autoFocus
                  value={smsPhone}
                  onChange={setSmsPhone}
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-white text-sm font-medium outline-none focus:border-primary"
                />
                <button
                  onClick={() => { onShare("sms", smsPhone); setSmsMode(false); }}
                  disabled={smsPhone.length < 10}
                  className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium disabled:opacity-40"
                >
                  Отправить SMS
                </button>
                <button onClick={() => setSmsMode(false)} className="w-full py-2.5 text-sm text-muted-foreground">
                  Назад
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {confirmClose && (
        <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center px-6">
          <div className="bg-background rounded-2xl p-5 w-full max-w-xs shadow-2xl">
            <p className="text-sm font-medium mb-1">Сохранить изменения?</p>
            <p className="text-xs text-muted-foreground mb-4">
              Документ попадёт в раздел «Договоры». Если закрыть без сохранения — данные никуда не денутся, найдёте их здесь же при следующем открытии.
            </p>
            <div className="space-y-2">
              <button
                onClick={onSaveAndClose}
                className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium"
              >
                Сохранить и закрыть
              </button>
              <button
                onClick={onCloseWithoutSaving}
                className="w-full py-2.5 rounded-xl border border-border bg-white/70 text-sm"
              >
                Закрыть без сохранения
              </button>
              <button
                onClick={onCancelClose}
                className="w-full py-2 text-sm text-muted-foreground"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}