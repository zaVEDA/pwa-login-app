import Icon from "@/components/ui/icon";

interface Props {
  onYes: () => void;
  onNo: () => void;
}

export default function AttachPdConsentAsk({ onYes, onNo }: Props) {
  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onNo} />
      <div className="relative w-full bg-background rounded-t-3xl p-5 pb-10 shadow-2xl border-t border-border/50 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="ShieldCheck" size={19} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-cormorant text-xl font-semibold leading-snug">
              Приложить соглашение об использовании персональных данных?
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Рекомендуется, если ранее с клиентом его не подписывали
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onNo}
            className="flex-1 py-3.5 rounded-xl border border-border bg-white/70 text-sm font-medium active:scale-[0.98] transition-transform"
          >
            Нет
          </button>
          <button
            onClick={onYes}
            className="flex-1 py-3.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm active:scale-[0.98] transition-transform"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
}
