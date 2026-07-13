import { Dispatch, SetStateAction } from "react";
import Icon from "@/components/ui/icon";
import { ClientInfo, ClientType } from "./types";

interface Props {
  clientType: ClientType;
  clientInn: string;
  clientChecking: boolean;
  clientError: string;
  clientInfo: ClientInfo | null;
  savedClients: ClientInfo[];
  showClientList: boolean;
  innMaxLen: number;
  readOnly: boolean;
  setClientType: (v: ClientType) => void;
  setClientInn: (v: string) => void;
  setClientInfo: (v: ClientInfo | null) => void;
  setClientError: (v: string) => void;
  setShowClientList: Dispatch<SetStateAction<boolean>>;
  handleInnCheck: (val: string) => void;
}

export default function InvoiceClientSection({
  clientType,
  clientInn,
  clientChecking,
  clientError,
  clientInfo,
  savedClients,
  showClientList,
  innMaxLen,
  readOnly,
  setClientType,
  setClientInn,
  setClientInfo,
  setClientError,
  setShowClientList,
  handleInnCheck,
}: Props) {
  // Режим только для чтения: показываем данные клиента без возможности редактирования
  if (readOnly) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Кому выставляем</p>
        <div className="rounded-xl border border-border bg-white/60 p-3 space-y-2">
          <p className="text-sm font-medium">{clientInfo?.name || "—"}</p>
          {clientInfo?.inn && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground">ИНН</p>
                <p className="text-sm font-medium mt-0.5">{clientInfo.inn}</p>
              </div>
              {clientInfo.ogrnip && (
                <div>
                  <p className="text-[10px] text-muted-foreground">{clientType === "ooo" ? "ОГРН" : "ОГРНИП"}</p>
                  <p className="text-sm font-medium mt-0.5">{clientInfo.ogrnip}</p>
                </div>
              )}
            </div>
          )}
          {clientInfo?.address && (
            <div>
              <p className="text-[10px] text-muted-foreground">Адрес</p>
              <p className="text-sm mt-0.5">{clientInfo.address}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Кому выставляем</p>

      {/* Тип клиента — подсвечивается обводкой по выбранному клиенту / ИНН */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { value: "ip", label: "ИП", icon: "Briefcase" },
          { value: "ooo", label: "ООО", icon: "Building2" },
          { value: "individual", label: "Физ. лицо", icon: "User" },
        ] as { value: ClientType; label: string; icon: string }[]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setClientType(opt.value); setClientInn(""); setClientInfo(null); setClientError(""); }}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
              clientType === opt.value
                ? "gold-gradient text-white border-primary shadow-sm ring-2 ring-primary/30"
                : "bg-white/60 border-transparent text-foreground"
            }`}
          >
            <Icon name={opt.icon} size={13} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Быстрый выбор из справочника — не сворачивается, видно что выбрано */}
      {savedClients.length > 0 && (
        <div>
          <button
            onClick={() => setShowClientList(v => !v)}
            className="flex items-center gap-1.5 text-xs text-primary font-medium"
          >
            <Icon name="Users" size={13} />
            Выбрать из справочника ({savedClients.length})
            <Icon name={showClientList ? "ChevronUp" : "ChevronDown"} size={12} />
          </button>
          {showClientList && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
              {savedClients.map((c) => {
                const selected = !!clientInfo && (
                  (c.inn && clientInfo.inn && c.inn === clientInfo.inn) ||
                  (!c.inn && !clientInfo.inn && c.name === clientInfo.name)
                );
                return (
                  <button
                    key={c.id ?? c.inn}
                    onClick={() => {
                      setClientInfo(c);
                      setClientInn(c.inn || "");
                      setClientType((c.client_type as ClientType) || (c.inn ? "ip" : "individual"));
                      setClientError("");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-colors flex items-center gap-2 ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-white/70 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{c.inn ? `ИНН ${c.inn}` : "Физ. лицо"}</p>
                    </div>
                    {selected && <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Физ. лицо — просто ФИО */}
      {clientType === "individual" && !clientInfo && (
        <div>
          <input
            type="text"
            value={clientInn}
            onChange={(e) => setClientInn(e.target.value)}
            onBlur={() => {
              if (clientInn.trim()) {
                const info: ClientInfo = { name: clientInn.trim(), inn: "", ogrnip: "", address: "" };
                setClientInfo(info);
              }
            }}
            placeholder="ФИО или любое название"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* ИНН для ИП / ООО */}
      {(clientType === "ip" || clientType === "ooo") && !clientInfo && (
        <div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={clientInn}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, innMaxLen);
                setClientInn(val);
                setClientInfo(null);
                setClientError("");
                if (val.length === innMaxLen) setTimeout(() => handleInnCheck(val), 0);
              }}
              placeholder={clientType === "ooo" ? "ИНН организации (10 цифр)" : "ИНН (12 цифр)"}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors pr-9"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {clientChecking && <Icon name="Loader" size={14} className="animate-spin text-muted-foreground" />}
            </div>
          </div>
          {clientError && <p className="text-[11px] text-red-500 mt-1">{clientError}</p>}
        </div>
      )}

      {/* Данные клиента */}
      {clientInfo && (
        <div className={`rounded-xl border p-3 space-y-2 ${clientType === "individual" ? "border-border bg-white/60" : "border-green-200 bg-green-50/60"}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              {clientType !== "individual" && <Icon name="CheckCircle" size={13} className="text-green-600" />}
              <p className={`text-[11px] font-medium ${clientType === "individual" ? "text-foreground" : "text-green-700"}`}>
                {clientType === "individual" ? "Физическое лицо" : "Найден в реестре ФНС"}
              </p>
            </div>
            <button
              onClick={() => { setClientInfo(null); setClientInn(""); setClientError(""); }}
              className="text-[11px] text-muted-foreground flex items-center gap-1"
            >
              <Icon name="Pencil" size={11} />
              Изменить
            </button>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Клиент</p>
            <input
              type="text"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors mt-0.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">ИНН</p>
              <p className="text-sm font-medium mt-0.5">{clientInfo.inn}</p>
            </div>
            {clientInfo.ogrnip && (
              <div>
                <p className="text-[10px] text-muted-foreground">{clientType === "ooo" ? "ОГРН" : "ОГРНИП"}</p>
                <p className="text-sm font-medium mt-0.5">{clientInfo.ogrnip}</p>
              </div>
            )}
          </div>
          {clientInfo.address && (
            <div>
              <p className="text-[10px] text-muted-foreground">Адрес</p>
              <input
                type="text"
                value={clientInfo.address}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors mt-0.5"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}