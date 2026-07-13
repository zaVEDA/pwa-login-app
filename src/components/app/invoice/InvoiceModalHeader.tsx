import Icon from "@/components/ui/icon";

interface Props {
  invoiceNumber: string;
  invoiceDate: string;
  saved: boolean;
  readOnly: boolean;
  onEdit: () => void;
  setInvoiceNumber: (v: string) => void;
  setInvoiceDate: (v: string) => void;
  setMinimized: (v: boolean) => void;
  onClose: () => void;
}

export default function InvoiceModalHeader({
  invoiceNumber,
  invoiceDate,
  saved,
  readOnly,
  onEdit,
  setInvoiceNumber,
  setInvoiceDate,
  setMinimized,
  onClose,
}: Props) {
  return (
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
              onChange={(e) => !readOnly && setInvoiceDate(e.target.value)}
              readOnly={readOnly}
              className={`text-xs text-foreground bg-transparent outline-none border-b border-dashed ${readOnly ? "border-transparent cursor-default" : "border-border focus:border-primary"}`}
            />
          </div>
        </div>
        {readOnly && (
          <button
            onClick={onEdit}
            className="h-9 flex items-center gap-1.5 text-xs font-medium text-white gold-gradient rounded-xl px-3.5 shadow-sm active:scale-95 transition-transform flex-shrink-0"
          >
            <Icon name="Pencil" size={13} />
            Изменить
          </button>
        )}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center"
        >
          <Icon name="X" size={16} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}