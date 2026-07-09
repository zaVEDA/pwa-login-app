import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, AuthUser } from "@/lib/auth";

interface Props {
  onClose: () => void;
  onSaved: (user: AuthUser) => void;
}

export default function ChangePasswordModal({ onClose, onSaved }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setError("");
    if (password.length < 6) return setError("Пароль не короче 6 символов");
    if (password !== confirm) return setError("Пароли не совпадают");
    setLoading(true);
    try {
      const r = await authApi.updateProfile({ password });
      if (r.status !== 200) { setError(r.data.error || "Не удалось сохранить"); return; }
      onSaved(r.data.user);
      setDone(true);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-background" />
      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50 flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
          <h2 className="font-cormorant text-2xl font-semibold">Смена пароля</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {done ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <Icon name="CheckCircle" size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700">Пароль обновлён</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                  <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Новый пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Повторите пароль</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ещё раз новый пароль"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Сохранить пароль
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
