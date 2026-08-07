import { useState, useEffect, useRef } from "react";
import { TemplateDoc } from "./docs";
import { CONTRACTS_URL, REQUISITES_URL, Contract } from "@/components/app/tabs/constants";
import TemplateFillHeader from "./TemplateFillHeader";
import TemplateFillFields from "./TemplateFillFields";
import TemplateFillFooter from "./TemplateFillFooter";

interface Props {
  doc: TemplateDoc;
  phone: string;
  userProfile?: { phone?: string | null; email?: string | null };
  contract?: Contract | null;
  onClose: () => void;
  onSaved?: () => void;
  onGoToAccount?: () => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const ENTITY_LABEL: Record<string, string> = {
  ip: "ИП",
  self_employed: "Самозанятый",
  individual: "Физ. лицо",
  ooo: "ООО",
};

const draftKey = (docTitle: string, contractId?: number | null) =>
  `doc_draft_${docTitle}_${contractId ?? "new"}`;

export default function TemplateFillModal({ doc, phone, userProfile, contract, onClose, onSaved, onGoToAccount }: Props) {
  const draftLoadedRef = useRef(false);

  const initialValues = (): Record<string, string> => {
    // Незавершённый черновик в этом же документе имеет приоритет — не теряем правки
    try {
      const raw = localStorage.getItem(draftKey(doc.title, contract?.id ?? null));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          draftLoadedRef.current = true;
          return parsed;
        }
      }
    } catch { /* ignore */ }

    if (contract?.values && Object.keys(contract.values).length) return contract.values;

    const v: Record<string, string> = { signDate: todayStr() };
    doc.fields.forEach((f) => {
      if (f.autofill && f.autofill !== "performer" && userProfile?.[f.autofill as "phone" | "email"]) {
        v[f.key] = userProfile[f.autofill as "phone" | "email"] as string;
      }
    });
    return v;
  };
  const [values, setValues] = useState<Record<string, string>>(initialValues());
  const [restoredNotice, setRestoredNotice] = useState(draftLoadedRef.current);
  const [performerAutofill, setPerformerAutofill] = useState<string | null>(null);
  const [requisitesLoaded, setRequisitesLoaded] = useState(false);
  const [hasRequisites, setHasRequisites] = useState(false);
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
  const draftStorageKey = draftKey(doc.title, contract?.id ?? null);

  useEffect(() => { setError(""); }, [values]);

  // Автосохранение черновика в браузере — данные не теряются, если закрыть без кнопки «Сохранить»
  useEffect(() => {
    if (locked) return;
    try { localStorage.setItem(draftStorageKey, JSON.stringify(values)); } catch { /* ignore */ }
  }, [values, locked, draftStorageKey]);

  // Подставляем свои реквизиты (ИП/самозанятый/ООО) в поле «Ваши данные»
  useEffect(() => {
    if (!phone) { setRequisitesLoaded(true); return; }
    fetch(REQUISITES_URL, { headers: { "X-Phone": phone } })
      .then((r) => r.json())
      .then((data) => {
        const r = data?.requisites;
        if (!r || !r.full_name) return;
        setHasRequisites(true);
        const parts = [ENTITY_LABEL[r.entity_type] ? `${ENTITY_LABEL[r.entity_type]} ${r.full_name}` : r.full_name];
        if (r.inn) parts.push(`ИНН ${r.inn}`);
        const summary = parts.join(", ");
        setPerformerAutofill(summary);
        setValues((prev) => (prev.performer ? prev : { ...prev, performer: summary }));
      })
      .catch(() => {})
      .finally(() => setRequisitesLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const set = (k: string, v: string) => {
    if (locked) return;
    setValues((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const visibleFields = doc.fields.filter((f) => !(f.key === "passport" && values.identMode !== "passport"));

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
      if (res.status === 403) { setError("Лимит документов на этом месяце исчерпан. Докупите пакет или смените тариф в Аккаунте."); return; }
      if (!parsed.contract) { setError("Не удалось сохранить, попробуйте ещё раз"); return; }
      setSavedId(parsed.contract.id);
      setSavedNumber(parsed.contract.contract_number || "");
      setStatus(parsed.contract.status || "draft");
      setDirty(false);
      setRestoredNotice(false);
      try {
        localStorage.removeItem(draftStorageKey);
        localStorage.removeItem(draftKey(doc.title, parsed.contract.id));
      } catch { /* ignore */ }
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
      if (status === "draft") setStatus("sent");
      onSaved?.();
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
        <TemplateFillHeader
          title={doc.title}
          savedNumber={savedNumber}
          savedId={savedId}
          status={status}
          locked={locked}
          saving={saving}
          onSave={handleSave}
          onClose={tryClose}
        />

        <TemplateFillFields
          doc={doc}
          contract={contract}
          visibleFields={visibleFields}
          values={values}
          text={text}
          preview={preview}
          locked={locked}
          restoredNotice={restoredNotice}
          error={error}
          performerAutofill={performerAutofill}
          userProfile={userProfile}
          requisitesLoaded={requisitesLoaded}
          hasRequisites={hasRequisites}
          onSet={set}
          onGoToAccount={onGoToAccount}
        />

        <TemplateFillFooter
          preview={preview}
          locked={locked}
          pdfLoading={pdfLoading}
          savedId={savedId}
          copied={copied}
          shareOpen={shareOpen}
          confirmClose={confirmClose}
          saving={saving}
          onShowPreview={() => setPreview(true)}
          onBackToFill={() => setPreview(false)}
          onDownload={locked ? downloadPdf : downloadDoc}
          onOpenShare={() => setShareOpen(true)}
          onCopy={copy}
          onCloseShare={() => setShareOpen(false)}
          onShare={share}
          onSaveAndClose={async () => { await handleSave(); setConfirmClose(false); onClose(); }}
          onCloseWithoutSaving={onClose}
          onCancelClose={() => setConfirmClose(false)}
        />
      </div>
    </div>
  );
}