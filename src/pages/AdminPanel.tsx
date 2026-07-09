import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdminTemplates from "@/components/admin/AdminTemplates";
import AdminPhrases from "@/components/admin/AdminPhrases";
import AdminUsers from "@/components/admin/AdminUsers";
import { authApi, getToken } from "@/lib/auth";

type AdminTab = "templates" | "phrases" | "users";

export default function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("templates");

  useEffect(() => {
    const token = getToken();
    if (!token) { setChecking(false); return; }
    authApi.me().then(({ status, data }) => {
      setIsAdmin(status === 200 && data.user?.role === "admin");
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(36 25% 96%)" }}>
        <Icon name="Loader" size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5"
        style={{ background: "linear-gradient(160deg, hsl(20 15% 10%) 0%, hsl(22 20% 14%) 100%)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient shadow-lg mb-4">
            <Icon name="Lock" size={24} className="text-white" />
          </div>
          <h1 className="font-cormorant text-3xl font-semibold text-white mb-1">Кабинет администратора</h1>
          <p className="text-white/40 text-sm mb-6">Войдите под учётной записью администратора в приложении</p>
          <a href="/" className="inline-block px-5 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium">
            ← Войти в приложении
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}>
      <header className="px-5 pt-10 pb-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">ЗаВедующая</p>
            <h1 className="font-cormorant text-2xl font-semibold">Кабинет администратора</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border bg-white/50">
              ← В приложение
            </a>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {([
            { id: "templates", icon: "LayoutTemplate", label: "Шаблоны" },
            { id: "phrases", icon: "Sparkles", label: "Фразы дня" },
            { id: "users", icon: "Users", label: "Пользователи" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "gold-gradient text-white shadow-sm" : "bg-white/60 border border-border text-foreground"}`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 pb-16 max-w-3xl mx-auto space-y-4">
        {activeTab === "templates" && <AdminTemplates />}
        {activeTab === "phrases" && <AdminPhrases />}
        {activeTab === "users" && <AdminUsers />}
      </main>
    </div>
  );
}
