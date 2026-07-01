import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CHECK_INN_URL = "https://functions.poehali.dev/9aea3fe4-6f69-411a-8a01-c3e94cb8888c";
const CLIENTS_URL = "https://functions.poehali.dev/f20320e8-6fc3-47b0-b7a3-ef74f5e1c1d5";
const SERVICES_URL = "https://functions.poehali.dev/0b2cb816-5a7a-45c0-9659-94294105e94f";
const INVOICES_URL = "https://functions.poehali.dev/b8539077-8a35-46ed-b604-3f9b439fafa1";

const todayStr = () => new Date().toISOString().slice(0, 10);

type ClientType = "ip" | "ooo" | "individual" | null;

interface ClientInfo {
  id?: number;
  name: string;
  inn: string;
  ogrnip: string;
  address: string;
  client_type?: string;
}

interface Props {
  onClose: () => void;
  phone: string;
  onSaved?: () => void;
  invoiceId?: number | null;
}

export default function InvoiceModal({ onClose, phone, onSaved, invoiceId }: Props) {
  const [minimized, setMinimized] = useState(false);

  // Справочник клиентов
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [showClientList, setShowClientList] = useState(false);

  // Справочник услуг
  const [savedServices, setSavedServices] = useState<{ id: number; name: string; price: number | null; unit: string }[]>([]);
  const [showServiceList, setShowServiceList] = useState<number | null>(null); // индекс позиции
  const [autocompleteIndex, setAutocompleteIndex] = useState<number | null>(null); // поле с активным автоподбором

  // Номер и дата счёта
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayStr());

  // Состояния сохранения и действий
  const [saved, setSaved] = useState(false);        // счёт сохранён (номер зафиксирован)
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
    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "save", ...invoicePayload() }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.ok) {
        setSaved(true);
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
            <p className="text-sm font-medium truncate">Счёт на оплату</p>
            <p className="text-xs text-muted-foreground">{total > 0 ? `${total.toLocaleString("ru-RU")} ₽` : "Черновик"}</p>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Развернуть счёт"
            className="w-10 h-10 rounded-xl border border-border bg-white/60 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="ChevronUp" size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            aria-label="Закрыть счёт"
            className="w-10 h-10 rounded-xl border border-border bg-white/60 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
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
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMinimized(true)}
              className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center"
            >
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="font-cormorant text-2xl font-semibold leading-tight">Счёт на оплату</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">№</span>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => !saved && setInvoiceNumber(e.target.value)}
                  readOnly={saved}
                  className={`text-xs font-medium text-primary bg-transparent outline-none border-b border-dashed w-24 ${saved ? "border-transparent cursor-default" : "border-primary/40 focus:border-primary"}`}
                />
                <span className="text-xs text-muted-foreground">от</span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="text-xs text-foreground bg-transparent outline-none border-b border-dashed border-border focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Scroll content */}
        <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 ${saved ? "pb-56" : "pb-40"}`}>

          {/* Клиент */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Кому выставляем</p>

            {/* Тип клиента */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "ip", label: "ИП", icon: "Briefcase" },
                { value: "ooo", label: "ООО", icon: "Building2" },
                { value: "individual", label: "Физ. лицо", icon: "User" },
              ] as { value: ClientType; label: string; icon: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setClientType(opt.value); setClientInn(""); setClientInfo(null); setClientError(""); }}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                    clientType === opt.value
                      ? "gold-gradient text-white border-transparent shadow-sm"
                      : "bg-white/60 border-border text-foreground"
                  }`}
                >
                  <Icon name={opt.icon} size={13} />
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Быстрый выбор из справочника */}
            {savedClients.length > 0 && !clientInfo && (
              <div>
                <button
                  onClick={() => setShowClientList(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium"
                >
                  <Icon name="Users" size={13} />
                  Выбрать из справочника ({savedClients.length})
                  <Icon name={showClientList ? "ChevronUp" : "ChevronDown"} size={12} />
                </button>
                {showClientList && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                    {savedClients.map((c) => (
                      <button
                        key={c.id ?? c.inn}
                        onClick={() => {
                          setClientInfo(c);
                          setClientInn(c.inn || "");
                          setClientType((c.client_type as ClientType) || "ip");
                          setShowClientList(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl border border-border bg-white/70 hover:border-primary transition-colors"
                      >
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">ИНН {c.inn}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Физ. лицо — просто ФИО */}
            {clientType === "individual" && !clientInfo && (
              <div>
                <input
                  type="text"
                  value={clientInn}
                  onChange={(e) => setClientInn(e.target.value)}
                  onBlur={() => {
                    if (clientInn.trim()) {
                      const info: ClientInfo = { name: clientInn.trim(), inn: "", ogrnip: "", address: "" };
                      setClientInfo(info);
                    }
                  }}
                  placeholder="ФИО или любое название"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            )}

            {/* ИНН для ИП / ООО */}
            {(clientType === "ip" || clientType === "ooo") && !clientInfo && (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={clientInn}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, innMaxLen);
                      setClientInn(val);
                      setClientInfo(null);
                      setClientError("");
                      if (val.length === innMaxLen) setTimeout(() => handleInnCheck(val), 0);
                    }}
                    placeholder={clientType === "ooo" ? "ИНН организации (10 цифр)" : "ИНН (12 цифр)"}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors pr-9"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {clientChecking && <Icon name="Loader" size={14} className="animate-spin text-muted-foreground" />}
                  </div>
                </div>
                {clientError && <p className="text-[11px] text-red-500 mt-1">{clientError}</p>}
              </div>
            )}

            {/* Данные клиента */}
            {clientInfo && (
              <div className={`rounded-xl border p-3 space-y-2 ${clientType === "individual" ? "border-border bg-white/60" : "border-green-200 bg-green-50/60"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {clientType !== "individual" && <Icon name="CheckCircle" size={13} className="text-green-600" />}
                    <p className={`text-[11px] font-medium ${clientType === "individual" ? "text-foreground" : "text-green-700"}`}>
                      {clientType === "individual" ? "Физическое лицо" : "Найден в реестре ФНС"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setClientInfo(null); setClientInn(""); setClientError(""); }}
                    className="text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <Icon name="Pencil" size={11} />
                    Изменить
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Клиент</p>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors mt-0.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">ИНН</p>
                    <p className="text-sm font-medium mt-0.5">{clientInfo.inn}</p>
                  </div>
                  {clientInfo.ogrnip && (
                    <div>
                      <p className="text-[10px] text-muted-foreground">{clientType === "ooo" ? "ОГРН" : "ОГРНИП"}</p>
                      <p className="text-sm font-medium mt-0.5">{clientInfo.ogrnip}</p>
                    </div>
                  )}
                </div>
                {clientInfo.address && (
                  <div>
                    <p className="text-[10px] text-muted-foreground">Адрес</p>
                    <input
                      type="text"
                      value={clientInfo.address}
                      onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors mt-0.5"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Услуги */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Услуги / товары</p>
            {items.map((item, i) => (
              <div key={i} className="card-warm rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Позиция {i + 1}</p>
                  <div className="flex items-center gap-2">
                    {savedServices.length > 0 && (
                      <button
                        onClick={() => setShowServiceList(showServiceList === i ? null : i)}
                        className="flex items-center gap-1 text-[11px] text-primary"
                      >
                        <Icon name="BookOpen" size={11} />
                        Из справочника
                      </button>
                    )}
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)}>
                        <Icon name="Trash2" size={13} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Выпадающий список услуг */}
                {showServiceList === i && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {savedServices.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          updateItem(i, "name", s.name);
                          if (s.price) updateItem(i, "price", String(s.price));
                          setShowServiceList(null);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg border border-border bg-white/80 hover:border-primary transition-colors flex items-center justify-between"
                      >
                        <span className="text-sm truncate">{s.name}</span>
                        {s.price && <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{s.price.toLocaleString("ru-RU")} ₽</span>}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => { updateItem(i, "name", e.target.value); setAutocompleteIndex(i); }}
                    onFocus={() => setAutocompleteIndex(i)}
                    onBlur={() => {
                      setTimeout(() => setAutocompleteIndex((cur) => cur === i ? null : cur), 150);
                      if (item.name.trim()) saveService(item.name, item.price);
                    }}
                    placeholder="Название услуги или товара"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                  />
                  {autocompleteIndex === i && item.name.trim().length >= 1 && (() => {
                    const q = item.name.trim().toLowerCase();
                    const matches = savedServices.filter(
                      (s) => s.name.toLowerCase().includes(q) && s.name.toLowerCase() !== q
                    ).slice(0, 5);
                    if (matches.length === 0) return null;
                    return (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-lg border border-border shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {matches.map((s) => {
                          const idx = s.name.toLowerCase().indexOf(q);
                          return (
                            <button
                              key={s.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                updateItem(i, "name", s.name);
                                if (s.price) updateItem(i, "price", String(s.price));
                                setAutocompleteIndex(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-amber-50 transition-colors flex items-center justify-between gap-2"
                            >
                              <span className="text-sm truncate">
                                {s.name.slice(0, idx)}
                                <span className="font-semibold text-primary">{s.name.slice(idx, idx + q.length)}</span>
                                {s.name.slice(idx + q.length)}
                              </span>
                              {s.price != null && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">{s.price.toLocaleString("ru-RU")} ₽</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Кол-во</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.qty}
                      onChange={(e) => updateItem(i, "qty", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Цена, ₽</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.price}
                      onChange={(e) => updateItem(i, "price", e.target.value)}
                      onBlur={() => { if (item.name.trim()) saveService(item.name, item.price); }}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addItem}
              className="w-full py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground flex items-center justify-center gap-1.5"
            >
              <Icon name="Plus" size={13} />
              Добавить позицию
            </button>
          </div>

          {/* Срок оплаты */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Срок оплаты</p>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Комментарий */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Комментарий</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительные условия..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

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
          <div className="flex items-end justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Итого к оплате</p>
              <p className="font-cormorant text-2xl sm:text-3xl font-semibold text-foreground leading-tight truncate">
                {total.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            {/* Кнопка Сохранить */}
            {!saved ? (
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-shrink-0 px-5 py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.97] transition-transform flex items-center gap-2 disabled:opacity-60"
              >
                {saveLoading
                  ? <Icon name="Loader" size={15} className="animate-spin" />
                  : <Icon name="Save" size={15} />
                }
                {saveLoading ? "Сохраняю..." : "Сохранить"}
              </button>
            ) : (
              <div className="flex-shrink-0 flex items-center gap-1.5 text-green-600">
                <Icon name="CheckCircle" size={15} className="flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">№ {invoiceNumber} сохранён</span>
              </div>
            )}
          </div>

          {/* Кнопки действий — появляются после сохранения */}
          {saved && (
            <div className="flex gap-2">
              <button
                onClick={handleCreatePdf}
                disabled={pdfLoading}
                className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60"
              >
                {pdfLoading
                  ? <Icon name="Loader" size={14} className="animate-spin" />
                  : <Icon name="FileDown" size={14} />
                }
                {pdfLoading ? "Генерирую..." : "Скачать PDF"}
              </button>
              <button
                onClick={() => setShowShareSheet(true)}
                className="flex-1 py-3 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
              >
                <Icon name="Share2" size={14} />
                Отправить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}