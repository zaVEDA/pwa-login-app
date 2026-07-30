import Icon from "@/components/ui/icon";

interface Props {
  invoiceNumber: string;
  total: number;
  onExpand: () => void;
  onClose: () => void;
}

export default function InvoiceMinimizedBar({ invoiceNumber, total, onExpand, onClose }: Props) {
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
          onClick={onExpand}
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
