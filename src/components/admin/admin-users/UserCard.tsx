import Icon from "@/components/ui/icon";
import { User, tabNames } from "./types";

export default function UserCard({ user, onBack }: { user: User; onBack: () => void }) {
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
            { label: "Подписано по СМС", value: user.docsSigned, color: "text-green-600" },
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
