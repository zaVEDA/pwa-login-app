import Icon from "@/components/ui/icon";

interface Props {
  total: number;
  saved: boolean;
  editing: boolean;
  readOnly: boolean;
  saveLoading: boolean;
  saveError: string;
  pdfLoading: boolean;
  invoiceNumber: string;
  showShareSheet: boolean;
  setShowShareSheet: (v: boolean) => void;
  handleSave: () => void;
  handleCreatePdf: () => void;
  handleShare: (channel: "email" | "telegram" | "whatsapp" | "sms") => void;
  noPlan?: boolean;
}

export default function InvoiceModalFooter({
  total,
  saved,
  editing,
  readOnly,
  saveLoading,
  saveError,
  pdfLoading,
  invoiceNumber,
  showShareSheet,
  setShowShareSheet,
  handleSave,
  handleCreatePdf,
  handleShare,
  noPlan,
}: Props) {
  return (
    <>
      {/* Share sheet */}
      {showShareSheet && (
        <div
          className="absolute inset-0 z-10 flex flex-col justify-end"
          onClick={() => setShowShareSheet(false)}
        >
          <div
            className="bg-background rounded-t-3xl p-5 pb-10 space-y-3 shadow-2xl border-t border-border/50"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Отправить счёт через</p>
            {[
              { id: "telegram" as const, icon: "Send", label: "Telegram", color: "text-sky-500" },
              { id: "whatsapp" as const, icon: "MessageCircle", label: "WhatsApp", color: "text-green-500" },
              { id: "sms" as const, icon: "Smartphone", label: "SMS", color: "text-purple-500" },
              { id: "email" as const, icon: "Mail", label: "Электронная почта", color: "text-orange-500" },
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => handleShare(ch.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white/60 active:scale-[0.98] transition-transform"
              >
                <Icon name={ch.icon} size={18} className={ch.color} />
                <span className="text-sm font-medium">{ch.label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowShareSheet(false)}
              className="w-full py-3 text-sm text-muted-foreground"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-5 pt-4 bg-background border-t border-border/50"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        {saveError && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
            <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-[11px] text-red-600">{saveError}</p>
          </div>
        )}
        {saved && noPlan && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
            <Icon name="Lock" size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-[11px] text-amber-700">Выберите тариф в Аккаунте, чтобы скачать PDF и отправить документ</p>
          </div>
        )}
        <div className="flex items-end justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Итого к оплате</p>
            <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-foreground leading-tight truncate">
              {total.toLocaleString("ru-RU")} ₽
            </p>
          </div>
          {/* Кнопка Сохранить */}
          {!saved || editing ? (
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="flex-shrink-0 px-5 py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.97] transition-transform flex items-center gap-2 disabled:opacity-60"
            >
              {saveLoading
                ? <Icon name="Loader" size={15} className="animate-spin" />
                : <Icon name="Save" size={15} />
              }
              {saveLoading ? "Сохраняю..." : editing ? "Сохранить изменения" : "Сохранить"}
            </button>
          ) : (
            <div className="flex-shrink-0 flex items-center gap-1.5 text-green-600">
              <Icon name="CheckCircle" size={15} className="flex-shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">№ {invoiceNumber} сохранён</span>
            </div>
          )}
        </div>

        {/* Кнопки действий — появляются после сохранения (кроме режима редактирования) */}
        {readOnly && (
          <div className="flex gap-2">
            <button
              onClick={handleCreatePdf}
              disabled={pdfLoading || noPlan}
              className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {pdfLoading
                ? <Icon name="Loader" size={14} className="animate-spin" />
                : <Icon name={noPlan ? "Lock" : "FileDown"} size={14} />
              }
              {pdfLoading ? "Генерирую..." : "Скачать PDF"}
            </button>
            <button
              onClick={() => setShowShareSheet(true)}
              disabled={noPlan}
              className="flex-1 py-3 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              <Icon name={noPlan ? "Lock" : "Share2"} size={14} />
              Отправить
            </button>
          </div>
        )}
      </div>
    </>
  );
}