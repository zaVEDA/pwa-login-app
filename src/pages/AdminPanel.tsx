import { useState } from "react";
import Icon from "@/components/ui/icon";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminTemplates from "@/components/admin/AdminTemplates";
import AdminPhrases from "@/components/admin/AdminPhrases";
import AdminUsers from "@/components/admin/AdminUsers";

type AdminTab = "templates" | "phrases" | "users";

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("templates");

  if (!isAuthed) {
    return <AdminLogin onAuth={() => setIsAuthed(true)} />;
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
            <button
              onClick={() => setIsAuthed(false)}
              className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center"
            >
              <Icon name="LogOut" size={15} className="text-amber-700" />
            </button>
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
