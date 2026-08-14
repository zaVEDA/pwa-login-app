import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { authApi } from "@/lib/auth";

interface Brief {
  id: number;
  answers: Record<string, string | string[]>;
  file_url: string | null;
  notes: string | null;
  status: string;
  created_at: string | null;
  slot: number | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

const LABELS: Record<string, string> = {
  kind: "Услуга или товар",
  what: "Чем занимается",
  short_name: "Короткое название",
  clients: "Клиенты",
  price_type: "Как считается цена",
  price: "Цена",
  prepay: "Когда платит",
  prepay_size: "Размер предоплаты",
  pay_method: "Способы оплаты",
  format: "Формат работы",
  booking: "Предварительная запись",
  duration: "Сроки",
  delivery: "Передача товара",
  delivery_pay: "Кто платит доставку",
  done_when: "Что считается выполненным",
  cancel_client: "Отмена клиентом",
  no_show: "Клиент не пришёл",
  cancel_me: "Перенос с вашей стороны",
  refund: "Возврат денег",
  extras: "Особые условия",
  extras_other: "Ещё важное",
  protect: "Что критично защитить",
};

const ORDER = Object.keys(LABELS);

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

export default function AdminTemplateBriefs() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    authApi.adminTemplateBriefs()
      .then(({ status, data }) => {
        if (status === 200) setBriefs(data.briefs || []);
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

  if (briefs.length === 0) {
    return (
      <div className="card-warm rounded-2xl p-6 text-center">
        <Icon name="ClipboardList" size={26} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-foreground font-medium">Анкет пока нет</p>
        <p className="text-xs text-muted-foreground mt-1">
          Здесь появятся заявки на разработку шаблонов от участников акции
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {briefs.map((b) => {
        const isOpen = open === b.id;
        const filled = ORDER.filter((k) => {
          const v = b.answers[k];
          return Array.isArray(v) ? v.length > 0 : !!v;
        });

        return (
          <div key={b.id} className="card-warm rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpen(isOpen ? null : b.id)}
              className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">
                  {b.slot ? `№${b.slot}` : "—"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {(b.answers.short_name as string) || b.full_name || "Без названия"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {[fmtPhone(b.phone), b.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              {b.file_url && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold flex-shrink-0">
                  PDF
                </span>
              )}
              <Icon
                name={isOpen ? "ChevronUp" : "ChevronDown"}
                size={15}
                className="text-muted-foreground flex-shrink-0"
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                  <span>{b.full_name || "Имя не указано"}</span>
                  <span>·</span>
                  <span>{fmtDate(b.created_at)}</span>
                </div>

                {b.file_url && (
                  <a
                    href={b.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-blue-50 border border-blue-200"
                  >
                    <Icon name="FileText" size={17} className="text-blue-600 flex-shrink-0" />
                    <span className="flex-1 text-xs font-semibold text-blue-700">
                      Открыть загруженный договор
                    </span>
                    <Icon name="ExternalLink" size={14} className="text-blue-600 flex-shrink-0" />
                  </a>
                )}

                {b.notes && (
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground mb-0.5">
                      Что просят изменить
                    </p>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{b.notes}</p>
                  </div>
                )}

                {filled.map((k) => {
                  const v = b.answers[k];
                  return (
                    <div key={k}>
                      <p className="text-[11px] font-bold text-muted-foreground mb-0.5">
                        {LABELS[k]}
                      </p>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {Array.isArray(v) ? v.join(", ") : v}
                      </p>
                    </div>
                  );
                })}

                {filled.length === 0 && !b.file_url && (
                  <p className="text-xs text-muted-foreground">Анкета пустая</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
