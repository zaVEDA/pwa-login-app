import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onAuth: () => void;
}

export default function AdminLogin({ onAuth }: Props) {
  const [adminPass, setAdminPass] = useState("");
  const [passError, setPassError] = useState(false);

  const handleAdminLogin = () => {
    if (adminPass === "admin2024") {
      onAuth();
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "linear-gradient(160deg, hsl(20 15% 10%) 0%, hsl(22 20% 14%) 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient shadow-lg mb-4">
            <Icon name="Lock" size={24} className="text-white" />
          </div>
          <h1 className="font-cormorant text-3xl font-semibold text-white mb-1">Кабинет администратора</h1>
          <p className="text-white/40 text-sm">Только для владельца платформы</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Введите пароль"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            className={`w-full px-4 py-3 rounded-xl border bg-white/5 text-white text-sm outline-none transition-colors placeholder:text-white/30 ${passError ? "border-red-500" : "border-white/10 focus:border-amber-500/60"}`}
          />
          {passError && <p className="text-red-400 text-xs text-center">Неверный пароль</p>}
          <button
            onClick={handleAdminLogin}
            className="w-full py-3 rounded-xl gold-gradient text-white font-medium text-sm"
          >
            Войти
          </button>
          <a href="/" className="block text-center text-xs text-white/30 pt-1">← Вернуться в приложение</a>
        </div>
      </div>
    </div>
  );
}
