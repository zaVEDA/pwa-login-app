import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { formatDate } from "@/lib/date";
import { PlanType } from "@/lib/auth";

const INVOICES_URL = "https://functions.poehali.dev/b8539077-8a35-46ed-b604-3f9b439fafa1";

const todayStr = () => new Date().toISOString().slice(0, 10);

interface Props {
  docId: number;
  onClose: () => void;
  onSaved?: () => void;
  phone: string;
  userPlan?: PlanType | null;
}

export default function DocumentModal({ docId, onClose, onSaved, phone, userPlan }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [docType, setDocType] = useState<"act" | "invoice_note">("act");
  const [docFormat, setDocFormat] = useState<"simple" | "torg12" | "upd">("simple");
  const [docNumber, setDocNumber] = useState("");
  const [docDate, setDocDate] = useState(todayStr());
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientInn, setClientInn] = useState("");
  const [clientKpp, setClientKpp] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [items, setItems] = useState([{ name: "", qty: "1", price: "" }]);
  const [shareSheet, setShareSheet] = useState(false);
  const [formatSheet, setFormatSheet] = useState(false);
  const [formatIntent, setFormatIntent] = useState<"save" | "pdf">("save");
  const [editing, setEditing] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    fetch(`${INVOICES_URL}?document_id=${docId}`, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(raw => {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        const d = data.document;
        if (!d) return;
        setDocType(d.doc_type || "act");
        setDocFormat(d.doc_format || "simple");
        setDocNumber(d.doc_number || "");
        setDocDate(d.doc_date || todayStr());
        setInvoiceNumber(d.invoice_number || "");
        setClientName(d.client_name || "");
        setClientInn(d.client_inn || "");
        setClientKpp(d.client_kpp || "");
        setClientAddress(d.client_address || "");
        setItems(Array.isArray(d.items) && d.items.length ? d.items : [{ name: "", qty: "1", price: "" }]);
        setSaved(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [docId, phone]);

  const total = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.price) || 0), 0);

  const addItem = () => setItems(prev => [...prev, { name: "", qty: "1", price: "" }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: string) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const payload = () => ({
    id: docId,
    doc_type: docType,
    doc_format: docType === "invoice_note" ? docFormat : "simple",
    doc_date: docDate,
    invoice_number: invoiceNumber,
    client_name: clientName,
    client_inn: clientInn,
    client_kpp: clientKpp,
    client_address: clientAddress,
    items,
    total,
  });

  const doSave = async (format?: "simple" | "torg12" | "upd") => {
    setSaveError(""); setSaving(true);
    const fmt = format ?? docFormat;
    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "update_document", ...payload(), doc_format: docType === "invoice_note" ? fmt : "simple" }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.ok) { setDocFormat(fmt); setSaved(true); setEditing(false); onSaved?.(); }
      else setSaveError("Не удалось сохранить");
    } catch { setSaveError("Ошибка сети"); }
    finally { setSaving(false); }
  };

  const handleSave = () => {
    doSave();
  };

  const handleChooseFormat = (fmt: "simple" | "torg12" | "upd") => {
    setFormatSheet(false);
    setDocFormat(fmt);
    if (formatIntent === "pdf") {
      handlePdf(fmt);
    } else {
      doSave(fmt);
    }
    setFormatIntent("save");
  };

  const openPdf = () => {
    if (docType === "invoice_note") {
      setFormatIntent("pdf");
      setFormatSheet(true);
    } else {
      handlePdf();
    }
  };

  const handlePdf = async (fmt?: "simple" | "torg12" | "upd") => {
    const useFmt = fmt ?? docFormat;
    setPdfLoading(true);
    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "document", doc_id: docId, ...payload(), doc_format: docType === "invoice_note" ? useFmt : "simple" }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const label = docType === "act" ? "Акт" : "Накладная";
        a.href = url;
        a.download = `${label}_${docNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    finally { setPdfLoading(false); }
  };

  const handleShare = (channel: "telegram" | "whatsapp" | "sms" | "email") => {
    setShareSheet(false);
    const label = docType === "act" ? "Акт" : "Накладная";
    const text = `${label} № ${docNumber}${clientName ? ` для ${clientName}` : ""}${total ? ` на сумму ${total.toLocaleString("ru-RU")} ₽` : ""}`;
    const msg = encodeURIComponent(`${text}\nДля получения документа обратитесь к исполнителю.`);
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=&text=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}`,
      sms: `sms:?body=${msg}`,
      email: `mailto:?subject=${encodeURIComponent(`${label} № ${docNumber}`)}&body=${msg}`,
    };
    window.open(urls[channel], "_blank");
  };

  const typeLabel = docType === "act" ? "Акт выполненных работ" : "Товарная накладная";
  const readOnly = saved && !editing;

  if (minimized) {
    return (
      <div
        className="fixed left-4 right-4 z-[60] max-w-md mx-auto"
        style={{ bottom: "calc(6.5rem + env(safe-area-inset-bottom))" }}
      >
        <div
          className="card-warm rounded-2xl px-4 py-3 shadow-lg border flex items-center gap-2.5"
          style={{ borderColor: "hsl(var(--primary) / 0.3)" }}
        >
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Icon name={docType === "act" ? "FileCheck" : "FileText"} size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{typeLabel}{docNumber ? ` № ${docNumber}` : ""}</p>
            <p className="text-xs text-muted-foreground">{total > 0 ? `${total.toLocaleString("ru-RU")} ₽` : "Черновик"}</p>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Развернуть документ"
            className="w-10 h-10 rounded-xl border border-border bg-white/60 flex items-center justify-center flex-shrink-0 active:scale-95 transition-all hover:border-primary"
          >
            <Icon name="ChevronUp" size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            aria-label="Закрыть документ"
            className="w-10 h-10 rounded-xl border border-border bg-white/60 flex items-center justify-center flex-shrink-0 active:scale-95 transition-all hover:border-primary"
          >
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-background" />

      <div className="relative flex flex-col h-full">
        {loading && (
          <div className="absolute inset-0 z-20 bg-background/80 flex items-center justify-center">
            <Icon name="Loader" size={24} className="animate-spin text-primary" />
          </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMinimized(true)}
              aria-label="Свернуть документ"
              className="w-9 h-9 flex-shrink-0 rounded-xl border border-border bg-white/60 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="font-cormorant text-2xl font-semibold leading-tight truncate">{typeLabel}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">№</span>
                <span className="text-xs font-medium text-primary">{docNumber}</span>
                <span className="text-xs text-muted-foreground">от</span>
                <span className="text-xs text-foreground">{formatDate(docDate)}</span>
              </div>
            </div>
            {readOnly ? (
              /* Кнопка Изменить */
              <button
                onClick={() => setEditing(true)}
                className="h-9 flex items-center gap-1.5 text-xs font-medium text-white gold-gradient rounded-xl px-3.5 shadow-sm active:scale-95 transition-transform flex-shrink-0"
              >
                <Icon name="Pencil" size={13} />
                Изменить
              </button>
            ) : (
              /* Переключатель типа */
              <button
                onClick={() => setDocType(t => t === "act" ? "invoice_note" : "act")}
                className="h-9 text-[11px] text-primary border border-primary/30 rounded-xl px-2.5 flex-shrink-0 hover:border-primary transition-colors"
              >
                {docType === "act" ? "Накладная" : "Акт"}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex-shrink-0 rounded-xl border border-border bg-white/60 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scroll content */}
        <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-52`}>

          {/* Дата документа */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Дата документа</p>
            <input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} readOnly={readOnly} disabled={readOnly}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary disabled:opacity-70" />
          </div>

          {/* Клиент */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {docType === "act" ? "Заказчик" : "Покупатель"}
            </p>
            <input value={clientName} onChange={e => setClientName(e.target.value)} readOnly={readOnly}
              placeholder="Имя или название организации"
              className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
            <input value={clientInn} onChange={e => setClientInn(e.target.value)} readOnly={readOnly}
              placeholder="ИНН"
              className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
            {docType === "invoice_note" && (
              <input value={clientKpp} onChange={e => setClientKpp(e.target.value.replace(/\D/g, "").slice(0, 9))} readOnly={readOnly}
                placeholder="КПП (для организаций)"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
            )}
            <input value={clientAddress} onChange={e => setClientAddress(e.target.value)} readOnly={readOnly}
              placeholder="Адрес"
              className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
          </div>

          {/* Основание */}
          {invoiceNumber && (
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Основание</p>
              <p className="text-sm text-muted-foreground">Счёт № {invoiceNumber}</p>
            </div>
          )}

          {/* Позиции */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {docType === "act" ? "Услуги / работы" : "Товары"}
            </p>
            {items.map((item, i) => (
              <div key={i} className="card-warm rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Позиция {i + 1}</p>
                  {items.length > 1 && !readOnly && (
                    <button onClick={() => removeItem(i)}>
                      <Icon name="Trash2" size={13} className="text-red-400" />
                    </button>
                  )}
                </div>
                <input value={item.name} onChange={e => updateItem(i, "name", e.target.value)} readOnly={readOnly}
                  placeholder={docType === "act" ? "Название услуги или работы" : "Название товара"}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Кол-во</label>
                    <input type="text" inputMode="decimal" value={item.qty} onChange={e => updateItem(i, "qty", e.target.value)} readOnly={readOnly}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Цена, ₽</label>
                    <input type="text" inputMode="decimal" value={item.price} onChange={e => updateItem(i, "price", e.target.value)} readOnly={readOnly}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary read-only:opacity-70" />
                  </div>
                </div>
              </div>
            ))}
            {!readOnly && (
              <button onClick={addItem}
                className="w-full py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Icon name="Plus" size={13} />
                Добавить позицию
              </button>
            )}
          </div>
        </div>

        {/* Format sheet (только для накладной) */}
        {formatSheet && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end" onClick={() => setFormatSheet(false)}>
            <div className="bg-background rounded-t-3xl p-5 pb-10 space-y-3 shadow-2xl border-t border-border/50" onClick={e => e.stopPropagation()}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Форма накладной</p>
              {[
                { id: "simple" as const, icon: "FileText", label: "Обычная накладная", desc: "Простая форма без унифицированного шаблона" },
                { id: "torg12" as const, icon: "FileSpreadsheet", label: "ТОРГ-12", desc: "Унифицированная форма товарной накладной" },
                { id: "upd" as const, icon: "FileCheck2", label: "УПД", desc: "Универсальный передаточный документ" },
              ].map(f => (
                <button key={f.id} onClick={() => handleChooseFormat(f.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white/60 active:scale-[0.98] transition-transform text-left">
                  <Icon name={f.icon} size={18} className="text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.desc}</p>
                  </div>
                </button>
              ))}
              <button onClick={() => setFormatSheet(false)} className="w-full py-3 text-sm text-muted-foreground">Отмена</button>
            </div>
          </div>
        )}

        {/* Share sheet */}
        {shareSheet && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end" onClick={() => setShareSheet(false)}>
            <div className="bg-background rounded-t-3xl p-5 pb-10 space-y-3 shadow-2xl border-t border-border/50" onClick={e => e.stopPropagation()}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Отправить через</p>
              {[
                { id: "telegram" as const, icon: "Send", label: "Telegram", color: "text-sky-500" },
                { id: "whatsapp" as const, icon: "MessageCircle", label: "WhatsApp", color: "text-green-500" },
                { id: "sms" as const, icon: "Smartphone", label: "SMS", color: "text-purple-500" },
                { id: "email" as const, icon: "Mail", label: "Электронная почта", color: "text-orange-500" },
              ].map(ch => (
                <button key={ch.id} onClick={() => handleShare(ch.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white/60 active:scale-[0.98] transition-transform">
                  <Icon name={ch.icon} size={18} className={ch.color} />
                  <span className="text-sm font-medium">{ch.label}</span>
                </button>
              ))}
              <button onClick={() => setShareSheet(false)} className="w-full py-3 text-sm text-muted-foreground">Отмена</button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-5 pt-4 bg-background border-t border-border/50"
          style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
          {saveError && (
            <div className="mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-[11px] text-red-600">{saveError}</p>
            </div>
          )}
          <div className="flex items-end justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Итого</p>
              <p className="font-cormorant text-2xl font-semibold text-foreground leading-tight truncate">
                {total.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            {!readOnly ? (
              <button onClick={handleSave} disabled={saving}
                className="flex-shrink-0 px-5 py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-60 flex items-center gap-2">
                {saving ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Save" size={15} />}
                {saving ? "Сохраняю..." : "Сохранить"}
              </button>
            ) : (
              <div className="flex-shrink-0 flex items-center gap-1.5 text-green-600">
                <Icon name="CheckCircle" size={15} className="flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">№ {docNumber} сохранён</span>
              </div>
            )}
          </div>
          {readOnly && !userPlan && (
            <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
              <Icon name="Lock" size={14} className="text-amber-600 flex-shrink-0" />
              <p className="text-[11px] text-amber-700">Выберите тариф в Аккаунте, чтобы скачать PDF и отправить документ</p>
            </div>
          )}
          {readOnly && (
            <div className="flex gap-2">
              <button onClick={openPdf} disabled={pdfLoading || !userPlan}
                className="flex-1 py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50">
                {pdfLoading ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name={userPlan ? "FileDown" : "Lock"} size={14} />}
                {pdfLoading ? "Генерирую..." : "Скачать PDF"}
              </button>
              <button onClick={() => setShareSheet(true)} disabled={!userPlan}
                className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50">
                <Icon name={userPlan ? "Share2" : "Lock"} size={14} />
                Отправить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}