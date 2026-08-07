import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CONTRACTS_URL } from "@/components/app/tabs/constants";

interface SharedDocData {
  title: string;
  contract_number: string;
  contract_date: string | null;
  client_name: string | null;
  status: string;
  signed_at: string | null;
  signer_name: string | null;
  file_url: string;
  expires_at: string;
}

const fmt = (v?: string | null) => {
  if (!v) return "—";
  const d = v.slice(0, 10).split("-");
  return d.length === 3 ? `${d[2]}.${d[1]}.${d[0]}` : v;
};

export default function SharedDoc() {
  const { token } = useParams();
  const [data, setData] = useState<SharedDocData | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "expired" | "missing">("loading");
  const [left, setLeft] = useState("");

  useEffect(() => {
    if (!token) { setState("missing"); return; }
    fetch(`${CONTRACTS_URL}?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const raw = await r.json();
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (r.status === 410) { setState("expired"); return; }
        if (!r.ok || !parsed.file_url) { setState("missing"); return; }
        setData(parsed);
        setState("ok");
      })
      .catch(() => setState("missing"));
  }, [token]);

  useEffect(() => {
    if (!data?.expires_at) return;
    const tick = () => {
      const end = new Date(data.expires_at.replace(" ", "T")).getTime();
      const diff = end - Date.now();
      if (diff <= 0) { setState("expired"); setLeft(""); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${m} мин ${String(s).padStart(2, "0")} сек`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [data]);

  const signed = data?.status === "signed";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-md">
        {state === "loading" && (
          <div className="flex flex-col items-center py-20">
            <Icon name="Loader" size={26} className="animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-3">Открываем документ</p>
          </div>
        )}

        {(state === "expired" || state === "missing") && (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <Icon name={state === "expired" ? "TimerOff" : "FileX"} size={26} className="text-amber-600" />
            </div>
            <p className="text-base font-semibold">
              {state === "expired" ? "Срок ссылки истёк" : "Документ не найден"}
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {state === "expired"
                ? "Ссылка на документ действует 1 час. Попросите отправителя прислать новую."
                : "Возможно, ссылка указана неверно или документ был удалён."}
            </p>
          </div>
        )}

        {state === "ok" && data && (
          <>
            <div className="card-warm rounded-2xl p-5 border shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${signed ? "bg-blue-50 border border-blue-200" : "bg-primary/10"}`}>
                  <Icon name={signed ? "ShieldCheck" : "FileText"} size={20} className={signed ? "text-blue-700" : "text-primary"} />
                </div>
                <div className="min-w-0">
                  <h1 className="font-cormorant text-xl font-semibold leading-tight">{data.title}</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    № {data.contract_number} от {fmt(data.contract_date)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <p>Кому: {data.client_name || "—"}</p>
                {signed && (
                  <>
                    <p className="text-blue-700">Подписан: {data.signer_name || "—"}</p>
                    <p className="text-blue-700">Дата подписания: {fmt(data.signed_at)}</p>
                  </>
                )}
              </div>

              {signed && (
                <div className="mt-4 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                  <Icon name="BadgeCheck" size={14} className="text-blue-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Документ подписан простой электронной подписью. В PDF есть печать и реквизиты подписания.
                  </p>
                </div>
              )}

              <a
                href={data.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 w-full py-3.5 rounded-xl text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${signed ? "bg-blue-700" : "gold-gradient"}`}
              >
                <Icon name={signed ? "Stamp" : "FileDown"} size={16} />
                Открыть документ (PDF)
              </a>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Icon name="Clock" size={13} />
              Ссылка действует ещё {left}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
