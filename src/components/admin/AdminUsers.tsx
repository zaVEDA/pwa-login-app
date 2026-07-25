import { useState } from "react";
import Icon from "@/components/ui/icon";
import { User, mockUsers, statusLabels, statusColors } from "./admin-users/types";
import UserCard from "./admin-users/UserCard";
import SetUserPassword from "./admin-users/SetUserPassword";
import { FamilyCodeSettings, FamilyRequests } from "./admin-users/FamilyManagement";

export { FamilyCodeSettings, FamilyRequests };

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");

  if (selectedUser) {
    return <UserCard user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="space-y-4">
      <SetUserPassword />

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Всего пользователей", value: mockUsers.length, icon: "Users", color: "text-amber-700" },
          { label: "Платящих", value: mockUsers.filter(u => u.paidAt).length, icon: "CreditCard", color: "text-green-600" },
          { label: "Документов создано", value: mockUsers.reduce((a, u) => a + u.docsTotal, 0), icon: "FileText", color: "text-amber-700" },
          { label: "Подписано клиентами", value: mockUsers.reduce((a, u) => a + u.docsSigned, 0), icon: "FileCheck", color: "text-green-600" },
          { label: "Конверсия в оплату", value: `${Math.round(mockUsers.filter(u => u.paidAt).length / mockUsers.length * 100)}%`, icon: "TrendingUp", color: "text-amber-700" },
          { label: "Ср. сессия (мин)", value: `${Math.round(mockUsers.reduce((a, u) => a + u.avgSessionMin, 0) / mockUsers.length)}`, icon: "Clock", color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="card-warm rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon name={s.icon} size={13} className={s.color} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            <p className={`font-cormorant text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-2.5">
        {mockUsers
          .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch))
          .map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className="w-full card-warm rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                  <span className="font-cormorant font-bold text-white text-sm">
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.phone} · {u.specialty}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {u.status && <span className={`doc-tag text-[10px] ${statusColors[u.status]}`}>{statusLabels[u.status]}</span>}
                  {u.paidAt
                    ? <span className="doc-tag bg-green-100 text-green-700 text-[10px]">Оплатил</span>
                    : <span className="doc-tag bg-gray-100 text-gray-500 text-[10px]">Не платил</span>}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Входов", value: u.loginCount },
                  { label: "Документов", value: u.docsTotal },
                  { label: "Подписано", value: u.docsSigned },
                  { label: "Мин/сессия", value: u.avgSessionMin },
                ].map((m) => (
                  <div key={m.label} className="bg-white/50 rounded-lg p-2 text-center">
                    <p className="font-semibold text-sm text-foreground">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
              {u.dropTab && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                  <Icon name="AlertTriangle" size={12} />
                  Возможная точка потери — вкладка «{u.dropTab === "templates" ? "Шаблоны" : u.dropTab === "knowledge" ? "База знаний" : u.dropTab}»
                </div>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
