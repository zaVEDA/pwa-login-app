import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onClose: () => void;
}

export default function InvoiceModal({ onClose }: Props) {
  const [minimized, setMinimized] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientInn, setClientInn] = useState("");
  const [items, setItems] = useState([{ name: "", qty: "1", price: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

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
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Кому выставляем</p>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ФИО или название компании"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              inputMode="numeric"
              value={clientInn}
              onChange={(e) => setClientInn(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="ИНН клиента (необязательно)"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Услуги */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Услуги / товары</p>
            {items.map((item, i) => (
              <div key={i} className="card-warm rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Позиция {i + 1}</p>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)}>
                      <Icon name="Trash2" size={13} className="text-red-400" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
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
