import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import InvoiceModal from "@/components/app/InvoiceModal";
import DocumentModal from "@/components/app/DocumentModal";
import { formatDate } from "@/lib/date";
import { INVOICES_URL, HELP_URL, HelpTip, Invoice, RealizationDoc } from "./constants";

interface Props {
  phone: string;
}

export default function DocsTab({ phone }: Props) {
  const [showInvoice, setShowInvoice] = useState(false);
  const [openInvoiceId, setOpenInvoiceId] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const downloadPdf = async (id: number, invoiceNumber: string) => {
    if (pdfLoadingId) return;
    setPdfLoadingId(id);
    try {
      const infoRes = await fetch(`${INVOICES_URL}?id=${id}`, { headers: { "X-Phone": phone } });
      const infoRaw = await infoRes.json();
      const info = typeof infoRaw === "string" ? JSON.parse(infoRaw) : infoRaw;
      const inv = info.invoice;
      if (!inv) return;
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "pdf", ...inv }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Счёт_${invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    finally { setPdfLoadingId(null); }
  };

  const [basisMenuId, setBasisMenuId] = useState<number | null>(null);
  const [docLoadingId, setDocLoadingId] = useState<number | null>(null);
  const [basisHelp, setBasisHelp] = useState(false);
  const [docTips, setDocTips] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${HELP_URL}?category=documents`)
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const map: Record<string, string> = {};
        (parsed.tips || []).forEach((t: HelpTip) => { map[t.key] = t.body; });
        setDocTips(map);
      })
      .catch(() => {});
  }, []);

  const createDocument = async (inv: Invoice, docType: "act" | "invoice_note") => {
    setBasisMenuId(null);
    if (docLoadingId) return;
    setDocLoadingId(inv.id);
    try {
      const infoRes = await fetch(`${INVOICES_URL}?id=${inv.id}`, { headers: { "X-Phone": phone } });
      const infoRaw = await infoRes.json();
      const info = typeof infoRaw === "string" ? JSON.parse(infoRaw) : infoRaw;
      const full = info.invoice;
      if (!full) return;
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "document", doc_type: docType, invoice_id: inv.id, no_pdf: true, ...full }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      loadDocuments();
      setDocFilter(docType === "act" ? "Акты" : "Накладные");
      if (parsed.id) setOpenDocId(parsed.id);
    } catch { /* ignore */ }
    finally { setDocLoadingId(null); }
  };

  const changeStatus = async (id: number, status: string) => {
    setStatusMenuId(null);
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    try {
      await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "set_status", id, status }),
      });
    } catch { loadInvoices(); }
  };

  const deleteInvoice = (id: number) => changeStatus(id, "deleted");

  const [shareMenuId, setShareMenuId] = useState<number | null>(null);

  const shareInvoice = (inv: Invoice, channel: "telegram" | "whatsapp" | "sms" | "email") => {
    setShareMenuId(null);
    const who = inv.client_name ? ` для ${inv.client_name}` : "";
    const sum = inv.total ? ` на сумму ${inv.total.toLocaleString("ru-RU")} ₽` : "";
    const text = `Счёт № ${inv.invoice_number}${who}${sum}`;
    const msg = encodeURIComponent(`${text}\nДля оплаты скачайте PDF из приложения.`);
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=&text=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}`,
      sms: `sms:?body=${msg}`,
      email: `mailto:?subject=${encodeURIComponent(`Счёт № ${inv.invoice_number}`)}&body=${msg}`,
    };
    window.open(urls[channel], "_blank");
  };

  const loadInvoices = () => {
    if (!phone) return;
    setInvoicesLoading(true);
    fetch(INVOICES_URL, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setInvoices(parsed.invoices || []);
      })
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  };

  const [realizationDocs, setRealizationDocs] = useState<RealizationDoc[]>([]);
  const [openDocId, setOpenDocId] = useState<number | null>(null);
  const [docFilter, setDocFilter] = useState("Все");

  // Счета показываем при: Все, Счета, Черновики
  const showInvoicesList = docFilter === "Все" || docFilter === "Счета" || docFilter === "Черновики";
  const filteredInvoices = invoices.filter((inv) =>
    docFilter === "Черновики" ? inv.status === "created" : true
  );
  // Документы реализации показываем при: Все, Акты, Накладные
  const showActs = docFilter === "Все" || docFilter === "Акты";
  const showNotes = docFilter === "Все" || docFilter === "Накладные";
  const filteredDocs = realizationDocs.filter((d) =>
    (d.doc_type === "act" && showActs) || (d.doc_type === "invoice_note" && showNotes)
  );

  const loadDocuments = () => {
    if (!phone) return;
    fetch(`${INVOICES_URL}?documents=1`, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setRealizationDocs(parsed.documents || []);
      })
      .catch(() => {});
  };

  const changeDocStatus = async (id: number, status: string) => {
    setStatusMenuId(null);
    setRealizationDocs((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    try {
      await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "set_document_status", id, status }),
      });
    } catch { loadDocuments(); }
  };

  const downloadDocPdf = async (doc: RealizationDoc) => {
    if (docLoadingId) return;
    setDocLoadingId(doc.id);
    try {
      const infoRes = await fetch(`${INVOICES_URL}?document_id=${doc.id}`, { headers: { "X-Phone": phone } });
      const infoRaw = await infoRes.json();
      const info = typeof infoRaw === "string" ? JSON.parse(infoRaw) : infoRaw;
      const full = info.document;
      if (!full) return;
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "document", doc_id: doc.id, ...full }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const label = doc.doc_type === "act" ? "Акт" : "Накладная";
        a.href = url;
        a.download = `${label}_${doc.doc_number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    finally { setDocLoadingId(null); }
  };

  const printDocPdf = async (doc: RealizationDoc) => {
    if (docLoadingId) return;
    setDocLoadingId(doc.id);
    try {
      const infoRes = await fetch(`${INVOICES_URL}?document_id=${doc.id}`, { headers: { "X-Phone": phone } });
      const infoRaw = await infoRes.json();
      const info = typeof infoRaw === "string" ? JSON.parse(infoRaw) : infoRaw;
      const full = info.document;
      if (!full) return;
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "document", doc_id: doc.id, ...full }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (win) win.onload = () => { win.focus(); win.print(); }
      }
    } catch { /* ignore */ }
    finally { setDocLoadingId(null); }
  };

  const [shareDocId, setShareDocId] = useState<number | null>(null);

  const shareDoc = (doc: RealizationDoc, channel: "telegram" | "whatsapp" | "sms" | "email") => {
    setShareDocId(null);
    const label = doc.doc_type === "act" ? "Акт" : "Накладная";
    const who = doc.client_name ? ` для ${doc.client_name}` : "";
    const sum = doc.total ? ` на сумму ${doc.total.toLocaleString("ru-RU")} ₽` : "";
    const msg = encodeURIComponent(`${label} № ${doc.doc_number}${who}${sum}`);
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=&text=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}`,
      sms: `sms:?body=${msg}`,
      email: `mailto:?subject=${encodeURIComponent(`${label} № ${doc.doc_number}`)}&body=${msg}`,
    };
    window.open(urls[channel], "_blank");
  };

  useEffect(() => {
    if (!phone) return;
    loadInvoices();
    loadDocuments();
  }, [phone]);

  return (
    <>
      {showInvoice && (
        <InvoiceModal
          onClose={() => { setShowInvoice(false); setOpenInvoiceId(null); }}
          phone={phone}
          onSaved={loadInvoices}
          invoiceId={openInvoiceId}
        />
      )}
      {openDocId && (
        <DocumentModal
          docId={openDocId}
          phone={phone}
          onClose={() => setOpenDocId(null)}
          onSaved={loadDocuments}
        />
      )}

      <div className="space-y-5 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="font-cormorant text-2xl font-semibold">Мои документы</h2>
          <button
            onClick={() => setShowInvoice(true)}
            className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-sm"
          >
            <Icon name="Plus" size={16} className="text-white" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          {["Все", "Счета", "Акты", "Накладные", "Черновики"].map((f) => (
            <button
              key={f}
              onClick={() => setDocFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                docFilter === f
                  ? "gold-gradient text-white border-transparent"
                  : "bg-white/60 border-border text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {invoicesLoading && (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader" size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!invoicesLoading && (showInvoicesList ? filteredInvoices.length : 0) === 0 && filteredDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name="FileText" size={24} className="text-primary/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {docFilter === "Все" ? "Документов пока нет" : `Раздел «${docFilter}» пуст`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Нажмите + чтобы создать первый счёт</p>
          </div>
        )}

        {!invoicesLoading && showInvoicesList && filteredInvoices.length > 0 && (
          <div className="space-y-3">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
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
                  <p className={`text-xs text-muted-foreground mt-0.5 truncate ${inv.status === "deleted" ? "line-through" : ""}`}>
                    {inv.client_name || "Без клиента"} · {formatDate(inv.invoice_date)}
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
                      disabled={pdfLoadingId === inv.id || inv.status === "deleted"}
                      aria-label="Скачать PDF"
                      className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                    >
                      <Icon name={pdfLoadingId === inv.id ? "Loader" : "FileDown"} size={15} className={pdfLoadingId === inv.id ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => setShareMenuId(shareMenuId === inv.id ? null : inv.id)}
                      disabled={inv.status === "deleted"}
                      aria-label="Отправить счёт"
                      className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                    >
                      <Icon name="Share2" size={14} />
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
                      <div className="fixed inset-0 z-30" onClick={() => { setBasisMenuId(null); setBasisHelp(false); }} />
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
            ))}
          </div>
        )}

        {/* Документы реализации: акты и накладные */}
        {filteredDocs.length > 0 && (
          <div className="space-y-3 pt-2">
            {filteredDocs.map((doc) => (
              <div
                key={`doc-${doc.id}`}
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
                    {doc.doc_type === "act" ? "Акт" : "Накладная"} № {doc.doc_number}
                  </p>
                  <p className={`text-xs text-muted-foreground mt-0.5 truncate ${doc.status === "deleted" ? "line-through" : ""}`}>
                    {doc.client_name || "Без клиента"} · {formatDate(doc.doc_date)}
                    {doc.invoice_number ? ` · сч. ${doc.invoice_number}` : ""}
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
                        disabled={docLoadingId === doc.id || doc.status === "deleted"}
                        aria-label="Скачать PDF"
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                      >
                        <Icon name={docLoadingId === doc.id ? "Loader" : "FileDown"} size={15} className={docLoadingId === doc.id ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => printDocPdf(doc)}
                        disabled={docLoadingId === doc.id || doc.status === "deleted"}
                        aria-label="Печать"
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                      >
                        <Icon name="Printer" size={15} />
                      </button>
                      <button
                        onClick={() => setShareDocId(shareDocId === doc.id ? null : doc.id)}
                        disabled={doc.status === "deleted"}
                        aria-label="Поделиться"
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                      >
                        <Icon name="Share2" size={14} />
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
            ))}
          </div>
        )}
      </div>
    </>
  );
}
