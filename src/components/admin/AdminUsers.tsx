import { useState } from "react";
import Icon from "@/components/ui/icon";

type User = {
  id: number;
  name: string;
  phone: string;
  status: "self_employed" | "ip" | "ooo" | "individual" | null;
  specialty: string;
  registeredAt: string;
  lastLoginAt: string;
  loginCount: number;
  paidAt: string | null;
  paymentAmount: number | null;
  docsTotal: number;
  docsSigned: number;
  tabVisits: { home: number; docs: number; templates: number; knowledge: number; account: number };
  avgSessionMin: number;
  dropTab: string | null;
};

const mockUsers: User[] = [
  { id: 1, name: "Анна Смирнова", phone: "+7 916 000-00-01", status: "self_employed", specialty: "Психолог", registeredAt: "01.05.2024", lastLoginAt: "10.06.2024", loginCount: 34, paidAt: "05.05.2024", paymentAmount: 990, docsTotal: 12, docsSigned: 9, tabVisits: { home: 34, docs: 28, templates: 15, knowledge: 8, account: 5 }, avgSessionMin: 7, dropTab: null },
  { id: 2, name: "Игорь Петров", phone: "+7 903 111-22-33", status: "ip", specialty: "Коуч", registeredAt: "12.05.2024", lastLoginAt: "09.06.2024", loginCount: 18, paidAt: "15.05.2024", paymentAmount: 990, docsTotal: 7, docsSigned: 5, tabVisits: { home: 18, docs: 14, templates: 9, knowledge: 12, account: 3 }, avgSessionMin: 5, dropTab: null },
  { id: 3, name: "Мария Волкова", phone: "+7 926 222-33-44", status: "self_employed", specialty: "Астролог", registeredAt: "20.05.2024", lastLoginAt: "08.06.2024", loginCount: 9, paidAt: null, paymentAmount: null, docsTotal: 3, docsSigned: 1, tabVisits: { home: 9, docs: 4, templates: 7, knowledge: 3, account: 1 }, avgSessionMin: 3, dropTab: "templates" },
  { id: 4, name: "Дмитрий Козлов", phone: "+7 999 333-44-55", status: "ooo", specialty: "Фотограф", registeredAt: "25.05.2024", lastLoginAt: "07.06.2024", loginCount: 22, paidAt: "28.05.2024", paymentAmount: 1990, docsTotal: 15, docsSigned: 13, tabVisits: { home: 22, docs: 20, templates: 11, knowledge: 4, account: 7 }, avgSessionMin: 9, dropTab: null },
  { id: 5, name: "Елена Фролова", phone: "+7 912 444-55-66", status: "individual", specialty: "Няня", registeredAt: "01.06.2024", lastLoginAt: "06.06.2024", loginCount: 4, paidAt: null, paymentAmount: null, docsTotal: 1, docsSigned: 0, tabVisits: { home: 4, docs: 1, templates: 3, knowledge: 4, account: 0 }, avgSessionMin: 2, dropTab: "knowledge" },
  { id: 6, name: "Сергей Лебедев", phone: "+7 985 555-66-77", status: "self_employed", specialty: "Репетитор", registeredAt: "03.06.2024", lastLoginAt: "10.06.2024", loginCount: 11, paidAt: "05.06.2024", paymentAmount: 990, docsTotal: 6, docsSigned: 4, tabVisits: { home: 11, docs: 9, templates: 6, knowledge: 5, account: 2 }, avgSessionMin: 6, dropTab: null },
];

const statusLabels: Record<string, string> = { self_employed: "Самозанятый", ip: "ИП", ooo: "ООО", individual: "Физлицо" };
const statusColors: Record<string, string> = { self_employed: "bg-green-100 text-green-700", ip: "bg-blue-100 text-blue-700", ooo: "bg-purple-100 text-purple-700", individual: "bg-gray-100 text-gray-600" };
const tabNames: Record<string, string> = { home: "Главная", docs: "Документы", templates: "Шаблоны", knowledge: "База знаний", account: "Профиль" };

function UserCard({ user, onBack }: { user: User; onBack: () => void }) {
  return (
    <div className="space-y-4 animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="ArrowLeft" size={14} /> Назад к списку
      </button>

      <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, hsl(43 72% 58%), transparent)", transform: "translate(30%,-30%)" }} />
        <div className="flex gap-4 items-center mb-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
            <span className="font-cormorant text-xl font-bold text-white">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-cormorant text-xl font-semibold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.phone}</p>
            <p className="text-xs text-amber-700 mt-0.5">{user.specialty}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Регистрация", value: user.registeredAt },
            { label: "Последний вход", value: user.lastLoginAt },
            { label: "Оплата", value: user.paidAt ?? "Нет" },
            { label: "Сумма", value: user.paymentAmount ? `₽${user.paymentAmount}` : "—" },
          ].map((i) => (
            <div key={i.label} className="bg-amber-700/5 rounded-xl p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">{i.label}</p>
              <p className="text-sm font-medium text-foreground">{i.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-warm rounded-2xl p-4 shadow-sm">
        <p className="font-cormorant text-lg font-semibold mb-3">Активность по разделам</p>
        <div className="space-y-2.5">
          {(Object.entries(user.tabVisits) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([tab, visits]) => {
              const max = Math.max(...Object.values(user.tabVisits));
              const pct = Math.round(visits / max * 100);
              return (
                <div key={tab}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{tabNames[tab]}</span>
                    <span className="text-muted-foreground">{visits} визитов</span>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
          <span className="text-muted-foreground">Средняя сессия</span>
          <span className="font-medium">{user.avgSessionMin} мин</span>
        </div>
        {user.dropTab && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
            <Icon name="AlertTriangle" size={13} />
            Возможная точка потери — «{user.dropTab === "templates" ? "Шаблоны" : user.dropTab === "knowledge" ? "База знаний" : user.dropTab}»
          </div>
        )}
      </div>

      <div className="card-warm rounded-2xl p-4 shadow-sm">
        <p className="font-cormorant text-lg font-semibold mb-3">Документы</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Создано", value: user.docsTotal, color: "text-amber-700" },
            { label: "Подписано через ПЭП", value: user.docsSigned, color: "text-green-600" },
            { label: "Конверсия", value: user.docsTotal ? `${Math.round(user.docsSigned / user.docsTotal * 100)}%` : "0%", color: "text-amber-700" },
          ].map((d) => (
            <div key={d.label} className="bg-white/50 rounded-xl p-3 text-center">
              <p className={`font-cormorant text-2xl font-semibold ${d.color}`}>{d.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");

  if (selectedUser) {
    return <UserCard user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="space-y-4">
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
