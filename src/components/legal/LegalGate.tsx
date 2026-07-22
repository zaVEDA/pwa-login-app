import { useState } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/5043035c-9bd0-4b6e-ab11-a2b1f897b997";
const STORE_KEY = "legalAuth";

export function getLegalAuth(): string {
  return sessionStorage.getItem(STORE_KEY) || localStorage.getItem(STORE_KEY) || "";
}

export function clearLegalAuth() {
  localStorage.removeItem(STORE_KEY);
  sessionStorage.removeItem(STORE_KEY);
  window.location.reload();
}

export default function LegalGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => !!getLegalAuth());
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_password", password: pw }),
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        localStorage.setItem(STORE_KEY, pw);
        setAuthed(true);
      } else {
        setError("Неверный пароль");
      }
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon name="Lock" size={22} className="text-primary" />
        </div>
        <h1 className="font-cormorant text-2xl font-bold text-foreground mb-1">Доступ по паролю</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Внутренняя страница для Заведующей и юриста. Введите пароль, чтобы продолжить.
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Пароль"
          autoFocus
          className="w-full border border-border rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-primary bg-background"
        />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pw}
          className="w-full gold-gradient text-white font-medium rounded-xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="LogIn" size={16} />}
          Войти
        </button>
      </form>
    </div>
  );
}