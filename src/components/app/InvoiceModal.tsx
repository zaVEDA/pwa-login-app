import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CHECK_INN_URL = "https://functions.poehali.dev/9aea3fe4-6f69-411a-8a01-c3e94cb8888c";
const CLIENTS_URL = "https://functions.poehali.dev/f20320e8-6fc3-47b0-b7a3-ef74f5e1c1d5";
const SERVICES_URL = "https://functions.poehali.dev/0b2cb816-5a7a-45c0-9659-94294105e94f";

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
}

export default function InvoiceModal({ onClose, phone }: Props) {
  const [minimized, setMinimized] = useState(false);

  // Справочник клиентов
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [showClientList, setShowClientList] = useState(false);

  // Справочник услуг
  const [savedServices, setSavedServices] = useState<{ id: number; name: string; price: number | null; unit: string }[]>([]);
  const [showServiceList, setShowServiceList] = useState<number | null>(null); // индекс позиции

  // Клиент
  const [clientType, setClientType] = useState<ClientType>(null);
  const [clientInn, setClientInn] = useState("");
  const [clientChecking, setClientChecking] = useState(false);
  const [clientError, setClientError] = useState("");
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  const [items, setItems] = useState([{ name: "", qty: "1", price: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

  const innMaxLen = clientType === "ooo" ? 10 : 12;

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
      <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto">
        <div
          className="card-warm rounded-2xl px-4 py-3 shadow-lg border flex items-center gap-3"
          style={{ borderColor: "hsl(var(--primary) / 0.3)" }}
        >
          <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Icon name="Receipt" size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Счёт на оплату</p>
            <p className="text-xs text-muted-foreground">{total > 0 ? `${total.toLocaleString("ru-RU")} ₽` : "Черновик"}</p>
          </div>
          <button
            onClick={() => setMinimized(false)}
            className="w-8 h-8 rounded-xl border border-border bg-white/60 flex items-center justify-center"
          >
            <Icon name="ChevronUp" size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-border bg-white/60 flex items-center justify-center"
          >
            <Icon name="X" size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      {/* Фон */}
      <div className="absolute inset-0 bg-background" />

      <div className="relative flex flex-col h-full">
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
              <p className="text-xs text-muted-foreground">Новый документ</p>
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
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-32">

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

            {/* ИНН для ИП / ООО / физ. лица */}
            {clientType && !clientInfo && (
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

            {/* Данные из ФНС */}
            {clientInfo && (
              <div className="rounded-xl border border-green-200 bg-green-50/60 p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon name="CheckCircle" size={13} className="text-green-600" />
                    <p className="text-[11px] font-medium text-green-700">Найден в реестре ФНС</p>
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

                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  onBlur={() => { if (item.name.trim()) saveService(item.name, item.price); }}
                  placeholder="Название услуги или товара"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
                />
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

        {/* Footer — итого + кнопка */}
        <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-background border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Итого к оплате</p>
              <p className="font-cormorant text-3xl font-semibold text-foreground leading-tight">
                {total.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <button className="px-5 py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.97] transition-transform flex items-center gap-2">
              <Icon name="FileDown" size={15} />
              Создать счёт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}