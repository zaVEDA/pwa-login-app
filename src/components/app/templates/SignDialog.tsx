import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Contract } from "@/components/app/tabs/constants";

interface Props {
  contract: Contract;
  onCancel: () => void;
  onConfirm: (name: string, phone: string) => Promise<void>;
}

export default function SignDialog({ contract, onCancel, onConfirm }: Props) {
  const [name, setName] = useState(contract.client_name || "");
  const [phone, setPhone] = useState(contract.values?.phone || "");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const ready = name.trim().length > 2 && phone.trim().length > 5 && agree;

  const submit = async () => {
    if (!ready || loading) return;
    setLoading(true);
    await onConfirm(name.trim(), phone.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center px-5">
      <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Icon name="ShieldCheck" size={17} className="text-blue-700" />
            </div>
            <p className="text-sm font-semibold">Подписание документа</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Простая электронная подпись по 63-ФЗ. После подписания документ изменить нельзя.
          </p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ФИО подписанта</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иванова Анна Петровна"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Телефон подписанта</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 900 000-00-00"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => setAgree(!agree)}
            className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-white/70 text-left"
          >
            <div className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 border ${agree ? "bg-blue-600 border-transparent" : "border-border bg-white"}`}>
              {agree && <Icon name="Check" size={13} className="text-white" />}
            </div>
            <span className="text-xs leading-snug">
              Подтверждаю согласие подписать документ простой электронной подписью
            </span>
          </button>

          <div className="text-[11px] text-muted-foreground bg-muted/50 border border-border rounded-xl px-3 py-2.5 leading-relaxed">
            В документ будут внесены: ФИО, телефон, дата и время, IP-адрес и отпечаток документа.
          </div>
        </div>

        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={submit}
            disabled={!ready || loading}
            className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Icon name={loading ? "Loader" : "PenLine"} size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Подписываю..." : "Подписать документ"}
          </button>
          <button onClick={onCancel} className="w-full py-2.5 text-sm text-muted-foreground">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
