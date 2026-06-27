import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onClose: () => void;
}

export default function InvoiceModal({ onClose }: Props) {
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className="relative bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h2 className="font-cormorant text-2xl font-semibold">Счёт на оплату</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Заполните данные клиента и услуги</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-border bg-white/60 flex items-center justify-center"
            >
              <Icon name="X" size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Клиент */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Кому выставляем</p>
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
            <p className="text-xs font-medium text-foreground">Услуги / товары</p>
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
            <p className="text-xs font-medium text-foreground mb-2">Срок оплаты</p>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Комментарий */}
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Комментарий</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительные условия или реквизиты..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Итого + кнопка */}
          <div className="card-warm rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Итого к оплате</p>
              <p className="font-cormorant text-2xl font-semibold text-foreground">
                {total.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.97] transition-transform flex items-center gap-2"
            >
              <Icon name="FileDown" size={15} />
              Создать счёт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
