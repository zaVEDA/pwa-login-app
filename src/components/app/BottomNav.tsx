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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-900/15 border border-white/60 px-1 py-1.5 flex items-center justify-around">
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
                className={`flex flex-col items-center gap-0.5 py-1.5 px-1.5 rounded-xl transition-all duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  active ? "gold-gradient shadow-sm" : ""
                }`}>
                  <Icon name={tab.icon} size={15} className={active ? "text-white" : ""} />
                </div>
                <span className={`text-[9px] font-medium leading-none ${active ? "text-primary" : ""}`}>{tab.label}</span>
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
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-900/15 border border-white/60 px-2 py-1.5 flex items-center justify-around">
        {visibleTabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { reachGoal("tab_opened", { tab: tab.id }); setActiveTab(tab.id); }}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                active ? "gold-gradient shadow-sm" : ""
              }`}>
                <Icon name={tab.icon} size={16} className={active ? "text-white" : ""} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}