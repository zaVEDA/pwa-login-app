import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "menu" | "users" | "family" | "addons" | "calendar" | "support";

const tiles: { id: Section; icon: string; title: string; hint: string; badge?: string }[] = [
  { id: "users", icon: "Users", title: "Пользователи", hint: "Тарифы, оплаты, подписи ПЭП", badge: "5" },
  { id: "family", icon: "HeartHandshake", title: "Тариф «Для родных»", hint: "Список, активации, подписи" },
  { id: "addons", icon: "Wallet", title: "Допфункции", hint: "SMS.ru, домен · сроки оплат" },
  { id: "calendar", icon: "CalendarDays", title: "Календарь фраз", hint: "Мысли дня на месяц" },
  { id: "support", icon: "LifeBuoy", title: "Поддержка", hint: "Сообщения пользователей", badge: "2" },
];

function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <div className="animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
        <Icon name="ArrowLeft" size={14} /> Назад
      </button>
      <h2 className="font-cormorant text-2xl font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

const mockUsers = [
  { name: "Анна Смирнова", phone: "+7 916 000-00-01", plan: "Рост", activated: "05.05.2025", until: "05.11.2025", signed: 9, logins: 34, operator: "МТС" },
  { name: "Игорь Петров", phone: "+7 903 111-22-33", plan: "Опора", activated: "15.05.2025", until: "15.08.2025", signed: 5, logins: 18, operator: "Билайн" },
  { name: "Мария Волкова", phone: "+7 926 222-33-44", plan: "—", activated: "—", until: "—", signed: 1, logins: 9, operator: "Мегафон" },
  { name: "Дмитрий Козлов", phone: "+7 999 333-44-55", plan: "Творец", activated: "28.05.2025", until: "28.11.2025", signed: 13, logins: 22, operator: "Теле2" },
  { name: "Елена Фролова", phone: "+7 912 444-55-66", plan: "—", activated: "—", until: "—", signed: 0, logins: 4, operator: "МТС" },
];

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-xl p-3 text-center border border-border/50">
      <p className="font-cormorant text-2xl font-semibold text-amber-700">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</p>
    </div>
  );
}

function UsersScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <ScreenHeader title="Пользователи" subtitle="Тарифы · оплаты · сроки · подписи ПЭП · входы" onBack={onBack} />
      <div className="grid grid-cols-3 gap-2.5">
        <StatChip label="Всего" value="5" />
        <StatChip label="С тарифом" value="3" />
        <StatChip label="Подписей" value="28" />
      </div>
      <div className="space-y-2.5">
        {mockUsers.map((u) => (
          <div key={u.phone} className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.phone} · {u.operator}</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">{u.plan}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div><p className="text-sm font-semibold">{u.activated}</p><p className="text-[9px] text-muted-foreground">активация</p></div>
              <div><p className="text-sm font-semibold">{u.until}</p><p className="text-[9px] text-muted-foreground">до</p></div>
              <div><p className="text-sm font-semibold text-green-600">{u.signed}</p><p className="text-[9px] text-muted-foreground">подписей</p></div>
              <div><p className="text-sm font-semibold">{u.logins}</p><p className="text-[9px] text-muted-foreground">входов</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FamilyScreen({ onBack }: { onBack: () => void }) {
  const fam = mockUsers.filter((_, i) => i % 2 === 0);
  return (
    <div className="space-y-4">
      <ScreenHeader title="Тариф «Для родных»" subtitle="Список · активация · срок · подписи/мес · входы" onBack={onBack} />
      <div className="space-y-2.5">
        {fam.map((u) => (
          <div key={u.phone} className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Icon name="Heart" size={14} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-sm font-semibold">{u.activated}</p><p className="text-[9px] text-muted-foreground">активирован</p></div>
              <div><p className="text-sm font-semibold">{u.until}</p><p className="text-[9px] text-muted-foreground">до</p></div>
              <div><p className="text-sm font-semibold text-green-600">{u.signed}/мес</p><p className="text-[9px] text-muted-foreground">подписей</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockAddons = [
  { name: "SMS.ru", icon: "MessageSquare", paidAt: "01.07.2025", amount: "₽1 500", until: "01.10.2025" },
  { name: "Домен zavdoc.ru", icon: "Globe", paidAt: "15.03.2025", amount: "₽990", until: "15.03.2026" },
];

function AddonsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <ScreenHeader title="Допфункции" subtitle="Сроки оплаты · дата · сумма · до какого действует" onBack={onBack} />
      <div className="space-y-2.5">
        {mockAddons.map((a) => (
          <div key={a.name} className="card-warm rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={a.icon} size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{a.name}</p>
              <p className="text-xs text-muted-foreground">Оплачено {a.paidAt} · {a.amount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">действует до</p>
              <p className="text-sm font-semibold text-amber-700">{a.until}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const monthPhrases = [
  "Сегодня лучший день, чтобы сделать первый шаг.",
  "Каждый подписанный договор — это уважение к себе и клиенту.",
  "Профессионал отличается не талантом, а порядком в делах.",
];

function CalendarScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <ScreenHeader title="Календарь фраз" subtitle="Мысли дня на месяц — можно менять" onBack={onBack} />
      <div className="space-y-2.5">
        {monthPhrases.map((p, i) => (
          <div key={i} className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="font-cormorant text-base font-bold text-amber-700">{i + 1}</span>
              </div>
              <p className="flex-1 font-cormorant text-base italic text-foreground leading-snug">«{p}»</p>
              <button className="text-muted-foreground"><Icon name="Pencil" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2">
        <Icon name="Plus" size={15} /> Добавить фразу
      </button>
    </div>
  );
}

const mockTickets = [
  { name: "Мария Волкова", msg: "Не приходит код по SMS", date: "18.07.2025", answered: false },
  { name: "Игорь Петров", msg: "Как продлить тариф?", date: "16.07.2025", answered: true, answerDate: "16.07.2025" },
];

function SupportScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <ScreenHeader title="Поддержка" subtitle="Сообщения пользователей · ответы · даты" onBack={onBack} />
      <div className="space-y-2.5">
        {mockTickets.map((t, i) => (
          <div key={i} className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.answered ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {t.answered ? "Отвечено" : "Новое"}
              </span>
            </div>
            <p className="text-sm text-foreground mb-2">«{t.msg}»</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Получено {t.date}</span>
              {t.answered && <span>Ответ {t.answerDate}</span>}
            </div>
            {!t.answered && (
              <button className="mt-2.5 w-full py-2 rounded-xl bg-primary/15 text-primary text-xs font-medium flex items-center justify-center gap-1.5">
                <Icon name="Send" size={12} /> Ответить
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("menu");

  if (section === "users") return <UsersScreen onBack={() => setSection("menu")} />;
  if (section === "family") return <FamilyScreen onBack={() => setSection("menu")} />;
  if (section === "addons") return <AddonsScreen onBack={() => setSection("menu")} />;
  if (section === "calendar") return <CalendarScreen onBack={() => setSection("menu")} />;
  if (section === "support") return <SupportScreen onBack={() => setSection("menu")} />;

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="font-cormorant text-xl font-semibold">Управление</h2>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border relative min-h-[120px] flex flex-col"
          >
            {t.badge && (
              <span className="absolute top-3 right-3 min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[11px] font-semibold flex items-center justify-center">
                {t.badge}
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name={t.icon} size={20} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">{t.title}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{t.hint}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
