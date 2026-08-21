import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser } from "@/lib/auth";

interface Props {
  onClose: () => void;
  onActivated: (user: AuthUser) => void;
}

export default function TrialCodeModal({ onClose, onActivated }: Props) {
  const [codeWord, setCodeWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activate = async () => {
    setError("");
    if (!codeWord.trim()) return setError("Введите кодовое слово");
    setLoading(true);
    try {
      const { status, data } = await authApi.redeemTrialCode(codeWord.trim());
      if (status === 200 && data.user) {
        onActivated(data.user);
        onClose();
      } else {
        setError(data.error || "Не удалось активировать код");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-3xl sm:rounded-3xl p-5 pb-8 sm:pb-5 animate-slide-up-panel shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Icon name="Ticket" size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-cormorant text-xl font-semibold">Есть кодовое слово?</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Активируйте тестовый доступ</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 mb-3">
            <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            value={codeWord}
            onChange={(e) => setCodeWord(e.target.value)}
            placeholder="Кодовое слово"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && activate()}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary/60"
          />
        </div>

        <button
          onClick={activate}
          disabled={loading}
          className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Icon name="Loader" size={15} className="animate-spin" />}
          Активировать
        </button>
        <button onClick={onClose} className="w-full py-3 text-xs text-muted-foreground mt-1">
          Пропустить
        </button>
      </div>
    </div>
  );
}
