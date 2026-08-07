import Icon from "@/components/ui/icon";
import { formatDate } from "@/lib/date";
import { Contract } from "../constants";

interface Props {
  contract: Contract;
  menuId: number | null;
  setMenuId: (id: number | null) => void;
  onOpen: (c: Contract) => void;
  onStatus: (id: number, status: string) => void;
  onPdf: (c: Contract) => void;
  pdfLoadingId: number | null;
  shareId: number | null;
  setShareId: (id: number | null) => void;
  onShare: (c: Contract, channel: "telegram" | "whatsapp" | "sms" | "email") => void;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Создан",
  sent: "Отправлен",
  signed: "Подписан",
  deleted: "Удалён",
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  sent: "bg-sky-100 text-sky-700",
  signed: "bg-green-100 text-green-700",
  deleted: "bg-gray-200 text-gray-500",
};

const STEPS = ["draft", "sent", "signed"];
const STEP_ICON: Record<string, string> = { draft: "FilePlus2", sent: "Send", signed: "ShieldCheck" };

const CHANNELS = [
  { id: "telegram" as const, icon: "Send", label: "Telegram", color: "text-sky-500" },
  { id: "whatsapp" as const, icon: "MessageCircle", label: "WhatsApp", color: "text-green-500" },
  { id: "sms" as const, icon: "Smartphone", label: "SMS", color: "text-purple-500" },
  { id: "email" as const, icon: "Mail", label: "Почта", color: "text-orange-500" },
];

export default function ContractCard({
  contract, menuId, setMenuId, onOpen, onStatus, onPdf, pdfLoadingId, shareId, setShareId, onShare,
}: Props) {
  const signed = contract.status === "signed";
  const deleted = contract.status === "deleted";
  const stepIndex = Math.max(0, STEPS.indexOf(contract.status));

  return (
    <div className={`relative w-full card-warm rounded-2xl p-4 shadow-sm flex gap-3 transition-opacity ${deleted ? "opacity-50" : ""}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${deleted ? "bg-gray-200" : "bg-primary/10"}`}>
        <Icon name={signed ? "ShieldCheck" : "FileSignature"} size={19} className={deleted ? "text-gray-400" : "text-primary"} />
      </div>

      <button
        onClick={() => onOpen(contract)}
        className="flex-1 min-w-0 text-left active:scale-[0.98] transition-transform"
      >
        <p className={`text-sm font-medium leading-snug ${deleted ? "line-through text-muted-foreground" : ""}`}>
          {contract.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          № {contract.contract_number} · {formatDate(contract.contract_date)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {contract.client_name || "Без клиента"}
        </p>
        {!deleted && (
          <div className="flex items-center gap-1 mt-2.5">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      i === stepIndex
                        ? STATUS_STYLE[s]
                        : done
                          ? "bg-muted text-muted-foreground"
                          : "bg-transparent text-muted-foreground/40"
                    }`}
                  >
                    <Icon name={STEP_ICON[s]} size={10} />
                    {STATUS_LABEL[s]}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-2.5 h-px ${i < stepIndex ? "bg-muted-foreground/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {deleted && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLE.deleted}`}>
              Удалён
            </span>
          )}
          {signed && contract.sign_id && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Icon name="BadgeCheck" size={10} />
              ПЭП
            </span>
          )}
        </div>
      </button>

      <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2">
        <button
          onClick={() => setMenuId(menuId === contract.id ? null : contract.id)}
          className="w-8 h-8 rounded-lg border border-border bg-white/60 flex items-center justify-center"
          aria-label="Меню"
        >
          <Icon name="MoreVertical" size={15} className="text-muted-foreground" />
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShareId(shareId === contract.id ? null : contract.id)}
            disabled={pdfLoadingId === contract.id || deleted}
            aria-label="Отправить"
            className="w-8 h-8 rounded-lg gold-gradient text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Icon name={pdfLoadingId === contract.id ? "Loader" : "Share2"} size={14} className={pdfLoadingId === contract.id ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => onPdf(contract)}
            disabled={pdfLoadingId === contract.id || deleted}
            aria-label="Скачать PDF"
            className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 ${signed ? "bg-blue-50 text-blue-700" : "bg-primary/10 text-primary"}`}
          >
            <Icon name={signed ? "Stamp" : "FileDown"} size={15} />
          </button>
        </div>
      </div>

      {shareId === contract.id && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShareId(null)} />
          <div className="absolute right-3 bottom-14 z-20 w-48 bg-background rounded-xl border border-border shadow-xl p-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2.5 py-1.5">
              Отправить {signed ? "подписанный" : "документ"}
            </p>
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onShare(contract, ch.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name={ch.icon} size={15} className={ch.color} />
                {ch.label}
              </button>
            ))}
          </div>
        </>
      )}

      {menuId === contract.id && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
          <div className="absolute right-3 top-12 z-20 w-52 bg-background rounded-xl border border-border shadow-xl p-1">
            <button
              onClick={() => { setMenuId(null); onOpen(contract); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
            >
              <Icon name={signed ? "Eye" : "Pencil"} size={14} className="text-muted-foreground" />
              {signed ? "Посмотреть" : "Открыть и изменить"}
            </button>
            {contract.status === "draft" && (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "sent"); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name="Send" size={14} className="text-sky-600" />
                Отметить «Отправлен»
              </button>
            )}
            {contract.status === "sent" && (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "draft"); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name="Undo2" size={14} className="text-muted-foreground" />
                Вернуть в «Создан»
              </button>
            )}
            {!signed && (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "signed"); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name="PenLine" size={14} className="text-blue-700" />
                Подписать (ПЭП)
              </button>
            )}
            {signed && (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "draft"); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name="RotateCcw" size={14} className="text-muted-foreground" />
                Снять подпись
              </button>
            )}
            <button
              onClick={() => { setMenuId(null); setShareId(contract.id); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
            >
              <Icon name="Share2" size={14} className="text-muted-foreground" />
              Отправить клиенту
            </button>
            <button
              onClick={() => { setMenuId(null); onPdf(contract); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
            >
              <Icon name={signed ? "Stamp" : "FileDown"} size={14} className={signed ? "text-blue-700" : "text-muted-foreground"} />
              {signed ? "Скачать PDF с печатью" : "Скачать PDF"}
            </button>
            <button
              onClick={() => { setMenuId(null); onStatus(contract.id, "deleted"); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left text-red-600 hover:bg-red-50"
            >
              <Icon name="Trash2" size={14} />
              Удалить
            </button>
          </div>
        </>
      )}
    </div>
  );
}