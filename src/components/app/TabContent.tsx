import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import RequisitesBlock from "@/components/app/RequisitesBlock";
import InvoiceModal from "@/components/app/InvoiceModal";
import AdminUsers from "@/components/admin/AdminUsers";
import { formatDate } from "@/lib/date";
import DocumentModal from "@/components/app/DocumentModal";

const INVOICES_URL = "https://functions.poehali.dev/b8539077-8a35-46ed-b604-3f9b439fafa1";
const HELP_URL = "https://functions.poehali.dev/66109594-95d9-45ec-bcda-4de385abc5ef";

interface HelpTip { key: string; title: string; body: string; category: string; }

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  total: number | null;
  status: string;
}

interface RealizationDoc {
  id: number;
  doc_type: string;
  doc_number: string;
  doc_date: string;
  invoice_number: string;
  client_name: string;
  total: number | null;
  status: string;
}

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const recentDocs = [
  { title: "Договор об оказании услуг", client: "Анна М.", date: "09.06.2026", status: "signed", statusLabel: "Подписан" },
  { title: "Акт выполненных работ", client: "Игорь С.", date: "07.06.2026", status: "pending", statusLabel: "Ожидает" },
  { title: "Счёт на оплату", client: "Мария В.", date: "05.06.2026", status: "draft", statusLabel: "Черновик" },
];

const templates = [
  { icon: "FileText", title: "Договор услуг", desc: "Базовый договор с клиентом", tag: "Универсальный" },
  { icon: "Receipt", title: "Акт выполненных работ", desc: "Закрывающий документ", tag: "Универсальный" },
  { icon: "CreditCard", title: "Счёт на оплату", desc: "Выставить счёт клиенту", tag: "Финансы" },
  { icon: "Shield", title: "Соглашение о конфиденциальности", desc: "NDA для сессий", tag: "Психолог" },
  { icon: "Calendar", title: "Абонемент на занятия", desc: "Пакет сессий или уроков", tag: "Репетитор" },
  { icon: "Image", title: "Договор фотосъёмки", desc: "Права на фото и сроки", tag: "Фотограф" },
];

const knowledgeArticles = [
  { icon: "BookOpen", title: "Как оформить самозанятость", desc: "Пошаговая инструкция регистрации через приложение «Мой налог»", time: "5 мин" },
  { icon: "Receipt", title: "Налоговый чек для клиента", desc: "Когда и как выдавать, чтобы не получить штраф", time: "3 мин" },
  { icon: "TrendingUp", title: "Лимит дохода самозанятого", desc: "2,4 млн в год — что делать, если приближаетесь к лимиту", time: "4 мин" },
  { icon: "FileCheck", title: "Какие документы нужны", desc: "Договор, акт, счёт — обязательно ли всё это?", time: "6 мин" },
  { icon: "Users", title: "Можно ли работать с ИП", desc: "Ограничения и особенности сотрудничества", time: "4 мин" },
  { icon: "AlertCircle", title: "Частые ошибки", desc: "Топ-5 ошибок самозанятых при работе с документами", time: "7 мин" },
];

const specialties = [
  { emoji: "🧠", label: "Психолог" },
  { emoji: "✨", label: "Астролог" },
  { emoji: "🔢", label: "Нумеролог" },
  { emoji: "🎯", label: "Коуч" },
  { emoji: "📚", label: "Репетитор" },
  { emoji: "👶", label: "Няня" },
  { emoji: "📸", label: "Фотограф" },
];

const themes = {
  honey: { label: "Янтарь", phraseIcon: "Leaf",     dot: "#C8821A" },
  sage:  { label: "Шалфей", phraseIcon: "Sprout",   dot: "#4A9067" },
  rose:  { label: "Роза",   phraseIcon: "Flower2",  dot: "#C0486A" },
  clay:  { label: "Глина",  phraseIcon: "TreePine", dot: "#A0602A" },
} as const;

interface Props {
  activeTab: Tab;
  isSelfEmployed: boolean | null;
  inn: string;
  setInn: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  innSaved: boolean;
  setInnSaved: (v: boolean) => void;
  onLogout: () => void;
  colorTheme: keyof typeof themes;
  setColorTheme: (t: keyof typeof themes) => void;
  phone: string;
  userName?: string | null;
  userRole?: string;
}

