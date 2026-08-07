import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { TemplateDoc } from "./docs";
import { CONTRACTS_URL, Contract } from "@/components/app/tabs/constants";

interface Props {
  doc: TemplateDoc;
  phone: string;
  contract?: Contract | null;
  onClose: () => void;
  onSaved?: () => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TemplateFillModal({ doc, phone, contract, onClose, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    contract?.values && Object.keys(contract.values).length ? contract.values : { signDate: todayStr() }
  );
  const [preview, setPreview] = useState(!!contract);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(contract?.id ?? null);
  const [savedNumber, setSavedNumber] = useState(contract?.contract_number || "");
  const [status, setStatus] = useState(contract?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const locked = status === "signed";

  useEffect(() => { setError(""); }, [values]);

  const set = (k: string, v: string) => {
    if (locked) return;
    setValues((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const visibleFields = doc.fields.filter((f) => !(f.key === "passport" && values.eSign === "1"));

  const text = doc.build(values);
  const fullText = `${doc.heading}\n\n${text}`;

  const handleSave = async () => {
    if (saving || locked) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({
          id: savedId,
          template_key: doc.title,
          title: doc.title,
          client_name: values.fio || "",
          contract_date: values.signDate || todayStr(),
          values,
          body: fullText,
        }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (res.status === 409) { setError("Документ уже подписан клиентом — изменить нельзя"); setStatus("signed"); return; }
      if (!parsed.contract) { setError("Не удалось сохранить, попробуйте ещё раз"); return; }
      setSavedId(parsed.contract.id);
      setSavedNumber(parsed.contract.contract_number || "");
      setStatus(parsed.contract.status || "draft");
      setDirty(false);
      onSaved?.();
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setSaving(false);
    }
  };

  const tryClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const downloadPdf = async () => {
    if (!savedId || pdfLoading) return;
    setPdfLoading(true);
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "pdf", id: savedId }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed.pdf_base64) {
        const bytes = Uint8Array.from(atob(parsed.pdf_base64), (ch) => ch.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${doc.title}_${savedNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { setError("Не удалось сформировать PDF"); }
    finally { setPdfLoading(false); }
  };

  const share = async (channel: "telegram" | "whatsapp" | "sms" | "email") => {
    setShareOpen(false);
    if (!savedId || pdfLoading) return;
    setPdfLoading(true);
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "share_link", id: savedId, origin: window.location.origin }),
      });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!parsed.url) { setError("Не удалось подготовить ссылку"); return; }
      const note = locked ? " (подписан электронной подписью)" : "";
      const subject = `${doc.title} № ${savedNumber}${note}`;
      const msg = encodeURIComponent(`${subject}\nСсылка действует 1 час:\n${parsed.url}`);
      const urls: Record<string, string> = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(parsed.url)}&text=${encodeURIComponent(subject)}`,
        whatsapp: `https://wa.me/?text=${msg}`,
        sms: `sms:?body=${msg}`,
        email: `mailto:?subject=${encodeURIComponent(subject)}&body=${msg}`,
      };
      window.open(urls[channel], "_blank");
    } catch { setError("Нет связи с сервером"); }
    finally { setPdfLoading(false); }
  };

  const downloadDoc = () => {
    const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body style="font-family:Times New Roman,serif;font-size:12pt;line-height:1.5"><p style="text-align:center;font-weight:bold">${doc.heading}</p>${text
      .split("\n\n")
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("")}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-background" />

      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="font-cormorant text-xl font-semibold leading-tight truncate">{doc.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {savedNumber && <span className="text-xs font-medium text-primary">№ {savedNumber}</span>}
                <span className="text-xs text-muted-foreground truncate">
                  {locked ? "Подписан клиентом" : savedId ? "Черновик сохранён" : "Заполните поля"}
                </span>
              </div>
            </div>
            {!locked && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-9 flex items-center gap-1.5 text-xs font-medium text-white gold-gradient rounded-xl px-3.5 shadow-sm active:scale-95 transition-transform flex-shrink-0 disabled:opacity-60"
              >
                <Icon name={saving ? "Loader" : "Save"} size={13} className={saving ? "animate-spin" : ""} />
                {saving ? "Сохраняю" : "Сохранить"}
              </button>
            )}
            <button
              onClick={tryClose}
              aria-label="Закрыть"
              className="w-9 h-9 flex-shrink-0 rounded-xl border border-border bg-white/60 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 pb-40">
          {error && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-[11px] text-red-600">{error}</p>
            </div>
          )}

          {locked && (
            <div className="mb-3 px-3.5 py-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="ShieldCheck" size={15} className="text-blue-700 flex-shrink-0" />
                <p className="text-xs font-semibold text-blue-800">Подписан простой электронной подписью</p>
              </div>
              <div className="space-y-0.5 text-[11px] text-blue-800/90">
                <p>Подписант: {contract?.signer_name || "—"}</p>
                <p>Телефон: {contract?.signer_phone || "—"}</p>
                <p>Дата и время: {contract?.signed_at ? contract.signed_at.replace("T", " ").slice(0, 19) : "—"}</p>
                <p>Идентификатор: {contract?.sign_id || "—"}</p>
                <p className="break-all">Отпечаток: {contract?.sign_hash || "—"}</p>
              </div>
            </div>
          )}

          {!preview ? (
            <div className="space-y-3">
              {visibleFields.map((f) =>
                f.type === "checkbox" ? (
                  <button
                    key={f.key}
                    onClick={() => set(f.key, values[f.key] === "1" ? "" : "1")}
                    disabled={locked}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-white/70 text-left active:scale-[0.99] transition-transform disabled:opacity-60"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border ${
                        values[f.key] === "1" ? "gold-gradient border-transparent" : "border-border bg-white"
                      }`}
                    >
                      {values[f.key] === "1" && <Icon name="Check" size={13} className="text-white" />}
                    </div>
                    <span className="text-sm">{f.label}</span>
                  </button>
                ) : (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {f.label}
                      {f.optional && <span className="text-muted-foreground/60"> — необязательно</span>}
                    </label>
                    <input
                      type={f.type}
                      value={values[f.key] || ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      readOnly={locked}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                    />
                    {f.hint && <p className="text-[11px] text-muted-foreground mt-1">{f.hint}</p>}
                  </div>
                )
              )}

              <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/50 border border-border rounded-xl px-3.5 py-3 mt-4">
                <Icon name="Info" size={13} className="flex-shrink-0 mt-0.5" />
                <span>Незаполненные поля останутся в тексте в квадратных скобках — их можно дописать от руки.</span>
              </div>
            </div>
          ) : (
            <div className="card-warm rounded-2xl p-4 border">
              <p className="text-sm font-semibold text-center mb-3 leading-snug">{doc.heading}</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{text}</p>
            </div>
          )}
        </div>

        <div
          className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-5 pt-4 bg-background border-t border-border/50"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          {!preview ? (
            <button
              onClick={() => setPreview(true)}
              className="w-full py-3.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Icon name="FileText" size={16} />
              Показать документ
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={locked ? downloadPdf : downloadDoc}
                  disabled={pdfLoading}
                  className={`flex-1 py-3 rounded-xl text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 ${locked ? "bg-blue-700" : "gold-gradient"}`}
                >
                  <Icon name={pdfLoading ? "Loader" : locked ? "Stamp" : "Download"} size={15} className={pdfLoading ? "animate-spin" : ""} />
                  {locked ? "PDF с печатью" : "Скачать Word"}
                </button>
                <button
                  onClick={() => savedId ? setShareOpen(true) : copy()}
                  disabled={pdfLoading}
                  className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  <Icon name={savedId ? "Share2" : copied ? "Check" : "Copy"} size={15} className={copied && !savedId ? "text-green-600" : ""} />
                  {savedId ? "Отправить" : copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
              {!locked && (
                <button
                  onClick={() => setPreview(false)}
                  className="w-full py-2.5 text-sm text-muted-foreground flex items-center justify-center gap-1.5"
                >
                  <Icon name="ChevronLeft" size={14} />
                  Вернуться к заполнению
                </button>
              )}
            </div>
          )}
        </div>

        {shareOpen && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end" onClick={() => setShareOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="relative bg-background rounded-t-3xl p-5 pb-10 space-y-2 shadow-2xl border-t border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Отправить {locked ? "подписанный документ" : "документ"}
              </p>
              {[
                { id: "telegram" as const, icon: "Send", label: "Telegram", color: "text-sky-500" },
                { id: "whatsapp" as const, icon: "MessageCircle", label: "WhatsApp", color: "text-green-500" },
                { id: "sms" as const, icon: "Smartphone", label: "SMS", color: "text-purple-500" },
                { id: "email" as const, icon: "Mail", label: "Электронная почта", color: "text-orange-500" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => share(ch.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white/60 active:scale-[0.98] transition-transform"
                >
                  <Icon name={ch.icon} size={18} className={ch.color} />
                  <span className="text-sm font-medium">{ch.label}</span>
                </button>
              ))}
              <button onClick={copy} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white/60">
                <Icon name={copied ? "Check" : "Copy"} size={18} className={copied ? "text-green-600" : "text-muted-foreground"} />
                <span className="text-sm font-medium">{copied ? "Текст скопирован" : "Скопировать текст"}</span>
              </button>
              <button onClick={() => setShareOpen(false)} className="w-full py-3 text-sm text-muted-foreground">
                Отмена
              </button>
            </div>
          </div>
        )}

        {confirmClose && (
          <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center px-6">
            <div className="bg-background rounded-2xl p-5 w-full max-w-xs shadow-2xl">
              <p className="text-sm font-medium mb-1">Сохранить изменения?</p>
              <p className="text-xs text-muted-foreground mb-4">Документ попадёт в раздел «Договоры»</p>
              <div className="space-y-2">
                <button
                  onClick={async () => { await handleSave(); setConfirmClose(false); onClose(); }}
                  className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium"
                >
                  Сохранить и закрыть
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-border bg-white/70 text-sm"
                >
                  Закрыть без сохранения
                </button>
                <button
                  onClick={() => setConfirmClose(false)}
                  className="w-full py-2 text-sm text-muted-foreground"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}