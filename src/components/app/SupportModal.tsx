import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";

interface Props {
  topic?: string;
  onClose: () => void;
}

const TOPIC_HINTS: Record<string, string> = {
  Шаблон:
    "Опишите, какой документ вам нужен: как называется, для какой ситуации и что важно в нём указать. Мы свяжемся и уточним детали.",
};

export default function SupportModal({ topic, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const hint = topic ? TOPIC_HINTS[topic] : "";

  const send = async () => {
    setError("");
    if (message.trim().length < 5) return setError("Опишите вопрос подробнее");
    setLoading(true);
    try {
      const { status, data } = await authApi.supportCreate(
        message.trim(),
        undefined,
        undefined,
        undefined,
        topic
      );
      if (status !== 200) { setError(data.error || "Не удалось отправить"); return; }
      setSent(true);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-3 pb-3 sm:pb-0">
      <div className="w-full max-w-md card-warm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="min-w-0">
            <h3 className="font-cormorant text-xl font-semibold truncate">Обращение в поддержку</h3>
            {topic && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                <Icon name="Tag" size={10} />
                Тема: {topic}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground flex-shrink-0">
            <Icon name="X" size={19} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="Check" size={22} className="text-green-600" />
              </div>
              <p className="text-sm font-medium mb-1">Заявка отправлена</p>
              <p className="text-xs text-muted-foreground">Ответим в ближайшее время</p>
              <button
                onClick={onClose}
                className="mt-4 w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium"
              >
                Хорошо
              </button>
            </div>
          ) : (
            <>
              {hint && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 rounded-xl px-3 py-2.5">
                  {hint}
                </p>
              )}

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                  <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={topic === "Шаблон" ? "Например: договор на проведение мастер-класса..." : "Опишите ваш вопрос"}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
              />

              <button
                onClick={send}
                disabled={loading}
                className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                Отправить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
