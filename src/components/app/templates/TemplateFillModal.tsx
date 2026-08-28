import { useState, useEffect, useRef } from "react";
import { TemplateDoc, templateDocs, PERSONAL_DATA_TITLE } from "./docs";
import { CONTRACTS_URL, REQUISITES_URL, Contract } from "@/components/app/tabs/constants";
import { CLIENTS_URL, ClientInfo } from "@/components/app/invoice/types";
import { PlanType } from "@/lib/auth";
import TemplateFillHeader from "./TemplateFillHeader";
import TemplateFillFields from "./TemplateFillFields";
import TemplateFillFooter from "./TemplateFillFooter";
import AttachPdConsentAsk from "./AttachPdConsentAsk";
import SendBundleModal from "./SendBundleModal";
import PdConsentReview from "./PdConsentReview";

interface Props {
  doc: TemplateDoc;
  phone: string;
  userProfile?: { phone?: string | null; email?: string | null };
  userPlan?: PlanType | null;
  contract?: Contract | null;
  /** Сразу открыть вопрос о соглашении ПДн и форму отправки (вызов из карточки договора) */
  autoSend?: boolean;
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

const draftKey = (docTitle: string, contractId?: number | string | null) =>
  `doc_draft_${docTitle}_${contractId ?? "new"}`;

export default function TemplateFillModal({ doc, phone, userProfile, userPlan, contract, autoSend, onClose, onSaved, onGoToAccount }: Props) {
  const draftLoadedRef = useRef(false);
  // Для нового (ещё не сохранённого) документа генерируем уникальный ключ черновика на каждое открытие,
  // чтобы при открытии нового шаблона поля не подтягивали данные из прошлого незавершённого документа
  const newInstanceIdRef = useRef(contract ? null : `new-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const initialValues = (): Record<string, string> => {
    // Незавершённый черновик в этом же документе имеет приоритет — не теряем правки (только для редактирования существующего)
    if (contract) {
      try {
        const raw = localStorage.getItem(draftKey(doc.title, contract.id));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            draftLoadedRef.current = true;
            return parsed;
          }
        }
      } catch { /* ignore */ }
    }

    if (contract?.values && Object.keys(contract.values).length) return contract.values;

    const v: Record<string, string> = { signDate: todayStr() };
    doc.fields.forEach((f) => {
      if (f.autofill && f.autofill !== "performer" && userProfile?.[f.autofill as "phone" | "email"]) {
        const raw = userProfile[f.autofill as "phone" | "email"] as string;
        v[f.key] = f.autofill === "phone" ? raw.replace(/\D/g, "").slice(-10) : raw;
      }
    });
    return v;
  };
  const [values, setValues] = useState<Record<string, string>>(initialValues());
  const [restoredNotice, setRestoredNotice] = useState(draftLoadedRef.current);
  const [performerAutofill, setPerformerAutofill] = useState<string | null>(null);
  const [signContact, setSignContact] = useState<{ phone?: string; email?: string }>({});
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
  const [smsSentNotice, setSmsSentNotice] = useState(false);

  // Флоу «приложить соглашение о ПДн»: вопрос → проверка автозаполненной формы → окно отправки
  const [askPdConsent, setAskPdConsent] = useState(false);
  const [pdConsentValues, setPdConsentValues] = useState<Record<string, string> | null>(null);
  const [pdConsentReview, setPdConsentReview] = useState(false);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [bundleSending, setBundleSending] = useState(false);
  const [bundleError, setBundleError] = useState("");

  const isPdConsentDoc = doc.title === PERSONAL_DATA_TITLE;
  const pdConsentDoc = templateDocs[PERSONAL_DATA_TITLE];

  const locked = status === "signed";
  const draftStorageKey = draftKey(doc.title, contract?.id ?? newInstanceIdRef.current);

  useEffect(() => { setError(""); }, [values]);

  useEffect(() => {
    if (!smsSentNotice) return;
    const t = setTimeout(() => setSmsSentNotice(false), 4000);
    return () => clearTimeout(t);
  }, [smsSentNotice]);

  // Автосохранение черновика в браузере — данные не теряются, если закрыть без кнопки «Сохранить»
  useEffect(() => {
    if (locked) return;
    try { localStorage.setItem(draftStorageKey, JSON.stringify(values)); } catch { /* ignore */ }
  }, [values, locked, draftStorageKey]);

  // Подставляем свои реквизиты (ИП/самозанятый/ООО) в поле «Ваши данные»,
  // а телефон/email для документов — из «Мои реквизиты» (приоритет над общим профилем)
  useEffect(() => {
    if (!phone) { setRequisitesLoaded(true); return; }
    fetch(REQUISITES_URL, { headers: { "X-Phone": phone } })
      .then((r) => r.json())
      .then((data) => {
        const r = data?.requisites;
        if (!r) return;

        if (r.sign_phone || r.sign_email) {
          const contact = {
            phone: r.sign_phone ? String(r.sign_phone).replace(/\D/g, "").slice(-10) : undefined,
            email: r.sign_email || undefined,
          };
          setSignContact(contact);
          setValues((prev) => {
            const next = { ...prev };
            doc.fields.forEach((f) => {
              if (f.autofill === "phone" && contact.phone && !prev[f.key]) next[f.key] = contact.phone;
              if (f.autofill === "email" && contact.email && !prev[f.key]) next[f.key] = contact.email;
            });
            return next;
          });
        }

        if (!r.full_name) return;
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

  // Вызов «Отправить на подпись» из карточки договора — сразу показываем вопрос о соглашении ПДн
  const autoSendDoneRef = useRef(false);
  useEffect(() => {
    if (!autoSend || autoSendDoneRef.current || !requisitesLoaded || locked) return;
    autoSendDoneRef.current = true;
    if (isPdConsentDoc) { setShareOpen(true); return; }
    setPreview(true);
    pdAlreadySigned(values.fio || contract?.client_name || "").then((signed) => {
      if (signed) { setPdConsentValues(null); setBundleOpen(true); }
      else setAskPdConsent(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, requisitesLoaded, locked]);

  const set = (k: string, v: string) => {
    if (locked) return;
    setValues((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const visibleFields = doc.fields.filter((f) => !(f.key === "passport" && values.identMode !== "passport"));

  const text = doc.build(values);
  const fullText = `${doc.heading}\n\n${text}`;

  // Сохраняет документ (создаёт или обновляет) и возвращает его id, либо null при ошибке.
  // Не трогает preview/shareOpen — этим управляют вызывающие функции.
  const saveContract = async (): Promise<number | null> => {
    if (saving || locked) return savedId;
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
      if (res.status === 409) { setError("Документ уже подписан клиентом — изменить нельзя"); setStatus("signed"); return null; }
      if (res.status === 403) { setError("Лимит документов на этом месяце исчерпан. Докупите пакет или смените тариф в Аккаунте."); return null; }
      if (!parsed.contract) { setError("Не удалось сохранить, попробуйте ещё раз"); return null; }
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
      return parsed.contract.id;
    } catch {
      setError("Нет связи с сервером");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => { await saveContract(); };

  // Главный сценарий: кнопка «Отправить на подпись по SMS» доступна сразу, без предварительного
  // нажатия «Сохранить» — сама сохраняет документ (если нужно) и открывает форму ввода телефона.
  // Проверяет, подписано ли уже согласие на ПДн с этим клиентом — тогда предлагать его повторно не нужно
  const pdAlreadySigned = async (clientName: string): Promise<boolean> => {
    if (!clientName.trim()) return false;
    try {
      const res = await fetch(CLIENTS_URL, { headers: { "X-Phone": phone } });
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const list: ClientInfo[] = parsed.clients || [];
      const found = list.find((c) => (c.name || "").trim().toLowerCase() === clientName.trim().toLowerCase());
      return !!found?.pd_consent_signed;
    } catch {
      return false;
    }
  };

  const openSignFlow = async () => {
    setPreview(true);
    const id = savedId ?? (await saveContract());
    if (!id) return;
    // Само согласие о ПДн отправляем как раньше — предлагать приложить его к самому себе не нужно
    if (isPdConsentDoc || locked) { setShareOpen(true); return; }
    // С этим клиентом согласие уже подписано — сразу к отправке договора
    if (await pdAlreadySigned(values.fio || contract?.client_name || "")) {
      setPdConsentValues(null);
      setBundleOpen(true);
      return;
    }
    setAskPdConsent(true);
  };

  // «Да» — заполняем соглашение о ПДн данными из текущего документа и открываем на проверку
  const acceptPdConsent = () => {
    setAskPdConsent(false);
    const v: Record<string, string> = { signDate: values.signDate || todayStr() };
    pdConsentDoc.fields.forEach((f) => {
      if (values[f.key]) v[f.key] = values[f.key];
      if (f.autofill === "performer" && !v[f.key] && performerAutofill) v[f.key] = performerAutofill;
      if (f.autofill === "phone" && !v[f.key]) {
        const p = signContact.phone || userProfile?.phone;
        if (p) v[f.key] = String(p).replace(/\D/g, "").slice(-10);
      }
      if (f.autofill === "email" && !v[f.key]) {
        const e = signContact.email || userProfile?.email;
        if (e) v[f.key] = e;
      }
    });
    if (!v.identMode) v.identMode = "none";
    setPdConsentValues(v);
    setPdConsentReview(true);
  };

  const declinePdConsent = () => {
    setAskPdConsent(false);
    setPdConsentValues(null);
    setBundleOpen(true);
  };

  // Отправка одного документа на подпись по SMS. Возвращает true при успехе.
  const sendOne = async (contractId: number, clientPhone: string): Promise<boolean> => {
    const res = await fetch(CONTRACTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Phone": phone },
      body: JSON.stringify({ action: "share_link", id: contractId, origin: window.location.origin, channel: "sms", client_phone: clientPhone }),
    });
    if (res.status === 403) throw new Error("Лимит отправок на тестовом тарифе исчерпан. Выберите платный тариф.");
    const raw = await res.json();
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return !!parsed.sms_sent;
  };

  // Сохраняет соглашение о ПДн отдельным документом и возвращает его id
  const savePdConsent = async (v: Record<string, string>): Promise<number | null> => {
    const consentText = `${pdConsentDoc.heading}\n\n${pdConsentDoc.build(v)}`;
    const res = await fetch(CONTRACTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Phone": phone },
      body: JSON.stringify({
        id: null,
        template_key: pdConsentDoc.title,
        title: pdConsentDoc.title,
        client_name: v.fio || values.fio || "",
        contract_date: v.signDate || todayStr(),
        values: v,
        body: consentText,
      }),
    });
    if (res.status === 403) throw new Error("Лимит документов исчерпан. Докупите пакет или смените тариф.");
    const raw = await res.json();
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed.contract?.id ?? null;
  };

  const sendBundle = async ({ phone: clientPhone, sendMain, sendConsent }: { phone: string; sendMain: boolean; sendConsent: boolean }) => {
    setBundleSending(true);
    setBundleError("");
    try {
      let okAny = false;

      if (sendMain && savedId) {
        const ok = await sendOne(savedId, clientPhone);
        if (!ok) { setBundleError("Не удалось отправить SMS. Проверьте номер и попробуйте ещё раз"); return; }
        okAny = true;
        setStatus("sent");
      }

      if (sendConsent && pdConsentValues) {
        const consentId = await savePdConsent(pdConsentValues);
        if (!consentId) { setBundleError("Не удалось сохранить соглашение о персональных данных"); return; }
        const ok = await sendOne(consentId, clientPhone);
        if (!ok) { setBundleError("Договор отправлен, но соглашение о ПДн отправить не удалось"); return; }
        okAny = true;
      }

      if (okAny) {
        setBundleOpen(false);
        setPdConsentValues(null);
        setSmsSentNotice(true);
        onSaved?.();
      }
    } catch (e) {
      setBundleError(e instanceof Error ? e.message : "Нет связи с сервером");
    } finally {
      setBundleSending(false);
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

  const share = async (channel: "telegram" | "whatsapp" | "sms" | "email", clientPhone?: string) => {
    setShareOpen(false);
    if (!savedId || pdfLoading) return;
    setPdfLoading(true);
    try {
      const res = await fetch(CONTRACTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Phone": phone },
        body: JSON.stringify({ action: "share_link", id: savedId, origin: window.location.origin, channel, client_phone: clientPhone }),
      });
      if (res.status === 403) {
        setError("Лимит отправок на тестовом тарифе исчерпан (2 из 2). Выберите платный тариф.");
        return;
      }
      const raw = await res.json();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!parsed.url) { setError("Не удалось подготовить ссылку"); return; }

      // SMS клиенту отправляется реально сервером (SMS.ru) — не нужно открывать
      // программу SMS на телефоне пользователя, сообщение уже ушло клиенту.
      if (channel === "sms") {
        if (!parsed.sms_sent) { setError("Не удалось отправить SMS клиенту. Проверьте номер и попробуйте ещё раз"); return; }
        if (status === "draft") setStatus("sent");
        setSmsSentNotice(true);
        onSaved?.();
        return;
      }

      const note = locked ? " (подписан электронной подписью)" : "";
      const subject = `${doc.title} № ${savedNumber}${note}`;
      const msg = encodeURIComponent(`${subject}\nСсылка действует 24 часа:\n${parsed.url}`);
      const urls: Record<string, string> = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(parsed.url)}&text=${encodeURIComponent(subject)}`,
        whatsapp: `https://wa.me/?text=${msg}`,
        email: `mailto:?subject=${encodeURIComponent(subject)}&body=${msg}`,
      };
      window.open(urls[channel], "_blank");
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
          smsSentNotice={smsSentNotice}
          error={error}
          performerAutofill={performerAutofill}
          userProfile={{ phone: signContact.phone || userProfile?.phone, email: signContact.email || userProfile?.email }}
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
          onOpenSign={openSignFlow}
          onCopy={copy}
          onCloseShare={() => setShareOpen(false)}
          onShare={share}
          onSaveAndClose={async () => { await handleSave(); setConfirmClose(false); onClose(); }}
          onCloseWithoutSaving={onClose}
          onCancelClose={() => setConfirmClose(false)}
        />
      </div>

      {askPdConsent && (
        <AttachPdConsentAsk onYes={acceptPdConsent} onNo={declinePdConsent} />
      )}

      {pdConsentReview && pdConsentValues && (
        <PdConsentReview
          doc={pdConsentDoc}
          values={pdConsentValues}
          onSet={(k, v) => setPdConsentValues((p) => ({ ...(p || {}), [k]: v }))}
          onBack={() => { setPdConsentReview(false); setAskPdConsent(true); }}
          onReady={() => { setPdConsentReview(false); setBundleOpen(true); }}
        />
      )}

      {bundleOpen && (
        <SendBundleModal
          mainTitle={doc.title}
          initialPhone={contract?.client_phone || ""}
          sending={bundleSending}
          error={bundleError}
          isTrial={userPlan === "trial"}
          onClose={() => { setBundleOpen(false); setBundleError(""); }}
          onSend={sendBundle}
        />
      )}
    </div>
  );
}