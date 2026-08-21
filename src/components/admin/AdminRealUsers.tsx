import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";
import SetUserPassword from "./admin-users/SetUserPassword";

interface Row {
  id: number;
  full_name: string | null;
  activity_description: string | null;
  phone: string | null;
  email: string | null;
  plan: string | null;
  plan_expires_at: string | null;
  role: string | null;
  created_at: string | null;
  last_login_at: string | null;
  docs_total: number;
  docs_signed: number;
  invoices: number;
  trial_code_word?: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  start: "Старт", opora: "Опора", medium: "Рост", pro: "Творец", rost: "Рост", tvorets: "Творец", family: "Для родных", test: "ТЕСТ", trial: "Тест-драйв",
};

function fmtPhone(p: string | null) {
  if (!p) return "—";
  const d = p.replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return p;
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ru-RU");
}

export default function AdminRealUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, docs: 0, signed: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authApi.adminListUsers()
      .then(({ status, data }) => {
        if (status !== 200) return;
        setRows(data.users || []);
        setStats({ total: data.total || 0, paid: data.paid || 0, docs: data.docs || 0, signed: data.signed || 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Icon name="Loader" size={22} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          ["Всего", stats.total],
          ["С тарифом", stats.paid],
          ["Документов", stats.docs],
          ["Подписано", stats.signed],
        ].map(([label, v]) => (
          <div key={label as string} className="bg-white/60 rounded-xl p-2.5 text-center border border-border/50">
            <p className="font-cormorant text-xl font-semibold text-amber-700">{v}</p>
            <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <SetUserPassword />

      <div className="relative">
        <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск по телефону, почте или имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
        />
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6">Пока нет зарегистрированных пользователей</p>
      )}

      <div className="space-y-2">
        {rows
          .filter((u) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            const digits = q.replace(/\D/g, "");
            return (
              (u.full_name || "").toLowerCase().includes(q) ||
              (u.activity_description || "").toLowerCase().includes(q) ||
              (u.email || "").toLowerCase().includes(q) ||
              (u.trial_code_word || "").toLowerCase().includes(q) ||
              (!!digits && (u.phone || "").includes(digits))
            );
          })
          .map((u) => {
          const isOpen = open === u.id;
          return (
            <div key={u.id} className="card-warm rounded-xl overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : u.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {fmtPhone(u.phone)}
                    {u.role === "admin" && <span className="ml-1.5 text-[10px] text-amber-600">заведующая</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{u.email || "почта не указана"}</p>
                  {u.full_name && (
                    <p className="text-[11px] text-muted-foreground/80 truncate">{u.full_name}</p>
                  )}
                </div>
                {u.plan ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                    {PLAN_LABELS[u.plan] || u.plan}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">без тарифа</span>
                )}
                <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground flex-shrink-0" />
              </button>
              {isOpen && (
                <div className="px-4 pb-3 border-t border-border/50 pt-2.5 space-y-1.5">
                  {[
                    ["ФИО", u.full_name || "—"],
                    ["Регистрация", fmtDate(u.created_at)],
                    ["Последний вход", fmtDate(u.last_login_at)],
                    ["Тариф до", fmtDate(u.plan_expires_at)],
                    ["Документов создано", String(u.docs_total)],
                    ["Подписано клиентами", String(u.docs_signed)],
                    ["Счетов", String(u.invoices)],
                    ...(u.trial_code_word ? [["Кодовое слово (тест-драйв)", `«${u.trial_code_word}»`]] : []),
                  ].map(([label, v]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">{label}</span>
                      <span className="text-xs font-medium text-foreground truncate">{v}</span>
                    </div>
                  ))}
                  {u.activity_description && (
                    <div className="pt-1.5 mt-1 border-t border-border/40">
                      <p className="text-[11px] text-muted-foreground mb-0.5">Чем занимается</p>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {u.activity_description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}