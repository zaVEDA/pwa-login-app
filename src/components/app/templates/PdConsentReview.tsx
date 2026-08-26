import Icon from "@/components/ui/icon";
import PhoneInput from "@/components/ui/phone-input";
import { TemplateDoc } from "./docs";

interface Props {
  doc: TemplateDoc;
  values: Record<string, string>;
  onSet: (k: string, v: string) => void;
  onBack: () => void;
  onReady: () => void;
}

function isoToRu(v: string): string {
  if (!v) return "";
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  const d = v.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join(".");
}

function ruToIso(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length < 8) return d.length ? d : "";
  return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
}

export default function PdConsentReview({ doc, values, onSet, onBack, onReady }: Props) {
  const visible = doc.fields.filter((f) => !(f.key === "passport" && values.identMode !== "passport"));
  const text = doc.build(values);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      <div className="absolute inset-0 bg-background" />

      <div className="relative flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex-shrink-0 rounded-xl border border-border bg-white/60 flex items-center justify-center"
          >
            <Icon name="ChevronLeft" size={16} className="text-muted-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-cormorant text-xl font-semibold leading-tight truncate">{doc.title}</h2>
            <p className="text-[11px] text-muted-foreground">Проверьте данные перед отправкой</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 pb-40 space-y-3">
          <div className="px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2">
            <Icon name="Wand2" size={14} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/80">
              Мы заполнили соглашение данными из вашего документа. Проверьте и при необходимости поправьте.
            </p>
          </div>

          {visible.map((f) => {
            if (f.type === "radio") {
              return (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                  <div className="space-y-2">
                    {(f.options || []).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onSet(f.key, opt.value)}
                        className="w-full flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border bg-white/70 text-left active:scale-[0.99] transition-transform"
                      >
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            values[f.key] === opt.value ? "border-primary" : "border-border"
                          }`}
                        >
                          {values[f.key] === opt.value && <div className="w-2.5 h-2.5 rounded-full gold-gradient" />}
                        </div>
                        <span className="text-sm">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            if (f.type === "checkbox") {
              return (
                <button
                  key={f.key}
                  onClick={() => onSet(f.key, values[f.key] === "1" ? "" : "1")}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-white/70 text-left"
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

            return (
              <div key={f.key}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {f.label}
                  {f.optional && <span className="text-muted-foreground/60"> — необязательно</span>}
                </label>
                {f.type === "tel" ? (
                  <PhoneInput
                    value={values[f.key] || ""}
                    onChange={(v) => onSet(f.key, v)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm font-medium outline-none focus:border-primary"
                  />
                ) : (
                  <input
                    type={f.type === "date" ? "text" : f.type}
                    inputMode={f.type === "date" ? "numeric" : undefined}
                    value={f.type === "date" ? isoToRu(values[f.key] || "") : values[f.key] || ""}
                    onChange={(e) => onSet(f.key, f.type === "date" ? ruToIso(e.target.value) : e.target.value)}
                    maxLength={f.type === "date" ? 10 : undefined}
                    placeholder={f.type === "date" ? "дд.мм.гггг" : f.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
                  />
                )}
              </div>
            );
          })}

          <div className="card-warm rounded-2xl p-4 border mt-4">
            <p className="text-sm font-semibold text-center mb-3 leading-snug">{doc.heading}</p>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{text}</p>
          </div>
        </div>

        <div
          className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-5 pt-4 bg-background border-t border-border/50"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={onReady}
            className="w-full py-3.5 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="Check" size={16} />
            Всё верно, к отправке
          </button>
        </div>
      </div>
    </div>
  );
}
