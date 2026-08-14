import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const tabs = [
  { id: "home", icon: "Home", label: "Главная" },
  { id: "docs", icon: "FileText", label: "Документы" },
  { id: "templates", icon: "LayoutTemplate", label: "Шаблоны" },
  { id: "knowledge", icon: "BookOpen", label: "Знания" },
  { id: "account", icon: "User", label: "Аккаунт" },
] as const;

// Нижнее меню Заведующей: основные разделы её кабинета
const adminTabs = [
  { id: "home", icon: "Home", label: "Главная" },
  { id: "tasks", icon: "ListChecks", label: "Задачи" },
  { id: "sms", icon: "MessageSquare", label: "SMS" },
  { id: "support", icon: "LifeBuoy", label: "Поддержка" },
  { id: "templates", icon: "LayoutTemplate", label: "Шаблоны" },
  { id: "account", icon: "User", label: "Аккаунт" },
] as const;

interface Props {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  userRole?: string;
  adminSection?: string;
  onAdminSection?: (s: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab, userRole, adminSection, onAdminSection }: Props) {
  if (userRole === "admin" && onAdminSection) {
    return (
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-5 z-50">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-900/25 border border-amber-200/60 px-1 py-1.5 flex items-center justify-around">
          {adminTabs.map((tab) => {
            const active = tab.id === "account"
              ? activeTab === "account"
              : activeTab === "home" && (adminSection || "menu") === (tab.id === "home" ? "menu" : tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  reachGoal("tab_opened", { tab: tab.id });
                  if (tab.id === "account") { setActiveTab("account"); return; }
                  setActiveTab("home");
                  onAdminSection(tab.id === "home" ? "menu" : tab.id);
                  window.scrollTo({ top: 0 });
                }}
                className={`flex flex-col items-center gap-1 py-1.5 px-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  active ? "bg-amber-50" : ""
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  active ? "gold-gradient shadow-md shadow-amber-500/40" : "bg-amber-100/70"
                }`}>
                  <Icon name={tab.icon} size={18} className={active ? "text-white" : "text-amber-700"} />
                </div>
                <span className={`text-[9px] leading-none ${
                  active ? "text-amber-700 font-bold" : "text-amber-900/70 font-semibold"
                }`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  const visibleTabs = tabs;
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-5 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-900/25 border border-amber-200/60 px-2 py-1.5 flex items-center justify-around">
        {visibleTabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { reachGoal("tab_opened", { tab: tab.id }); setActiveTab(tab.id); }}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                active ? "bg-amber-50" : ""
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                active ? "gold-gradient shadow-md shadow-amber-500/40" : "bg-amber-100/70"
              }`}>
                <Icon name={tab.icon} size={18} className={active ? "text-white" : "text-amber-700"} />
              </div>
              <span className={`text-[10px] leading-none ${
                active ? "text-amber-700 font-bold" : "text-amber-900/70 font-semibold"
              }`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}