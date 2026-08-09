import { useState } from "react";
import Icon from "@/components/ui/icon";
import { templates, specialties, Tab } from "./constants";
import KnowledgeTab from "@/components/app/knowledge/KnowledgeTab";
import TemplateFillModal from "@/components/app/templates/TemplateFillModal";
import { templateDocs } from "@/components/app/templates/docs";

interface Props {
  activeTab: Tab;
  phone: string;
  userEmail?: string | null;
  onSaved?: () => void;
  onGoToAccount?: () => void;
}

export default function TemplatesTab({ activeTab, phone, userEmail, onSaved, onGoToAccount }: Props) {
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const [soon, setSoon] = useState<string | null>(null);
  const [specOpen, setSpecOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const handleClick = (title: string) => {
    if (templateDocs[title]) setOpenDoc(title);
    else { setSoon(title); setTimeout(() => setSoon(null), 2500); }
  };

  const visibleTemplates = selectedSpecialty
    ? templates.filter((t) => t.tag === selectedSpecialty || t.tag === "Универсальный")
    : templates;

  return (
    <>
      {openDoc && templateDocs[openDoc] && (
        <TemplateFillModal
          doc={templateDocs[openDoc]}
          phone={phone}
          userProfile={{ phone, email: userEmail }}
          onClose={() => setOpenDoc(null)}
          onSaved={onSaved}
          onGoToAccount={() => { setOpenDoc(null); onGoToAccount?.(); }}
        />
      )}

      {activeTab === "templates" && (
        <div className="space-y-5 animate-slide-up">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">Шаблоны документов</h2>
            <p className="text-xs text-muted-foreground">Под деятельности</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setSpecOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white/70 border shadow-sm"
              style={{ borderColor: "hsl(36 28% 82%)" }}
            >
              <span className="text-base">
                {selectedSpecialty ? specialties.find((s) => s.label === selectedSpecialty)?.emoji : "🗂️"}
              </span>
              <span className="flex-1 text-left truncate">{selectedSpecialty || "Специализация"}</span>
              <Icon name={specOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground flex-shrink-0" />
            </button>

            {specOpen && (
              <div
                className="absolute z-10 mt-1.5 w-full rounded-xl bg-white border shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                style={{ borderColor: "hsl(36 28% 82%)" }}
              >
                <button
                  onClick={() => { setSelectedSpecialty(null); setSpecOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left transition-colors ${!selectedSpecialty ? "bg-primary/10 text-primary font-medium" : "hover:bg-primary/5"}`}
                >
                  <span className="text-base">🗂️</span>
                  Специализация
                </button>
                {specialties.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { setSelectedSpecialty(s.label); setSpecOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left transition-colors ${selectedSpecialty === s.label ? "bg-primary/10 text-primary font-medium" : "hover:bg-primary/5"}`}
                  >
                    <span className="text-base">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {visibleTemplates.map((t) => (
              <button
                key={t.title}
                onClick={() => handleClick(t.title)}
                className="card-warm rounded-2xl p-4 flex gap-3 items-center text-left shadow-sm active:scale-[0.98] transition-transform"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10"
                >
                  <Icon name={t.icon} size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {soon === t.title ? "Этот шаблон скоро появится" : t.desc}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="doc-tag bg-primary/15 text-primary text-[10px]">{t.tag}</span>
                  <Icon name={templateDocs[t.title] ? "ArrowRight" : "Clock"} size={14} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "knowledge" && <KnowledgeTab />}
    </>
  );
}