import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { notifyApi, NotifySettings, NotifyItem } from "@/lib/notifications";

interface Props {
  onClose: () => void;
  onReadAll?: () => void;
}

const toggles: { key: keyof NotifySettings; label: string; hint: string; icon: string }[] = [
  { key: "sms", label: "СМС на телефон", hint: "Важные сообщения продублируем сообщением", icon: "MessageSquare" },
  { key: "email", label: "Письма на почту", hint: "Копии документов и ответы поддержки", icon: "Mail" },
  { key: "docs", label: "Документы", hint: "Подписание, готовность, напоминания", icon: "FileText" },
  { key: "plan", label: "Тариф и оплаты", hint: "Продление, лимиты, платежи", icon: "Crown" },
  { key: "news", label: "Новости сервиса", hint: "Новые шаблоны и возможности", icon: "Sparkles" },
];

const timeAgo = (iso: string) => {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  if (mins < 1440) return `${Math.floor(mins / 60)} ч назад`;
  return d.toLocaleDateString("ru-RU");
};

export default function NotificationsModal({ onClose, onReadAll }: Props) {
  const [tab, setTab] = useState<"feed" | "settings">("feed");
  const [items, setItems] = useState<NotifyItem[]>([]);
  const [settings, setSettings] = useState<NotifySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    notifyApi.list().then((r) => {
      if (r.status === 200) {
        setItems(r.data.items || []);
        setSettings(r.data.settings);
      }
      setLoading(false);
    });
  }, []);

  const markAll = async () => {
    await notifyApi.markRead();
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    onReadAll?.();
  };

  const toggle = (key: keyof NotifySettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
    setDone(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const r = await notifyApi.saveSettings(settings);
    setSaving(false);
    if (r.status === 200) setDone(true);
  };

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col mx-auto"
      style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}
    >
      <div className="absolute inset-0 bg-background" />
      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
            <h2 className="font-cormorant text-2xl font-semibold flex-1">Уведомления</h2>
            {tab === "feed" && unread > 0 && (
              <button onClick={markAll} className="text-xs text-primary">
                Прочитать все
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {(["feed", "settings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  tab === t
                    ? "bg-foreground text-background border-transparent"
                    : "bg-white/60 border-border text-muted-foreground"
                }`}
              >
                {t === "feed" ? `Сообщения${unread ? ` · ${unread}` : ""}` : "Настройки"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading && (
            <div className="flex justify-center py-10">
              <Icon name="Loader" size={20} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && tab === "feed" && items.length === 0 && (
            <div className="text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon name="BellOff" size={22} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Пока сообщений нет</p>
              <p className="text-xs text-muted-foreground mt-1">Здесь появятся новости и напоминания</p>
            </div>
          )}

          {!loading &&
            tab === "feed" &&
            items.map((n) => (
              <div
                key={n.id}
                className={`card-warm rounded-2xl p-4 shadow-sm ${!n.is_read ? "border border-primary/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={n.kind === "docs" ? "FileText" : n.kind === "plan" ? "Crown" : "Sparkles"}
                      size={14}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium flex-1">{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-2">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}

          {!loading && tab === "settings" && settings && (
            <>
              {done && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                  <Icon name="CheckCircle" size={14} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">Настройки сохранены</p>
                </div>
              )}
              {toggles.map((t) => (
                <button
                  key={t.key}
                  onClick={() => toggle(t.key)}
                  className="w-full card-warm rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={t.icon} size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.hint}</p>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full flex-shrink-0 transition-colors relative ${
                      settings[t.key] ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        settings[t.key] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </div>
                </button>
              ))}
              <button
                onClick={save}
                disabled={saving}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Icon name="Loader" size={15} className="animate-spin" />}
                Сохранить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
