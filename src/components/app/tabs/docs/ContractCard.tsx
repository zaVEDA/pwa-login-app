import Icon from "@/components/ui/icon";
import { formatDate } from "@/lib/date";
import { Contract } from "../constants";

interface Props {
  contract: Contract;
  menuId: number | null;
  setMenuId: (id: number | null) => void;
  onOpen: (c: Contract) => void;
  onStatus: (id: number, status: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
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

export default function ContractCard({ contract, menuId, setMenuId, onOpen, onStatus }: Props) {
  const signed = contract.status === "signed";
  const deleted = contract.status === "deleted";

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
        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLE[contract.status] || STATUS_STYLE.draft}`}>
          {STATUS_LABEL[contract.status] || contract.status}
        </span>
      </button>

      <div className="flex-shrink-0 flex flex-col items-end justify-between">
        <button
          onClick={() => setMenuId(menuId === contract.id ? null : contract.id)}
          className="w-8 h-8 rounded-lg border border-border bg-white/60 flex items-center justify-center"
          aria-label="Меню"
        >
          <Icon name="MoreVertical" size={15} className="text-muted-foreground" />
        </button>
        {!signed && !deleted && (
          <Icon name="Pencil" size={13} className="text-muted-foreground mb-1" />
        )}
      </div>

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
            {!signed && (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "sent"); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name="Send" size={14} className="text-muted-foreground" />
                Отметить «Отправлен»
              </button>
            )}
            {!signed && (
              <button
                onClick={() => { setMenuId(null); onStatus(contract.id, "signed"); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-amber-50"
              >
                <Icon name="ShieldCheck" size={14} className="text-green-600" />
                Клиент подписал
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
