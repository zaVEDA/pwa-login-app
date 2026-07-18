import Icon from "@/components/ui/icon";
import { formatDate } from "@/lib/date";
import { RealizationDoc } from "../constants";
import { PlanType } from "@/lib/auth";

interface Props {
  doc: RealizationDoc;
  userPlan?: PlanType | null;
  docLoadingId: number | null;
  statusMenuId: number | null;
  setStatusMenuId: (id: number | null) => void;
  shareDocId: number | null;
  setShareDocId: (id: number | null) => void;
  setOpenDocId: (id: number | null) => void;
  downloadDocPdf: (doc: RealizationDoc) => void;
  printDocPdf: (doc: RealizationDoc) => void;
  changeDocStatus: (id: number, status: string) => void;
  shareDoc: (doc: RealizationDoc, channel: "telegram" | "whatsapp" | "sms" | "email") => void;
}

export default function RealizationDocCard({
  doc,
  userPlan,
  docLoadingId,
  statusMenuId,
  setStatusMenuId,
  shareDocId,
  setShareDocId,
  setOpenDocId,
  downloadDocPdf,
  printDocPdf,
  changeDocStatus,
  shareDoc,
}: Props) {
  return (
    <div
      className={`relative w-full card-warm rounded-2xl p-4 shadow-sm flex gap-3 transition-opacity ${doc.status === "deleted" ? "opacity-50" : ""}`}
    >
      {/* Иконка */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${doc.status === "deleted" ? "bg-gray-200" : "bg-primary/10"}`}>
        <Icon name={doc.doc_type === "act" ? "FileCheck" : "Package"} size={19} className={doc.status === "deleted" ? "text-gray-400" : "text-primary"} />
      </div>

      {/* Кликабельная зона */}
      <button
        onClick={() => setOpenDocId(doc.id)}
        className="flex-1 min-w-0 text-left active:scale-[0.98] transition-transform"
      >
        <p className={`text-sm font-medium ${doc.status === "deleted" ? "line-through text-muted-foreground" : ""}`}>
          {doc.doc_type === "act" ? "Акт" : "Накладная"}
        </p>
        <p className={`text-xs text-muted-foreground mt-0.5 ${doc.status === "deleted" ? "line-through" : ""}`}>
          № {doc.doc_number}
        </p>
        <p className={`text-xs text-muted-foreground mt-0.5 ${doc.status === "deleted" ? "line-through" : ""}`}>
          {formatDate(doc.doc_date)}{doc.invoice_number ? ` · сч. ${doc.invoice_number}` : ""}
        </p>
        <p className={`text-xs text-muted-foreground mt-0.5 truncate ${doc.status === "deleted" ? "line-through" : ""}`}>
          {doc.client_name || "Без клиента"}
        </p>
      </button>

      {/* Правый блок: сумма + кнопки + статус */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <p className={`font-cormorant text-xl font-semibold leading-none tabular-nums ${doc.status === "deleted" ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {doc.total != null ? doc.total.toLocaleString("ru-RU") : "—"}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => downloadDocPdf(doc)}
              disabled={docLoadingId === doc.id || doc.status === "deleted" || !userPlan}
              aria-label={userPlan ? "Скачать PDF" : "Выберите тариф в Аккаунте"}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Icon name={docLoadingId === doc.id ? "Loader" : userPlan ? "FileDown" : "Lock"} size={15} className={docLoadingId === doc.id ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => printDocPdf(doc)}
              disabled={docLoadingId === doc.id || doc.status === "deleted" || !userPlan}
              aria-label={userPlan ? "Печать" : "Выберите тариф в Аккаунте"}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Icon name={userPlan ? "Printer" : "Lock"} size={15} />
            </button>
            <button
              onClick={() => setShareDocId(shareDocId === doc.id ? null : doc.id)}
              disabled={doc.status === "deleted" || !userPlan}
              aria-label={userPlan ? "Поделиться" : "Выберите тариф в Аккаунте"}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Icon name={userPlan ? "Share2" : "Lock"} size={14} />
            </button>
          </div>
        </div>
        <button
          onClick={() => setStatusMenuId(statusMenuId === -doc.id ? null : -doc.id)}
          className={`doc-tag flex items-center gap-1 active:scale-95 transition-transform ${
            doc.status === "deleted" ? "bg-red-100 text-red-600" :
            doc.status === "issued" ? "bg-blue-100 text-blue-700" :
            doc.status === "paid" ? "bg-green-100 text-green-700" :
            "bg-amber-100 text-amber-700"
          }`}
        >
          {doc.status === "deleted" ? "Удалён" :
            doc.status === "issued" ? "Выставлен" :
            doc.status === "paid" ? "Оплачен" : "Создан"}
          <Icon name="ChevronDown" size={11} />
        </button>
      </div>

      {statusMenuId === -doc.id && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setStatusMenuId(null)} />
          <div className="absolute right-3 top-full -mt-1 z-40 w-44 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
            {([
              { key: "created", label: "Создан", icon: "FileText" },
              { key: "issued", label: "Выставлен", icon: "Send" },
              { key: "paid", label: "Оплачен", icon: "CheckCircle" },
            ] as const).map((s) => (
              <button key={s.key} onClick={() => changeDocStatus(doc.id, s.key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-amber-50 transition-colors ${doc.status === s.key ? "text-primary font-medium" : "text-foreground"}`}
              >
                <Icon name={s.icon} size={15} className={doc.status === s.key ? "text-primary" : "text-muted-foreground"} />
                {s.label}
                {doc.status === s.key && <Icon name="Check" size={14} className="ml-auto text-primary" />}
              </button>
            ))}
            {doc.status === "deleted" ? (
              <button onClick={() => changeDocStatus(doc.id, "created")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-primary hover:bg-amber-50 transition-colors border-t border-border">
                <Icon name="RotateCcw" size={15} />
                Восстановить
              </button>
            ) : (
              <button onClick={() => changeDocStatus(doc.id, "deleted")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 transition-colors border-t border-border">
                <Icon name="Trash2" size={15} />
                Удалить
              </button>
            )}
          </div>
        </>
      )}

      {shareDocId === doc.id && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShareDocId(null)} />
          <div className="absolute right-3 top-12 z-40 w-44 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in">
            {([
              { key: "telegram", label: "Telegram", icon: "Send" },
              { key: "whatsapp", label: "WhatsApp", icon: "MessageCircle" },
              { key: "sms", label: "SMS", icon: "Smartphone" },
              { key: "email", label: "Почта", icon: "Mail" },
            ] as const).map((c) => (
              <button key={c.key} onClick={() => shareDoc(doc, c.key)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors">
                <Icon name={c.icon} size={15} className="text-primary" />
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
