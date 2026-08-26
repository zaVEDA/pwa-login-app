import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { ClientInfo } from "@/components/app/invoice/types";

const CLIENTS_URL = "https://functions.poehali.dev/f20320e8-6fc3-47b0-b7a3-ef74f5e1c1d5";
const PHONE_DIGITS = 10;

interface Props {
  phone: string;
  onClose: () => void;
}

const clientTypeLabel = (t?: string) => (t === "ooo" ? "ООО" : t === "ip" ? "ИП" : "Физ. лицо");

export default function ClientsModal({ phone, onClose }: Props) {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = (query: string) => {
    setLoading(true);
    const url = query ? `${CLIENTS_URL}?search=${encodeURIComponent(query)}` : CLIENTS_URL;
    fetch(url, { headers: { "X-Phone": phone } })
      .then((r) => r.json())
      .then((data) => {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        setClients(parsed.clients || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!phone) return;
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, PHONE_DIGITS);
    setSearch(digits);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await fetch(`${CLIENTS_URL}?id=${id}`, { method: "DELETE", headers: { "X-Phone": phone } });
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-background" />
      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50 flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-border bg-white/60 flex items-center justify-center">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
          <h2 className="font-cormorant text-2xl font-semibold">Мои клиенты</h2>
        </div>

        <div className="flex-shrink-0 px-5 pt-4 pb-2">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              inputMode="numeric"
              value={search}
              onChange={handleSearchChange}
              placeholder="Поиск по номеру телефона"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 pl-1">Например: 9001234567 — только цифры, до {PHONE_DIGITS} знаков</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Icon name="Loader" size={22} className="animate-spin text-primary" />
            </div>
          )}

          {!loading && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon name="Users" size={28} className="text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? "Клиенты не найдены" : "Клиенты появятся здесь после первого счёта или документа"}
              </p>
            </div>
          )}

          {clients.map((c) => (
            <div key={c.id} className="card-warm rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={c.client_type === "ooo" ? "Building2" : c.client_type === "ip" ? "Briefcase" : "User"} size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {clientTypeLabel(c.client_type)}
                    {c.inn ? ` · ИНН ${c.inn}` : ""}
                  </p>
                  {c.pd_consent_signed && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                      <Icon name="ShieldCheck" size={10} />
                      Согласие на ПДн подписано
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Icon name={deletingId === c.id ? "Loader" : "Trash2"} size={14} className={deletingId === c.id ? "animate-spin" : ""} />
                </button>
              </div>

              {(c.phone || c.email) && (
                <div className="mt-2.5 pt-2.5 border-t border-border/60 space-y-1">
                  {c.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Icon name="Phone" size={11} />
                      {c.phone}
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Icon name="Mail" size={11} />
                      {c.email}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Icon name="FileText" size={12} className="text-primary" />
                  <span className="text-xs text-foreground">{c.documents_count ?? 0} документов</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Wallet" size={12} className="text-primary" />
                  <span className="text-xs text-foreground">
                    {(c.payments_total ?? 0).toLocaleString("ru-RU")} ₽ оплачено
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}