import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";
import { toast } from "sonner";

interface Ticket {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string | null;
  topic?: string | null;
}

function fmtPhone(p: string | null) {
  if (!p) return "";
  const d = p.replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return p;
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ru-RU");
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string>("all");

  const load = () => {
    authApi.adminListTickets()
      .then(({ status, data }) => {
        if (status === 200) setTickets(data.tickets || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const send = async (id: number) => {
    if (draft.trim().length < 2) return;
    setSaving(true);
    const { status } = await authApi.adminAnswerTicket(id, draft.trim());
    setSaving(false);
    if (status === 200) {
      toast.success("Ответ сохранён");
      setAnswering(null);
      setDraft("");
      load();
    } else {
      toast.error("Не удалось сохранить ответ");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Icon name="Loader" size={22} className="animate-spin text-primary" />
      </div>
    );
  }

  // Темы, которые реально встречаются в обращениях
  const topics = Array.from(new Set(tickets.map((t) => t.topic).filter(Boolean))) as string[];
  const newByTopic = (topic: string) =>
    tickets.filter((t) => !t.answered_at && (topic === "all" || t.topic === topic)).length;

  const filters: { key: string; label: string }[] = [
    { key: "all", label: "Все" },
    ...topics.map((t) => ({ key: t, label: t })),
    ...(tickets.some((t) => !t.topic) ? [{ key: "none", label: "Без темы" }] : []),
  ];

  const visible = tickets.filter((t) => {
    if (topicFilter === "all") return true;
    if (topicFilter === "none") return !t.topic;
    return t.topic === topicFilter;
  });

  return (
    <div className="space-y-2.5">
      {filters.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => {
            const active = topicFilter === f.key;
            const unread = f.key === "none"
              ? tickets.filter((t) => !t.answered_at && !t.topic).length
              : newByTopic(f.key);
            return (
              <button
                key={f.key}
                onClick={() => setTopicFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? "gold-gradient text-white border-transparent shadow-sm"
                    : "bg-white/70 border-border text-foreground"
                }`}
              >
                {f.label}
                {unread > 0 && (
                  <span className={`px-1.5 rounded-full text-[10px] font-bold ${
                    active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
                  }`}>
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tickets.length > 0 && visible.length === 0 && (
        <div className="card-warm rounded-2xl p-6 text-center">
          <Icon name="SearchX" size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">По этой теме обращений нет</p>
        </div>
      )}

      {tickets.length === 0 && (
        <div className="card-warm rounded-2xl p-6 text-center">
          <Icon name="Inbox" size={26} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">Обращений пока нет</p>
          <p className="text-xs text-muted-foreground mt-1">
            Здесь появятся вопросы, которые пользователи отправят из приложения
          </p>
        </div>
      )}

      {visible.map((t) => (
        <div key={t.id} className="card-warm rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">{t.name || "Без имени"}</p>
                {t.topic && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex-shrink-0">
                    <Icon name="Tag" size={9} />
                    {t.topic}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {[fmtPhone(t.phone), t.email].filter(Boolean).join(" · ") || "контакт не указан"}
              </p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              t.answered_at ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {t.answered_at ? "Отвечено" : "Новое"}
            </span>
          </div>

          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{t.message}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">{fmtDate(t.created_at)}</p>

          {t.answer && (
            <div className="mt-2.5 pt-2.5 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground mb-0.5">Ваш ответ · {fmtDate(t.answered_at)}</p>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{t.answer}</p>
            </div>
          )}

          {answering === t.id ? (
            <div className="mt-2.5 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Напишите ответ..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-xs outline-none focus:border-primary resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => send(t.id)}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl gold-gradient text-white text-xs font-medium disabled:opacity-60"
                >
                  {saving ? "Сохраняю..." : "Сохранить ответ"}
                </button>
                <button
                  onClick={() => { setAnswering(null); setDraft(""); }}
                  className="px-4 py-2 rounded-xl border border-border text-xs text-foreground"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setAnswering(t.id); setDraft(t.answer || ""); }}
              className="mt-2.5 text-[11px] text-primary font-medium"
            >
              {t.answer ? "Изменить ответ" : "Ответить"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
