import { useState } from "react";
import Icon from "@/components/ui/icon";
import { TemplateDoc } from "./docs";

interface Props {
  doc: TemplateDoc;
  onClose: () => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TemplateFillModal({ doc, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>({ signDate: todayStr() });
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const visibleFields = doc.fields.filter((f) => {
    if (f.key === "passport" && values.eSign === "1") return false;
    return true;
  });

  const text = doc.build(values);
  const fullText = `${doc.heading}\n\n${text}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
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
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-border/50">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="font-cormorant text-xl font-semibold leading-tight">{doc.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {preview ? "Готовый документ" : "Заполните поля"}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="w-9 h-9 flex-shrink-0 rounded-xl border border-border bg-white/60 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-32">
          {!preview ? (
            <div className="space-y-3">
              {visibleFields.map((f) =>
                f.type === "checkbox" ? (
                  <button
                    key={f.key}
                    onClick={() => set(f.key, values[f.key] === "1" ? "" : "1")}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-white/70 text-left active:scale-[0.99] transition-transform"
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
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
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

        {/* Footer */}
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
                  onClick={downloadDoc}
                  className="flex-1 py-3 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Icon name="Download" size={15} />
                  Скачать Word
                </button>
                <button
                  onClick={copy}
                  className="flex-1 py-3 rounded-xl border border-border bg-white/70 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Icon name={copied ? "Check" : "Copy"} size={15} className={copied ? "text-green-600" : ""} />
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
              <button
                onClick={() => setPreview(false)}
                className="w-full py-2.5 text-sm text-muted-foreground flex items-center justify-center gap-1.5"
              >
                <Icon name="ChevronLeft" size={14} />
                Вернуться к заполнению
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
