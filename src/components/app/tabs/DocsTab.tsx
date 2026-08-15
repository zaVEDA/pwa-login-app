import { useState, useEffect, useMemo } from "react";
import { formatDate } from "@/lib/date";
import { INVOICES_URL, HELP_URL, CONTRACTS_URL, HelpTip, Invoice, RealizationDoc, Contract } from "./constants";
import type { DateRange } from "react-day-picker";
import { PlanType } from "@/lib/auth";
import { toast } from "sonner";
import DocsTabModals from "./docs/DocsTabModals";
import DocsTabHeader from "./docs/DocsTabHeader";
import DocsTabList from "./docs/DocsTabList";

interface Props {
  phone: string;
  userPlan?: PlanType | null;
  userEmail?: string | null;
  onDocCreated?: () => void;
  onGoToAccount?: () => void;
}

export default function DocsTab({ phone, userPlan, userEmail, onDocCreated, onGoToAccount }: Props) {
  const [showInvoice, setShowInvoice] = useState(false);
  const [openInvoiceId, setOpenInvoiceId] = useState<number | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [newAgreementDoc, setNewAgreementDoc] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  const [pdfWarnOpen, setPdfWarnOpen] = useState(false);
  const [pendingPdf, setPendingPdf] = useState<(() => void) | null>(null);
  const [warnAction, setWarnAction] = useState<"save" | "send">("save");

  const askPdfConfirm = (fn: () => void, action: "save" | "send" = "save") => {
    setPendingPdf(() => fn);
    setWarnAction(action);
    setPdfWarnOpen(true);
  };

  const downloadPdf = (id: number, invoiceNumber: string) =>
    askPdfConfirm(() => doDownloadPdf(id, invoiceNumber));

  const doDownloadPdf = async (id: number, invoiceNumber: string) => {
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
      if (res.status === 403) {
        toast("Лимит документов на этом месяце исчерпан. Докупите пакет или смените тариф.", { icon: "📦" });
        return;
      }
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      loadDocuments();
      onDocCreated?.();
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
    askPdfConfirm(() => doShareInvoice(inv, channel), "send");
  };

  const doShareInvoice = (inv: Invoice, channel: "telegram" | "whatsapp" | "sms" | "email") => {
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

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractMenuId, setContractMenuId] = useState<number | null>(null);
  const [openContract, setOpenContract] = useState<Contract | null>(null);
  const [contractPdfId, setContractPdfId] = useState<number | null>(null);
  const [contractShareId, setContractShareId] = useState<number | null>(null);
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
    contracts.forEach((c) => { if (c.client_name) names.add(c.client_name); });
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, [invoices, realizationDocs, contracts]);

  const isInDateRange = (dateStr: string) => {
    if (!dateRange?.from) return true;
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
  const isContractStatusFilter = docFilter === "Отправленные" || docFilter === "Подписанные";
  const filteredInvoices = invoices.filter((inv) =>
    (docFilter === "Черновики" ? inv.status === "created" : true) &&
    isInDateRange(inv.invoice_date) &&
    (!clientFilter || inv.client_name === clientFilter)
  );
  // Документы реализации показываем при: Все, Акты, Накладные
  const showActs = docFilter === "Акты" || (docFilter === "Все" && !isContractStatusFilter);
  const showNotes = docFilter === "Накладные" || (docFilter === "Все" && !isContractStatusFilter);
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

  const downloadDocPdf = (doc: RealizationDoc) => askPdfConfirm(() => doDownloadDocPdf(doc));
  const printDocPdf = (doc: RealizationDoc) => askPdfConfirm(() => doPrintDocPdf(doc));

  const doDownloadDocPdf = async (doc: RealizationDoc) => {
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

  const doPrintDocPdf = async (doc: RealizationDoc) => {
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
    askPdfConfirm(() => doShareDoc(doc, channel), "send");
  };

  const doShareDoc = (doc: RealizationDoc, channel: "telegram" | "whatsapp" | "sms" | "email") => {
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

  const loadContracts = () => {
    if (!phone) return;
    fetch(CONTRACTS_URL, { headers: { "X-Phone": phone } })
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setContracts(parsed.contracts || []);
      })
      .catch(() => {});
  };

  const changeContractStatus = async (id: number, status: string) => {
    setContracts((prev) => status === "deleted"
      ? prev.filter((c) => c.id !== id)
      : prev.map((c) => c.id === id ? { ...c, status } : c));
    try {
      await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "set_status", id, status }),
      });
    } catch { loadContracts(); }
  };

  const shareContract = async (c: Contract, channel: "telegram" | "whatsapp" | "sms" | "email", clientPhone?: string) => {
    setContractShareId(null);
    if (contractPdfId) return;
    setContractPdfId(c.id);
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "share_link", id: c.id, origin: window.location.origin, channel, client_phone: clientPhone }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!parsed.url) { toast("Не удалось подготовить ссылку"); return; }

      const signedNote = c.status === "signed" ? " (подписан электронной подписью)" : "";
      const text = `${c.title} № ${c.contract_number}${signedNote}\nСсылка действует 1 час:\n${parsed.url}`;
      const msg = encodeURIComponent(text);
      const smsTarget = clientPhone ? `+7${clientPhone}` : "";
      const urls: Record<string, string> = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(parsed.url)}&text=${encodeURIComponent(`${c.title} № ${c.contract_number}${signedNote}`)}`,
        whatsapp: `https://wa.me/?text=${msg}`,
        sms: `sms:${smsTarget}?body=${msg}`,
        email: `mailto:?subject=${encodeURIComponent(`${c.title} № ${c.contract_number}`)}&body=${msg}`,
      };
      window.open(urls[channel], "_blank");
      loadContracts();
      toast(channel === "sms" ? "SMS со ссылкой отправлено. Она действует 1 час." : "Ссылка отправлена. Она действует 1 час.", { icon: "⏱" });
    } catch { toast("Нет связи с сервером"); }
    finally { setContractPdfId(null); }
  };

  const downloadContractPdf = async (c: Contract) => {
    if (contractPdfId) return;
    setContractPdfId(c.id);
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "pdf", id: c.id }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), (ch) => ch.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${c.title}_${c.contract_number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    finally { setContractPdfId(null); }
  };

  const CONTRACT_STATUS_FILTER: Record<string, string> = {
    "Черновики": "draft",
    "Отправленные": "sent",
    "Подписанные": "signed",
  };
  const showContracts = docFilter === "Все" || docFilter === "Договоры" || !!CONTRACT_STATUS_FILTER[docFilter];
  const filteredContracts = contracts.filter((c) =>
    (CONTRACT_STATUS_FILTER[docFilter] ? c.status === CONTRACT_STATUS_FILTER[docFilter] : true) &&
    isInDateRange(c.contract_date) &&
    (!clientFilter || c.client_name === clientFilter)
  );

  useEffect(() => {
    if (!phone) return;
    loadInvoices();
    loadDocuments();
    loadContracts();
  }, [phone]);

  return (
    <>
      <DocsTabModals
        phone={phone}
        userPlan={userPlan}
        userEmail={userEmail}
        onDocCreated={onDocCreated}
        onGoToAccount={onGoToAccount}
        showInvoice={showInvoice}
        setShowInvoice={setShowInvoice}
        openInvoiceId={openInvoiceId}
        setOpenInvoiceId={setOpenInvoiceId}
        loadInvoices={loadInvoices}
        openContract={openContract}
        setOpenContract={setOpenContract}
        loadContracts={loadContracts}
        newAgreementDoc={newAgreementDoc}
        setNewAgreementDoc={setNewAgreementDoc}
        openDocId={openDocId}
        setOpenDocId={setOpenDocId}
        loadDocuments={loadDocuments}
        pdfWarnOpen={pdfWarnOpen}
        setPdfWarnOpen={setPdfWarnOpen}
        pendingPdf={pendingPdf}
        setPendingPdf={setPendingPdf}
        warnAction={warnAction}
      />

      <div className="space-y-5 animate-slide-up">
        <DocsTabHeader
          docFilter={docFilter}
          setDocFilter={setDocFilter}
          showTemplatePicker={showTemplatePicker}
          setShowTemplatePicker={setShowTemplatePicker}
          setShowInvoice={setShowInvoice}
          setNewAgreementDoc={setNewAgreementDoc}
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

        <DocsTabList
          invoicesLoading={invoicesLoading}
          dateRange={dateRange}
          clientFilter={clientFilter}
          docFilter={docFilter}
          showInvoicesList={showInvoicesList}
          filteredInvoices={filteredInvoices}
          showContracts={showContracts}
          filteredContracts={filteredContracts}
          filteredDocs={filteredDocs}
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
          contractMenuId={contractMenuId}
          setContractMenuId={setContractMenuId}
          setOpenContract={setOpenContract}
          changeContractStatus={changeContractStatus}
          downloadContractPdf={downloadContractPdf}
          contractPdfId={contractPdfId}
          contractShareId={contractShareId}
          setContractShareId={setContractShareId}
          shareContract={shareContract}
          shareDocId={shareDocId}
          setShareDocId={setShareDocId}
          setOpenDocId={setOpenDocId}
          downloadDocPdf={downloadDocPdf}
          printDocPdf={printDocPdf}
          changeDocStatus={changeDocStatus}
          shareDoc={shareDoc}
        />
      </div>
    </>
  );
}