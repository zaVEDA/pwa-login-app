import Icon from "@/components/ui/icon";
import { templates, knowledgeArticles, specialties, Tab } from "./constants";

interface Props {
  activeTab: Tab;
}

export default function TemplatesTab({ activeTab }: Props) {
  return (
    <>
      {activeTab === "templates" && (
        <div className="space-y-5 animate-slide-up">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">Шаблоны документов</h2>
            <p className="text-xs text-muted-foreground">Выберите под вашу деятельность</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
            {specialties.map((s) => (
              <button
                key={s.label}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 border shadow-sm"
                style={{ borderColor: "hsl(36 28% 82%)" }}
              >
                <span className="text-base">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {templates.map((t) => (
              <button
                key={t.title}
                className="card-warm rounded-2xl p-4 flex gap-3 items-center text-left shadow-sm active:scale-[0.98] transition-transform"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10"
                >
                  <Icon name={t.icon} size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="doc-tag bg-primary/15 text-primary text-[10px]">{t.tag}</span>
                  <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-5 animate-slide-up">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">База знаний</h2>
            <p className="text-xs text-muted-foreground">Законодательство и практика для самозанятых</p>
          </div>

          {/* Featured */}
          <div className="card-warm rounded-2xl p-5 shadow-sm">
            <span className="doc-tag bg-primary/15 text-primary text-[10px] mb-3 inline-block">Рекомендуем</span>
            <h3 className="font-cormorant text-xl font-semibold text-foreground mb-2">Старт самозанятого</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Полный гайд: регистрация, первый клиент, первый документ, первый налог
            </p>
            <button className="flex items-center gap-2 text-sm font-medium text-primary">
              Читать гайд <Icon name="ArrowRight" size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {knowledgeArticles.map((a) => (
              <button
                key={a.title}
                className="card-warm rounded-2xl p-4 flex gap-3 items-start w-full text-left shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={a.icon} size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                  <p className="text-xs text-primary mt-1.5">{a.time} чтения</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
