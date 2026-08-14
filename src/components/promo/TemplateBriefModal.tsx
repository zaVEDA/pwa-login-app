import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { briefSteps, BriefField } from "./templateBriefSteps";

const BRIEF_URL = "https://functions.poehali.dev/b9cceef8-d56c-4b6d-9fbb-85f2732e8839";
const CAPY_IMG = "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/22321e71-dc00-4ecf-be48-24104b95dfde.jpg";

type Answers = Record<string, string | string[]>;

interface Props {
  onClose: () => void;
  initialStep?: number;
}

function Capy({ line }: { line: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl px-3.5 py-3.5 bg-primary/[0.07] border border-primary/15">
      <img
        src={CAPY_IMG}
        alt=""
        className="w-[68px] h-[68px] rounded-2xl object-cover flex-shrink-0 shadow-sm"
      />
      <p className="text-[13px] leading-relaxed text-foreground/85 font-medium">{line}</p>
    </div>
  );
}

export default function TemplateBriefModal({ onClose, initialStep = -1 }: Props) {
  const [step, setStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Answers>({});
  const [file, setFile] = useState<{ name: string; base64: string } | null>(null);
  const [sampleNotes, setSampleNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const totalSteps = briefSteps.length;

  const pickFile = (f: File) => {
    setError("");
    if (f.type !== "application/pdf") return setError("Принимаем только PDF");
    if (f.size > 10 * 1024 * 1024) return setError("Файл больше 10 МБ");
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || "");
      setFile({ name: f.name, base64: res.split(",")[1] || "" });
    };
    reader.readAsDataURL(f);
  };

  const setVal = (key: string, v: string | string[]) =>
    setAnswers((p) => ({ ...p, [key]: v }));

  const toggleCheck = (key: string, opt: string) => {
    const cur = (answers[key] as string[]) || [];
    setVal(key, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  };

  const visibleFields = (fields: BriefField[]) =>
    fields.filter((f) => !f.showIf || f.showIf(answers));

  const canGoNext = () => {
    if (step < 0) return true;
    const required = visibleFields(briefSteps[step].fields).filter((f) => !f.optional);
    return required.every((f) => {
      const v = answers[f.key];
      return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
    });
  };

  const submit = async (withFileOnly = false) => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch(BRIEF_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({
          file_base64: file?.base64,
          sample_notes: withFileOnly ? sampleNotes : "",
          answers: withFileOnly ? {} : answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Не удалось отправить"); return; }
      setSent(true);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f: BriefField) => {
    const v = answers[f.key];
    return (
      <div key={f.key}>
        <label className="text-sm font-semibold text-foreground block mb-1.5">
          {f.label}
          {f.optional && <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">необязательно</span>}
        </label>

        {f.type === "choice" && (
          <div className="flex flex-wrap gap-1.5">
            {f.options?.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setVal(f.key, o)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  v === o
                    ? "gold-gradient text-white border-transparent shadow-sm"
                    : "bg-white/70 border-border text-foreground"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}

        {f.type === "checkboxes" && (
          <div className="space-y-1.5">
            {f.options?.map((o) => {
              const on = ((v as string[]) || []).includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggleCheck(f.key, o)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs border transition-all ${
                    on ? "bg-primary/10 border-primary/40" : "bg-white/70 border-border"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border ${
                    on ? "gold-gradient border-transparent" : "border-border bg-white"
                  }`}>
                    {on && <Icon name="Check" size={11} className="text-white" />}
                  </span>
                  <span className="flex-1">{o}</span>
                </button>
              );
            })}
          </div>
        )}

        {f.type === "text" && (
          <input
            value={(v as string) || ""}
            onChange={(e) => setVal(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
          />
        )}

        {f.type === "textarea" && (
          <textarea
            value={(v as string) || ""}
            onChange={(e) => setVal(f.key, e.target.value)}
            placeholder={f.placeholder}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
          />
        )}

        {f.hint && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{f.hint}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[75] flex flex-col max-w-md mx-auto bg-background">
      {/* Шапка */}
      <div className="px-5 pt-5 pb-3 border-b border-border/60 flex-shrink-0">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h2 className="font-cormorant text-xl font-semibold truncate">
              {sent ? "Готово" : step < 0 ? "Ваш шаблон документа" : briefSteps[step].title}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {sent ? "Заявка принята" : step < 0 ? "Заполним вместе за 5 минут" : briefSteps[step].subtitle}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground flex-shrink-0">
            <Icon name="X" size={20} />
          </button>
        </div>

        {!sent && step >= 0 && (
          <div className="flex gap-1">
            {briefSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "gold-gradient" : "bg-border"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {sent && (
          <div className="text-center py-8">
            <img src={CAPY_IMG} alt="" className="w-32 h-32 rounded-3xl object-cover mx-auto mb-4 shadow-md" />
            <p className="font-cormorant text-2xl font-semibold mb-1.5">Спасибо!</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Мы получили вашу анкету и готовим шаблон. Свяжемся, если понадобятся уточнения.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium"
            >
              Хорошо
            </button>
          </div>
        )}

        {/* Шаг 0: быстрый путь */}
        {!sent && step < 0 && (
          <>
            <Capy line="Привет! Я помогу собрать ваш договор. Если у вас уже есть готовый — будет совсем быстро" />

            <div>
              <p className="text-sm font-semibold mb-1.5">
                Есть готовый договор, которым вы пользуетесь?
              </p>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Загрузите его — доработаем и приведём в порядок. Это быстрее, чем заполнять анкету.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
              />

              {file ? (
                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-green-50 border border-green-200">
                  <Icon name="FileCheck" size={17} className="text-green-600 flex-shrink-0" />
                  <span className="flex-1 text-xs font-medium truncate">{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-muted-foreground p-0.5">
                    <Icon name="X" size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] text-sm font-medium text-primary"
                >
                  <Icon name="Upload" size={17} />
                  Загрузить PDF
                </button>
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">Формат PDF, до 10 МБ</p>
            </div>

            {file && (
              <div>
                <label className="text-sm font-semibold block mb-1.5">
                  Что в нём хочется изменить или добавить?
                </label>
                <textarea
                  value={sampleNotes}
                  onChange={(e) => setSampleNotes(e.target.value)}
                  rows={3}
                  placeholder="Например: добавить условие о переносе даты"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            )}
          </>
        )}

        {/* Шаги анкеты */}
        {!sent && step >= 0 && (
          <>
            <Capy line={briefSteps[step].capyLine} />
            {visibleFields(briefSteps[step].fields).map(renderField)}
          </>
        )}
      </div>

      {/* Кнопки */}
      {!sent && (
        <div className="px-5 py-4 border-t border-border/60 flex-shrink-0 space-y-2">
          {step < 0 ? (
            <>
              {file && (
                <button
                  onClick={() => submit(true)}
                  disabled={loading}
                  className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                  Отправить договор
                </button>
              )}
              <button
                onClick={() => setStep(0)}
                className={`w-full py-3 rounded-xl text-sm font-medium ${
                  file ? "bg-white/70 border border-border text-foreground" : "gold-gradient text-white"
                }`}
              >
                {file ? "Хочу ещё ответить на вопросы" : "У меня нет готового — ответить на вопросы"}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-3 rounded-xl bg-white/70 border border-border text-sm font-medium"
              >
                <Icon name="ChevronLeft" size={16} />
              </button>
              <button
                onClick={() => (step === totalSteps - 1 ? submit(false) : setStep(step + 1))}
                disabled={!canGoNext() || loading}
                className="flex-1 py-3 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Icon name="Loader" size={15} className="animate-spin" />}
                {step === totalSteps - 1 ? "Отправить анкету" : "Дальше"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
