import Icon from "@/components/ui/icon";
import { TemplateDoc, TemplateField } from "./docs";
import { Contract } from "@/components/app/tabs/constants";

interface Props {
  doc: TemplateDoc;
  contract?: Contract | null;
  visibleFields: TemplateField[];
  values: Record<string, string>;
  text: string;
  preview: boolean;
  locked: boolean;
  restoredNotice: boolean;
  error: string;
  performerAutofill: string | null;
  userProfile?: { phone?: string | null; email?: string | null };
  requisitesLoaded?: boolean;
  hasRequisites?: boolean;
  onSet: (k: string, v: string) => void;
  onGoToAccount?: () => void;
}

export default function TemplateFillFields({
  doc,
  contract,
  visibleFields,
  values,
  text,
  preview,
  locked,
  restoredNotice,
  error,
  performerAutofill,
  userProfile,
  requisitesLoaded,
  hasRequisites,
  onSet,
  onGoToAccount,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-40">
      {restoredNotice && !locked && (
        <div className="mb-3 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2">
          <Icon name="History" size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/80">
            Восстановили несохранённые данные с прошлого раза. Нажмите «Сохранить», чтобы закрепить их.
          </p>
        </div>
      )}
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
          {visibleFields.map((f) => {
            if (f.type === "checkbox") {
              return (
                <button
                  key={f.key}
                  onClick={() => onSet(f.key, values[f.key] === "1" ? "" : "1")}
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
              );
            }

            if (f.type === "radio") {
              return (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                  <div className="space-y-2">
                    {(f.options || []).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onSet(f.key, opt.value)}
                        disabled={locked}
                        className="w-full flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border bg-white/70 text-left active:scale-[0.99] transition-transform disabled:opacity-60"
                      >
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            values[f.key] === opt.value ? "border-primary" : "border-border"
                          }`}
                        >
                          {values[f.key] === opt.value && <div className="w-2.5 h-2.5 rounded-full gold-gradient" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm block">{opt.label}</span>
                          {opt.description && (
                            <span className="text-[11px] text-muted-foreground block mt-0.5">{opt.description}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            const autofilled = f.autofill === "performer"
              ? !!performerAutofill && values[f.key] === performerAutofill
              : f.autofill && userProfile?.[f.autofill] && values[f.key] === userProfile[f.autofill];

            // Свои реквизиты нельзя вписывать вручную — сначала их нужно заполнить в Аккаунте.
            // Если поле уже что-то содержит (например, из старого черновика) — не перекрываем.
            const needsRequisites = f.autofill === "performer" && requisitesLoaded && !hasRequisites && !locked && !values[f.key];

            if (needsRequisites) {
              return (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                  <button
                    onClick={onGoToAccount}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="UserCog" size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm block">Заполните реквизиты в Аккаунте</span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Данные подставятся сюда автоматически
                      </span>
                    </div>
                    <Icon name="ChevronRight" size={15} className="text-muted-foreground flex-shrink-0" />
                  </button>
                </div>
              );
            }

            return (
              <div key={f.key}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  {f.label}
                  {f.optional && <span className="text-muted-foreground/60"> — необязательно</span>}
                  {autofilled && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <Icon name="UserCheck" size={9} />
                      из профиля
                    </span>
                  )}
                </label>
                <input
                  type={f.type}
                  value={values[f.key] || ""}
                  onChange={(e) => onSet(f.key, e.target.value)}
                  readOnly={locked}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors read-only:opacity-70"
                />
                {f.hint && <p className="text-[11px] text-muted-foreground mt-1">{f.hint}</p>}
              </div>
            );
          })}

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
  );
}