export default function TabContent({
  activeTab,
  isSelfEmployed,
  inn,
  setInn,
  fullName,
  setFullName,
  innSaved,
  setInnSaved,
  onLogout,
  colorTheme,
  setColorTheme,
  phone,
  userName,
  userRole,
}: Props) {
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
        body: JSON.stringify({ action: "document", doc_type: docType, invoice_id: inv.id, ...full }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const label = docType === "act" ? "Акт" : "Накладная";
        a.href = url;
        a.download = `${label}_${parsed.doc_number || inv.invoice_number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      loadDocuments();
      setDocFilter(docType === "act" ? "Акты" : "Накладные");
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

  useEffect(() => {
    if (activeTab !== "docs") return;
    loadInvoices();
    loadDocuments();
  }, [activeTab, phone]);

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

      {activeTab === "docs" && (
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-5 animate-slide-up">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">Шаблоны документов</h2>
            <p className="text-xs text-muted-foreground">Выберите под вашу деятельность</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
            {specialties.map((s) => (
              <button
                key={s.label}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 border shadow-sm"
                style={{ borderColor: "hsl(36 28% 82%)" }}
              >
                <span className="text-base">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {templates.map((t) => (
              <button
                key={t.title}
                className="card-warm rounded-2xl p-4 flex gap-3 items-center text-left shadow-sm active:scale-[0.98] transition-transform"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10"
                >
                  <Icon name={t.icon} size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="doc-tag bg-primary/15 text-primary text-[10px]">{t.tag}</span>
                  <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-5 animate-slide-up">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">База знаний</h2>
            <p className="text-xs text-muted-foreground">Законодательство и практика для самозанятых</p>
          </div>

          {/* Featured */}
          <div className="card-warm rounded-2xl p-5 shadow-sm">
            <span className="doc-tag bg-primary/15 text-primary text-[10px] mb-3 inline-block">Рекомендуем</span>
            <h3 className="font-cormorant text-xl font-semibold text-foreground mb-2">Старт самозанятого</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Полный гайд: регистрация, первый клиент, первый документ, первый налог
            </p>
            <button className="flex items-center gap-2 text-sm font-medium text-primary">
              Читать гайд <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {knowledgeArticles.map((a) => (
              <button
                key={a.title}
                className="card-warm rounded-2xl p-4 flex gap-3 items-start w-full text-left shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={a.icon} size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                  <p className="text-xs text-primary mt-1.5">{a.time} чтения</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "account" && userRole === "admin" && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-semibold">Пользователи</h2>
            <button onClick={onLogout} className="text-xs text-red-500 flex items-center gap-1">
              <Icon name="LogOut" size={13} /> Выйти
            </button>
          </div>
          <AdminUsers />
        </div>
      )}

      {activeTab === "account" && userRole !== "admin" && (
        <div className="space-y-5 animate-slide-up">
          {/* Profile card */}
          <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 shimmer" />
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                <span className="font-cormorant text-2xl font-bold text-white">
                  {(userName || "Г").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "Г"}
                </span>
              </div>
              <div>
                <h3 className="font-cormorant text-xl font-semibold text-foreground">{userName || "Гость"}</h3>
                <p className="text-sm text-muted-foreground">{phone || "—"}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name={userRole === "admin" ? "Shield" : "Briefcase"} size={11} className="text-primary" />
                  <span className="text-xs text-primary">{userRole === "admin" ? "Администратор" : "Личный кабинет"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Цветовая тема */}
          <div className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Palette" size={15} className="text-primary" />
              <p className="text-sm font-medium">Тема</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(themes) as [keyof typeof themes, typeof themes[keyof typeof themes]][]).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    colorTheme === key
                      ? "bg-foreground text-background border-transparent shadow-sm"
                      : "bg-white/60 border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Icon name={t.phraseIcon} size={11} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Реквизиты */}
          <RequisitesBlock fullName={fullName} setFullName={setFullName} phone={phone} />

          {/* Мой налог — только для самозанятых */}
          {isSelfEmployed && <div
            className="rounded-2xl p-4 border border-primary/30"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.07))" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon name="Receipt" size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Выбить чек самозанятого</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Откроет официальное приложение ФНС «Мой налог» для выдачи чека клиенту
                </p>
              </div>
            </div>
            <a
              href="mynalog://register"
              onClick={(e) => { e.preventDefault(); window.open("https://lknpd.nalog.ru/", "_blank"); }}
              className="mt-3 w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Icon name="ExternalLink" size={14} />
              Открыть «Мой налог»
            </a>
          </div>}

          {/* Settings list */}
          <div className="space-y-2">
            {[
              { icon: "User", label: "Профиль и деятельность", danger: false },
              { icon: "FileSignature", label: "Настройки подписи (ПЭП)", danger: false },
              { icon: "Bell", label: "Уведомления", danger: false },
              { icon: "BarChart3", label: "Учёт и налоги", danger: false },
              { icon: "HelpCircle", label: "Справка и поддержка", danger: false },
              { icon: "LogOut", label: "Выйти", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.label === "Выйти" ? onLogout : undefined}
                className={`w-full card-warm rounded-xl p-3.5 flex items-center gap-3 text-left shadow-sm active:scale-[0.98] transition-transform ${item.danger ? "border border-red-200/50" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.danger ? "bg-red-50" : "bg-primary/10"}`}>
                  <Icon name={item.icon} size={15} className={item.danger ? "text-red-500" : "text-primary"} />
                </div>
                <span className={`flex-1 text-sm ${item.danger ? "text-red-500" : "text-foreground"}`}>{item.label}</span>
                {!item.danger && <Icon name="ChevronRight" size={15} className="text-muted-foreground" />}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground pb-2">ЗаВедующая · версия 1.0.0</p>
        </div>
      )}
    </>
  );
}