import Icon from "@/components/ui/icon";
import { formatDate } from "@/lib/date";
import { Invoice } from "../constants";
import { PlanType } from "@/lib/auth";

interface Props {
  inv: Invoice;
  userPlan?: PlanType | null;
  pdfLoadingId: number | null;
  docLoadingId: number | null;
  basisMenuId: number | null;
  setBasisMenuId: (id: number | null) => void;
  basisHelp: boolean;
  setBasisHelp: (fn: (v: boolean) => boolean) => void;
  docTips: Record<string, string>;
  shareMenuId: number | null;
  setShareMenuId: (id: number | null) => void;
  statusMenuId: number | null;
  setStatusMenuId: (id: number | null) => void;
  setOpenInvoiceId: (id: number | null) => void;
  setShowInvoice: (v: boolean) => void;
  downloadPdf: (id: number, invoiceNumber: string) => void;
  createDocument: (inv: Invoice, docType: "act" | "invoice_note") => void;
  shareInvoice: (inv: Invoice, channel: "telegram" | "whatsapp" | "sms" | "email") => void;
  changeStatus: (id: number, status: string) => void;
  deleteInvoice: (id: number) => void;
}

export default function InvoiceCard({
  inv,
  userPlan,
  pdfLoadingId,
  docLoadingId,
  basisMenuId,
  setBasisMenuId,
  basisHelp,
  setBasisHelp,
  docTips,
  shareMenuId,
  setShareMenuId,
  statusMenuId,
  setStatusMenuId,
  setOpenInvoiceId,
  setShowInvoice,
  downloadPdf,
  createDocument,
  shareInvoice,
  changeStatus,
  deleteInvoice,
}: Props) {
  return (
    <div
      className={`relative w-full card-warm rounded-2xl p-4 shadow-sm flex gap-3 transition-opacity ${inv.status === "deleted" ? "opacity-50" : ""}`}
    >
      {/* Иконка */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${inv.status === "deleted" ? "bg-gray-200" : "bg-primary/10"}`}>
        <span className={`font-cormorant font-bold text-xl leading-none ${inv.status === "deleted" ? "text-gray-400" : "text-primary"}`}>₽</span>
      </div>

      {/* Текст — кликабельная зона */}
      <button
        onClick={() => { setOpenInvoiceId(inv.id); setShowInvoice(true); }}
        className="flex-1 min-w-0 text-left"
      >
        <p className={`text-sm font-medium ${inv.status === "deleted" ? "line-through text-muted-foreground" : ""}`}>
          Счёт № {inv.invoice_number}
        </p>
        <p className={`text-xs text-muted-foreground mt-0.5 ${inv.status === "deleted" ? "line-through" : ""}`}>
          {formatDate(inv.invoice_date)}
        </p>
        <p className={`text-xs text-muted-foreground mt-0.5 truncate ${inv.status === "deleted" ? "line-through" : ""}`}>
          {inv.client_name || "Без клиента"}
        </p>
      </button>

      {/* Правый блок: сумма + кнопки + статус */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <p className={`font-cormorant text-xl font-semibold leading-none tabular-nums text-left ${inv.status === "deleted" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {inv.total != null ? inv.total.toLocaleString("ru-RU") : "—"}
          </p>
          <div className="flex items-center gap-1">
          <button
            onClick={() => downloadPdf(inv.id, inv.invoice_number)}
            disabled={pdfLoadingId === inv.id || inv.status === "deleted" || !userPlan}
            aria-label={userPlan ? "Скачать PDF" : "Выберите тариф в Аккаунте"}
            className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Icon name={pdfLoadingId === inv.id ? "Loader" : userPlan ? "FileDown" : "Lock"} size={15} className={pdfLoadingId === inv.id ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShareMenuId(shareMenuId === inv.id ? null : inv.id)}
            disabled={inv.status === "deleted" || !userPlan}
            aria-label={userPlan ? "Отправить счёт" : "Выберите тариф в Аккаунте"}
            className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Icon name={userPlan ? "Share2" : "Lock"} size={14} />
          </button>
          <button
            onClick={() => setBasisMenuId(basisMenuId === inv.id ? null : inv.id)}
            disabled={docLoadingId === inv.id || inv.status === "deleted"}
            aria-label="Создать на основании"
            className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Icon name={docLoadingId === inv.id ? "Loader" : "FilePlus"} size={15} className={docLoadingId === inv.id ? "animate-spin" : ""} />
          </button>
          </div>
        </div>

        {basisMenuId === inv.id && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => { setBasisMenuId(null); setBasisHelp(() => false); }} />
            <div className="absolute right-3 top-12 z-40 w-64 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Создать на основании</p>
                <button
                  onClick={() => setBasisHelp((v) => !v)}
                  aria-label="Справка"
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${basisHelp ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                >
                  <Icon name="HelpCircle" size={13} />
                </button>
              </div>
              <button
                onClick={() => createDocument(inv, "act")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors"
              >
                <Icon name="FileCheck" size={15} className="text-primary flex-shrink-0" />
                Акт выполненных работ
              </button>
              {basisHelp && docTips["doc_act"] && (
                <p className="px-3.5 pb-2 -mt-1 text-[11px] leading-snug text-muted-foreground bg-amber-50/60">
                  {docTips["doc_act"]}
                </p>
              )}
              <button
                onClick={() => createDocument(inv, "invoice_note")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors border-t border-border/40"
              >
                <Icon name="Package" size={15} className="text-primary flex-shrink-0" />
                Товарная накладная
              </button>
              {basisHelp && docTips["doc_invoice_note"] && (
                <p className="px-3.5 pb-2 -mt-1 text-[11px] leading-snug text-muted-foreground bg-amber-50/60">
                  {docTips["doc_invoice_note"]}
                </p>
              )}
            </div>
          </>
        )}

        {shareMenuId === inv.id && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShareMenuId(null)} />
            <div className="absolute right-3 top-12 z-40 w-44 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
              {([
                { key: "telegram", label: "Telegram", icon: "Send" },
                { key: "whatsapp", label: "WhatsApp", icon: "MessageCircle" },
                { key: "sms", label: "SMS", icon: "Smartphone" },
                { key: "email", label: "Почта", icon: "Mail" },
              ] as const).map((c) => (
                <button
                  key={c.key}
                  onClick={() => shareInvoice(inv, c.key)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors"
                >
                  <Icon name={c.icon} size={15} className="text-primary" />
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setStatusMenuId(statusMenuId === inv.id ? null : inv.id)}
          className={`doc-tag flex items-center gap-1 active:scale-95 transition-transform ${
            inv.status === "deleted" ? "bg-red-100 text-red-600" :
            inv.status === "issued" ? "bg-blue-100 text-blue-700" :
            inv.status === "paid" ? "bg-green-100 text-green-700" :
            "bg-amber-100 text-amber-700"
          }`}
        >
          {inv.status === "deleted" ? "Удалён" :
            inv.status === "issued" ? "Выставлен" :
            inv.status === "paid" ? "Оплачен" : "Создан"}
          <Icon name="ChevronDown" size={11} />
        </button>
      </div>

      {statusMenuId === inv.id && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setStatusMenuId(null)} />
          <div className="absolute right-3 top-full -mt-1 z-40 w-44 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
            {([
              { key: "created", label: "Создан", icon: "FileText" },
              { key: "issued", label: "Выставлен", icon: "Send" },
              { key: "paid", label: "Оплачен", icon: "CheckCircle" },
            ] as const).map((s) => (
              <button
                key={s.key}
                onClick={() => changeStatus(inv.id, s.key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-amber-50 transition-colors ${inv.status === s.key ? "text-primary font-medium" : "text-foreground"}`}
              >
                <Icon name={s.icon} size={15} className={inv.status === s.key ? "text-primary" : "text-muted-foreground"} />
                {s.label}
                {inv.status === s.key && <Icon name="Check" size={14} className="ml-auto text-primary" />}
              </button>
            ))}
            {inv.status === "deleted" ? (
              <button
                onClick={() => changeStatus(inv.id, "created")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-primary hover:bg-amber-50 transition-colors border-t border-border"
              >
                <Icon name="RotateCcw" size={15} />
                Восстановить
              </button>
            ) : (
              <button
                onClick={() => deleteInvoice(inv.id)}
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
