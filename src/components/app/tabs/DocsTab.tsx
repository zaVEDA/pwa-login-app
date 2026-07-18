import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import InvoiceModal from "@/components/app/InvoiceModal";
import DocumentModal from "@/components/app/DocumentModal";
import { formatDate } from "@/lib/date";
import { INVOICES_URL, HELP_URL, HelpTip, Invoice, RealizationDoc } from "./constants";
import type { DateRange } from "react-day-picker";
import { PlanType } from "@/lib/auth";
import DocsFilters from "./docs/DocsFilters";
import InvoiceCard from "./docs/InvoiceCard";
import RealizationDocCard from "./docs/RealizationDocCard";

interface Props {
  phone: string;
  userPlan?: PlanType | null;
}

export default function DocsTab({ phone, userPlan }: Props) {
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<string>("");
  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  // Список клиентов из всех счетов и документов, для выбора в фильтре
  const clientOptions = useMemo(() => {
    const names = new Set<string>();
    invoices.forEach((inv) => { if (inv.client_name) names.add(inv.client_name); });
    realizationDocs.forEach((d) => { if (d.client_name) names.add(d.client_name); });
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, [invoices, realizationDocs]);

  const isInDateRange = (dateStr: string) => {
    if (!dateRange?.from || !dateStr) return true;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const from = new Date(dateRange.from);
    from.setHours(0, 0, 0, 0);
    const to = dateRange.to ? new Date(dateRange.to) : from;
    to.setHours(0, 0, 0, 0);
    return d >= from && d <= to;
  };

  // Счета показываем при: Все, Счета, Черновики
  const showInvoicesList = docFilter === "Все" || docFilter === "Счета" || docFilter === "Черновики";
  const filteredInvoices = invoices.filter((inv) =>
    (docFilter === "Черновики" ? inv.status === "created" : true) &&
    isInDateRange(inv.invoice_date) &&
    (!clientFilter || inv.client_name === clientFilter)
  );
  // Документы реализации показываем при: Все, Акты, Накладные
  const showActs = docFilter === "Все" || docFilter === "Акты";
  const showNotes = docFilter === "Все" || docFilter === "Накладные";
  const filteredDocs = realizationDocs.filter((d) =>
    (d.doc_type === "act" && showActs) || (d.doc_type === "invoice_note" && showNotes)
  ).filter((d) => isInDateRange(d.doc_date) && (!clientFilter || d.client_name === clientFilter));

  const dateFilterLabel = dateRange?.from
    ? dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
      ? `${formatDate(dateRange.from.toISOString())} – ${formatDate(dateRange.to.toISOString())}`
      : formatDate(dateRange.from.toISOString())
    : "Дата";

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
          userPlan={userPlan}
        />
      )}
      {openDocId && (
        <DocumentModal
          docId={openDocId}
          phone={phone}
          onClose={() => setOpenDocId(null)}
          onSaved={loadDocuments}
          userPlan={userPlan}
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

        <DocsFilters
          docFilter={docFilter}
          setDocFilter={setDocFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          datePickerOpen={datePickerOpen}
          setDatePickerOpen={setDatePickerOpen}
          dateFilterLabel={dateFilterLabel}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          clientPickerOpen={clientPickerOpen}
          setClientPickerOpen={setClientPickerOpen}
          clientOptions={clientOptions}
        />

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
              {dateRange?.from || clientFilter
                ? "Ничего не найдено по выбранным фильтрам"
                : docFilter === "Все" ? "Документов пока нет" : `Раздел «${docFilter}» пуст`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange?.from || clientFilter ? "Попробуйте изменить дату или клиента" : "Нажмите + чтобы создать первый счёт"}
            </p>
          </div>
        )}

        {!invoicesLoading && showInvoicesList && filteredInvoices.length > 0 && (
          <div className="space-y-3">
            {filteredInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                inv={inv}
                userPlan={userPlan}
                pdfLoadingId={pdfLoadingId}
                docLoadingId={docLoadingId}
                basisMenuId={basisMenuId}
                setBasisMenuId={setBasisMenuId}
                basisHelp={basisHelp}
                setBasisHelp={setBasisHelp}
                docTips={docTips}
                shareMenuId={shareMenuId}
                setShareMenuId={setShareMenuId}
                statusMenuId={statusMenuId}
                setStatusMenuId={setStatusMenuId}
                setOpenInvoiceId={setOpenInvoiceId}
                setShowInvoice={setShowInvoice}
                downloadPdf={downloadPdf}
                createDocument={createDocument}
                shareInvoice={shareInvoice}
                changeStatus={changeStatus}
                deleteInvoice={deleteInvoice}
              />
            ))}
          </div>
        )}

        {/* Документы реализации: акты и накладные */}
        {filteredDocs.length > 0 && (
          <div className="space-y-3 pt-2">
            {filteredDocs.map((doc) => (
              <RealizationDocCard
                key={`doc-${doc.id}`}
                doc={doc}
                userPlan={userPlan}
                docLoadingId={docLoadingId}
                statusMenuId={statusMenuId}
                setStatusMenuId={setStatusMenuId}
                shareDocId={shareDocId}
                setShareDocId={setShareDocId}
                setOpenDocId={setOpenDocId}
                downloadDocPdf={downloadDocPdf}
                printDocPdf={printDocPdf}
                changeDocStatus={changeDocStatus}
                shareDoc={shareDoc}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
