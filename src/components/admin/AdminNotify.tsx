import { useState } from "react";
import Icon from "@/components/ui/icon";
import { notifyApi } from "@/lib/notifications";

const kinds = [
  { id: "news", label: "Новость", hint: "Придёт тем, кто включил новости сервиса" },
  { id: "docs", label: "Документы", hint: "Про подписание и готовность документов" },
  { id: "plan", label: "Тариф", hint: "Продление, лимиты, оплаты" },
];

const plans = [
  { id: "start", label: "Опора" },
  { id: "medium", label: "Рост" },
  { id: "pro", label: "Творец" },
  { id: "family", label: "Для родных" },
];

export default function AdminNotify() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("news");
  const [target, setTarget] = useState<"all" | "plan">("all");
  const [plan, setPlan] = useState("start");
  const [withSms, setWithSms] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; sms_sent: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const ready = title.trim().length >= 3 && body.trim().length >= 5;

  const send = async () => {
    setError("");
    setResult(null);
    setSending(true);
    const r = await notifyApi.adminSend({
      title: title.trim(),
      body: body.trim(),
      kind,
      with_sms: withSms,
      target,
      plan: target === "plan" ? plan : undefined,
    });
    setSending(false);
    if (r.status !== 200) {
      setError(r.data.error || "Не удалось отправить");
      return;
    }
    setResult(r.data);
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      {result && (
        <div className="px-3 py-2.5 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs text-green-700 font-medium">Отправлено</p>
          <p className="text-[11px] text-green-700/80 mt-0.5">
            Получили сообщение: {result.sent} из {result.total}
            {result.sms_sent > 0 && ` · СМС ушло: ${result.sms_sent}`}
          </p>
        </div>
      )}

      <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Кому</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTarget("all")}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                target === "all" ? "bg-foreground text-background border-transparent" : "bg-white/60 border-border text-muted-foreground"
              }`}
            >
              Всем
            </button>
            <button
              onClick={() => setTarget("plan")}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                target === "plan" ? "bg-foreground text-background border-transparent" : "bg-white/60 border-border text-muted-foreground"
              }`}
            >
              По тарифу
            </button>
          </div>
          {target === "plan" && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                    plan === p.id ? "bg-primary text-white border-transparent" : "bg-white/60 border-border text-muted-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Тип сообщения</label>
          <div className="flex gap-1.5 flex-wrap">
            {kinds.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                  kind === k.id ? "bg-primary text-white border-transparent" : "bg-white/60 border-border text-muted-foreground"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">{kinds.find((k) => k.id === kind)?.hint}</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            placeholder="Например: Новые шаблоны для психологов"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Текст</label>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 2000))}
            placeholder="Что важно сообщить пользователям"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
          />
          <p className="text-[11px] text-muted-foreground mt-1 text-right">{body.length}/2000</p>
        </div>

        <button
          onClick={() => setWithSms((v) => !v)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-white/60 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="MessageSquare" size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Продублировать в СМС</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Тратит баланс SMS.ru — только для важного</p>
          </div>
          <div className={`w-11 h-6 rounded-full flex-shrink-0 relative transition-colors ${withSms ? "bg-primary" : "bg-border"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${withSms ? "left-[22px]" : "left-0.5"}`} />
          </div>
        </button>

        <button
          onClick={send}
          disabled={!ready || sending}
          className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {sending && <Icon name="Loader" size={15} className="animate-spin" />}
          Отправить
        </button>
      </div>
    </div>
  );
}
