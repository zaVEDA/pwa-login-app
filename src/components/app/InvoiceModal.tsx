import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  CHECK_INN_URL,
  CLIENTS_URL,
  SERVICES_URL,
  INVOICES_URL,
  todayStr,
  ClientType,
  ClientInfo,
  ServiceItem,
} from "./invoice/types";
import InvoiceModalHeader from "./invoice/InvoiceModalHeader";
import InvoiceClientSection from "./invoice/InvoiceClientSection";
import InvoiceItemsSection from "./invoice/InvoiceItemsSection";
import InvoiceModalFooter from "./invoice/InvoiceModalFooter";
import { PlanType } from "@/lib/auth";

interface Props {
  onClose: () => void;
  phone: string;
  onSaved?: () => void;
  invoiceId?: number | null;
  userPlan?: PlanType | null;
}

export default function InvoiceModal({ onClose, phone, onSaved, invoiceId, userPlan }: Props) {
  const [minimized, setMinimized] = useState(false);

  // Справочник клиентов
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [showClientList, setShowClientList] = useState(false);

  // Справочник услуг
  const [savedServices, setSavedServices] = useState<ServiceItem[]>([]);
  const [showServiceList, setShowServiceList] = useState<number | null>(null); // индекс позиции
  const [autocompleteIndex, setAutocompleteIndex] = useState<number | null>(null); // поле с активным автоподбором

  // Номер и дата счёта
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayStr());

  // Состояния сохранения и действий
  const [saved, setSaved] = useState(false);        // счёт сохранён (номер зафиксирован)
  const [editing, setEditing] = useState(false);    // режим редактирования сохранённого счёта
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Клиент
  const [clientType, setClientType] = useState<ClientType>(null);
  const [clientInn, setClientInn] = useState("");
  const [clientChecking, setClientChecking] = useState(false);
  const [clientError, setClientError] = useState("");
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  const [items, setItems] = useState([{ name: "", qty: "1", price: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

  const [loadingExisting, setLoadingExisting] = useState(!!invoiceId);

  const innMaxLen = clientType === "ooo" ? 10 : 12;

  // Загружаем существующий счёт по id
  useEffect(() => {
    if (!phone || !invoiceId) return;
    setLoadingExisting(true);
    fetch(`${INVOICES_URL}?id=${invoiceId}`, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const inv = parsed.invoice;
        if (inv) {
          setInvoiceNumber(inv.invoice_number || "");
          setInvoiceDate(inv.invoice_date || todayStr());
          setClientType((inv.client_type as ClientType) || null);
          if (inv.client_name) {
            setClientInfo({
              name: inv.client_name,
              inn: inv.client_inn || "",
              ogrnip: inv.client_ogrnip || "",
              address: inv.client_address || "",
            });
            setClientInn(inv.client_inn || inv.client_name || "");
          }
          setItems(Array.isArray(inv.items) && inv.items.length ? inv.items : [{ name: "", qty: "1", price: "" }]);
          setDueDate(inv.due_date || "");
          setComment(inv.comment || "");
          setSaved(true);
          setSavedId(inv.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [phone, invoiceId]);

  // Загружаем следующий номер счёта (только для нового счёта)
  useEffect(() => {
    if (!phone || invoiceId) return;
    fetch(`${INVOICES_URL}?next_number=1`, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.invoice_number) setInvoiceNumber(parsed.invoice_number);
      })
      .catch(() => {});
  }, [phone]);

  const invoicePayload = () => ({
    id: savedId,
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    client_type: clientType,
    client_name: clientInfo?.name || "",
    client_inn: clientInfo?.inn || "",
    client_ogrnip: clientInfo?.ogrnip || "",
    client_address: clientInfo?.address || "",
    items,
    due_date: dueDate,
    comment,
  });

  const handleSave = async () => {
    setSaveError("");
    if (!phone) {
      setSaveError("Не удалось определить аккаунт. Войдите заново.");
      return;
    }
    setSaveLoading(true);

    // При сохранении ИП/ООО заново проверяем и фиксируем ИНН в реестре ФНС,
    // если данные ещё не подтверждены (клиент мог измениться при редактировании).
    let verifiedClient = clientInfo;
    if ((clientType === "ip" || clientType === "ooo") && clientInfo?.inn && !clientInfo.address) {
      try {
        const chk = await fetch(CHECK_INN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inn: clientInfo.inn, entity_type: clientType === "ooo" ? "ooo" : "ip" }),
        });
        const chkData = await chk.json();
        const chkParsed = typeof chkData === "string" ? JSON.parse(chkData) : chkData;
        if (chkParsed.valid) {
          verifiedClient = {
            name: chkParsed.name || clientInfo.name,
            inn: chkParsed.inn || clientInfo.inn,
            ogrnip: chkParsed.ogrnip || clientInfo.ogrnip || "",
            address: chkParsed.address || clientInfo.address || "",
          };
          setClientInfo(verifiedClient);
        } else {
          setSaveError(chkParsed.message || "ИНН не найден в реестре ФНС. Проверьте данные клиента.");
          setSaveLoading(false);
          return;
        }
      } catch {
        setSaveError("Не удалось проверить ИНН в ФНС. Проверьте интернет.");
        setSaveLoading(false);
        return;
      }
    }

    const payload = {
      ...invoicePayload(),
      client_name: verifiedClient?.name || "",
      client_inn: verifiedClient?.inn || "",
      client_ogrnip: verifiedClient?.ogrnip || "",
      client_address: verifiedClient?.address || "",
    };

    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "save", ...payload }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.ok) {
        setSaved(true);
        setEditing(false);
        setSavedId(parsed.id);
        if (parsed.invoice_number) setInvoiceNumber(parsed.invoice_number);
        onSaved?.();
      } else {
        setSaveError("Не удалось сохранить счёт. Попробуйте ещё раз.");
      }
    } catch (e) {
      console.error(e);
      setSaveError("Ошибка соединения. Проверьте интернет.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreatePdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "pdf", ...invoicePayload() }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.pdf_base64) {
        if (!saved) { setSaved(true); onSaved?.(); }
        if (parsed.id) setSavedId(parsed.id);
        if (parsed.invoice_number) setInvoiceNumber(parsed.invoice_number);
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Счёт_${invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  const shareText = () => {
    const who = clientInfo?.name ? ` для ${clientInfo.name}` : "";
    const sum = total > 0 ? ` на сумму ${total.toLocaleString("ru-RU")} ₽` : "";
    return `Счёт № ${invoiceNumber}${who}${sum}`;
  };

  const handleShare = (channel: "email" | "telegram" | "whatsapp" | "sms") => {
    const text = shareText();
    const note = "Для оплаты скачайте PDF из приложения.";
    const msg = encodeURIComponent(`${text}\n${note}`);
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=&text=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}`,
      sms: `sms:?body=${msg}`,
      email: `mailto:?subject=${encodeURIComponent(`Счёт № ${invoiceNumber}`)}&body=${msg}`,
    };
    window.open(urls[channel], "_blank");
    setShowShareSheet(false);
  };

  // Загружаем справочники
  useEffect(() => {
    if (!phone) return;
    fetch(CLIENTS_URL, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setSavedClients(parsed.clients || []);
      })
      .catch(() => {});
    fetch(SERVICES_URL, { headers: { "X-Phone": phone } })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setSavedServices(parsed.services || []);
      })
      .catch(() => {});
  }, [phone]);

  const saveService = (name: string, price: string, unit = "шт") => {
    if (!phone || !name.trim()) return;
    fetch(SERVICES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Phone": phone },
      body: JSON.stringify({ name: name.trim(), price: parseFloat(price) || null, unit }),
    })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.ok) {
          setSavedServices(prev => {
            const exists = prev.find(s => s.name === name.trim());
            const entry = { id: parsed.id, name: name.trim(), price: parseFloat(price) || null, unit };
            if (exists) return prev.map(s => s.name === name.trim() ? entry : s);
            return [entry, ...prev];
          });
        }
      })
      .catch(() => {});
  };

  const saveClient = async (info: ClientInfo) => {
    if (!phone) return;
    fetch(CLIENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Phone": phone },
      body: JSON.stringify({
        client_type: clientType,
        name: info.name,
        inn: info.inn,
        ogrnip: info.ogrnip,
        address: info.address,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed.ok) {
          setSavedClients(prev => {
            const exists = prev.find(c => c.inn === info.inn);
            if (exists) return prev.map(c => c.inn === info.inn ? { ...info, id: parsed.id } : c);
            return [{ ...info, id: parsed.id }, ...prev];
          });
        }
      })
      .catch(() => {});
  };

  const handleInnCheck = async (val: string) => {
    setClientChecking(true);
    setClientError("");
    setClientInfo(null);
    try {
      const res = await fetch(CHECK_INN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inn: val, entity_type: clientType === "ooo" ? "ooo" : "ip" }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.valid) {
        const info: ClientInfo = { name: parsed.name, inn: parsed.inn || val, ogrnip: parsed.ogrnip, address: parsed.address };
        setClientInfo(info);
        saveClient(info);
      } else {
        setClientError(parsed.message || "Не найден в реестре ФНС");
      }
    } catch {
      setClientError("Ошибка соединения с ФНС");
    } finally {
      setClientChecking(false);
    }
  };

  const addItem = () => setItems((prev) => [...prev, { name: "", qty: "1", price: "" }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const total = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

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
            <Icon name="Receipt" size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Счёт{invoiceNumber ? ` № ${invoiceNumber}` : " на оплату"}</p>
            <p className="text-xs text-muted-foreground">{total > 0 ? `${total.toLocaleString("ru-RU")} ₽` : "Черновик"}</p>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Развернуть счёт"
            className="w-10 h-10 rounded-xl border border-border bg-white/60 flex items-center justify-center flex-shrink-0 active:scale-95 transition-all hover:border-primary"
          >
            <Icon name="ChevronUp" size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            aria-label="Закрыть счёт"
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
      {/* Фон */}
      <div className="absolute inset-0 bg-background" />

      <div className="relative flex flex-col h-full">
        {loadingExisting && (
          <div className="absolute inset-0 z-20 bg-background/80 flex items-center justify-center">
            <Icon name="Loader" size={24} className="animate-spin text-primary" />
          </div>
        )}
        {/* Header */}
        <InvoiceModalHeader
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          saved={saved}
          readOnly={readOnly}
          onEdit={() => setEditing(true)}
          setInvoiceNumber={setInvoiceNumber}
          setInvoiceDate={setInvoiceDate}
          setMinimized={setMinimized}
          onClose={onClose}
        />

        {/* Scroll content */}
        <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 ${saved ? "pb-56" : "pb-40"}`}>

          {/* Клиент */}
          <InvoiceClientSection
            clientType={clientType}
            clientInn={clientInn}
            clientChecking={clientChecking}
            clientError={clientError}
            clientInfo={clientInfo}
            savedClients={savedClients}
            showClientList={showClientList}
            innMaxLen={innMaxLen}
            readOnly={readOnly}
            setClientType={setClientType}
            setClientInn={setClientInn}
            setClientInfo={setClientInfo}
            setClientError={setClientError}
            setShowClientList={setShowClientList}
            handleInnCheck={handleInnCheck}
          />

          {/* Услуги / срок оплаты / комментарий */}
          <InvoiceItemsSection
            items={items}
            savedServices={savedServices}
            showServiceList={showServiceList}
            autocompleteIndex={autocompleteIndex}
            dueDate={dueDate}
            comment={comment}
            readOnly={readOnly}
            setShowServiceList={setShowServiceList}
            setAutocompleteIndex={setAutocompleteIndex}
            setDueDate={setDueDate}
            setComment={setComment}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            saveService={saveService}
          />
        </div>

        {/* Share sheet + Footer */}
        <InvoiceModalFooter
          total={total}
          saved={saved}
          editing={editing}
          readOnly={readOnly}
          saveLoading={saveLoading}
          saveError={saveError}
          pdfLoading={pdfLoading}
          invoiceNumber={invoiceNumber}
          showShareSheet={showShareSheet}
          setShowShareSheet={setShowShareSheet}
          handleSave={handleSave}
          handleCreatePdf={handleCreatePdf}
          handleShare={handleShare}
          noPlan={!userPlan}
        />
      </div>
    </div>
  );
}