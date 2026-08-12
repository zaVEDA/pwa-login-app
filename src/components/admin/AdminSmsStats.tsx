import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";

interface KindRow {
  kind: string;
  is_repeat: boolean;
  count: number;
}

interface PhoneRow {
  phone: string;
  full_name: string | null;
  total: number;
  login: number;
  login_repeat: number;
  reset: number;
  reset_repeat: number;
  sign: number;
  sign_repeat: number;
  register: number;
  last_at: string | null;
}

interface Stats {
  days: number;
  total: number;
  today: number;
  by_kind: KindRow[];
  by_phone: PhoneRow[];
}

const CATEGORIES: { key: string; repeat: boolean; label: string; icon: string }[] = [
  { key: "register", repeat: false, label: "Регистрация", icon: "UserPlus" },
  { key: "login", repeat: false, label: "Вход", icon: "LogIn" },
  { key: "login", repeat: true, label: "Повторная на вход", icon: "RotateCw" },
  { key: "reset", repeat: false, label: "Восстановление пароля", icon: "KeyRound" },
  { key: "reset", repeat: true, label: "Повторная на восстановление", icon: "RotateCw" },
  { key: "sign", repeat: false, label: "Подписание документа", icon: "FileSignature" },
  { key: "sign", repeat: true, label: "Повторная на подписание", icon: "RotateCw" },
];

const PERIODS = [
  { days: 1, label: "Сутки" },
  { days: 7, label: "Неделя" },
  { days: 30, label: "Месяц" },
  { days: 365, label: "Год" },
];

function fmtPhone(p: string) {
  const d = p.replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return p;
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) +
    " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminSmsStats() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openPhone, setOpenPhone] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    authApi.adminSmsStats(days)
      .then(({ status, data }) => setStats(status === 200 ? (data as Stats) : null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [days]);

  const countOf = (key: string, repeat: boolean) =>
    stats?.by_kind.find((k) => k.kind === key && k.is_repeat === repeat)?.count ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              days === p.days ? "gold-gradient text-white shadow-sm" : "bg-white/60 border border-border text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Icon name="Loader" size={22} className="animate-spin text-primary" />
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="card-warm rounded-2xl p-4 text-center">
              <p className="font-cormorant text-3xl font-semibold text-amber-700">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">всего за период</p>
            </div>
            <div className="card-warm rounded-2xl p-4 text-center">
              <p className="font-cormorant text-3xl font-semibold text-green-600">{stats.today}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">за последние сутки</p>
            </div>
          </div>

          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const n = countOf(c.key, c.repeat);
              return (
                <div key={`${c.key}-${c.repeat}`} className="card-warm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.repeat ? "bg-amber-100" : "bg-primary/10"}`}>
                    <Icon name={c.icon} size={15} className={c.repeat ? "text-amber-600" : "text-primary"} />
                  </div>
                  <p className={`flex-1 text-sm ${c.repeat ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {c.label}
                  </p>
                  <p className="font-cormorant text-xl font-semibold text-foreground">{n}</p>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 mt-5">По номерам</h3>
            {stats.by_phone.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">За этот период SMS не отправлялись</p>
            )}
            <div className="space-y-2">
              {stats.by_phone.map((r) => {
                const open = openPhone === r.phone;
                return (
                  <div key={r.phone} className="card-warm rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenPhone(open ? null : r.phone)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{fmtPhone(r.phone)}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {r.full_name || "Без имени"} · последняя {fmtDate(r.last_at)}
                        </p>
                      </div>
                      <span className="font-cormorant text-xl font-semibold text-amber-700">{r.total}</span>
                      <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground flex-shrink-0" />
                    </button>
                    {open && (
                      <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border/50 pt-2.5">
                        {[
                          ["Регистрация", r.register],
                          ["Вход", r.login],
                          ["Повтор входа", r.login_repeat],
                          ["Восстановление", r.reset],
                          ["Повтор восстановления", r.reset_repeat],
                          ["Подписание", r.sign],
                          ["Повтор подписания", r.sign_repeat],
                        ].map(([label, n]) => (
                          <div key={label as string} className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">{label}</span>
                            <span className="text-xs font-semibold text-foreground">{n}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Повторной считается SMS того же вида на тот же номер в течение 30 минут.
          </p>
        </>
      )}
    </div>
  );
}
