import Icon from "@/components/ui/icon";

interface Props {
  title: string;
  savedNumber: string;
  savedId: number | null;
  status: string;
  locked: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}

export default function TemplateFillHeader({
  title,
  savedNumber,
  savedId,
  status,
  locked,
  saving,
  onSave,
  onClose,
}: Props) {
  return (
    <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-cormorant text-xl font-semibold leading-tight truncate">{title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {savedNumber && <span className="text-xs font-medium text-primary">№ {savedNumber}</span>}
            {savedId ? (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  locked ? "bg-green-100 text-green-700"
                    : status === "sent" ? "bg-sky-100 text-sky-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <Icon name={locked ? "ShieldCheck" : status === "sent" ? "Send" : "FilePlus2"} size={10} />
                {locked ? "Подписан" : status === "sent" ? "Отправлен на подпись" : "Создан"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground truncate">Заполните поля</span>
            )}
          </div>
        </div>
        {!locked && (
          <button
            onClick={onSave}
            disabled={saving}
            className="h-9 flex items-center gap-1.5 text-xs font-medium text-white gold-gradient rounded-xl px-3.5 shadow-sm active:scale-95 transition-transform flex-shrink-0 disabled:opacity-60"
          >
            <Icon name={saving ? "Loader" : "Save"} size={13} className={saving ? "animate-spin" : ""} />
            {saving ? "Сохраняю" : "Сохранить"}
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="w-9 h-9 flex-shrink-0 rounded-xl border border-border bg-white/60 flex items-center justify-center hover:border-primary transition-colors"
        >
          <Icon name="X" size={16} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}