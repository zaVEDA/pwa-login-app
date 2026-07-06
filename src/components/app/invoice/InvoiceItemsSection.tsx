import { Dispatch, SetStateAction } from "react";
import Icon from "@/components/ui/icon";
import { InvoiceItem, ServiceItem } from "./types";

interface Props {
  items: InvoiceItem[];
  savedServices: ServiceItem[];
  showServiceList: number | null;
  autocompleteIndex: number | null;
  dueDate: string;
  comment: string;
  setShowServiceList: Dispatch<SetStateAction<number | null>>;
  setAutocompleteIndex: Dispatch<SetStateAction<number | null>>;
  setDueDate: (v: string) => void;
  setComment: (v: string) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
  updateItem: (i: number, field: string, value: string) => void;
  saveService: (name: string, price: string, unit?: string) => void;
}

export default function InvoiceItemsSection({
  items,
  savedServices,
  showServiceList,
  autocompleteIndex,
  dueDate,
  comment,
  setShowServiceList,
  setAutocompleteIndex,
  setDueDate,
  setComment,
  addItem,
  removeItem,
  updateItem,
  saveService,
}: Props) {
  return (
    <>
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
                className={`w-full px-3 py-2 text-sm outline-none rounded-lg border border-border bg-white/70 focus:border-primary transition-colors ${savedServices.length > 0 ? "pr-9" : ""}`}
              />
              {/* Иконка справочника — справа внутри поля */}
              {savedServices.length > 0 && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowServiceList(showServiceList === i ? null : i)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${showServiceList === i ? "bg-primary text-white" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                  >
                    <Icon name="BookOpen" size={14} />
                  </button>
                  {showServiceList === i && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowServiceList(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white rounded-xl border border-border shadow-xl overflow-hidden">
                        <p className="text-[10px] text-muted-foreground px-3 pt-2.5 pb-1 uppercase tracking-wide font-medium">Справочник услуг</p>
                        <div className="max-h-52 overflow-y-auto">
                          {savedServices.map((s) => (
                            <button
                              key={s.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { updateItem(i, "name", s.name); if (s.price) updateItem(i, "price", String(s.price)); setShowServiceList(null); }}
                              className="w-full text-left px-3 py-2.5 hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center justify-between gap-2 border-b border-border/40 last:border-0"
                            >
                              <span className="text-sm truncate">{s.name}</span>
                              {s.price != null && <span className="text-xs text-muted-foreground flex-shrink-0">{s.price.toLocaleString("ru-RU")} ₽</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
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
    </>
  );
}
