import { useState } from "react";
import Icon from "@/components/ui/icon";

type Template = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  specialty: string;
  active: boolean;
};

const initialTemplates: Template[] = [
  { id: 1, icon: "FileText", title: "Договор услуг", desc: "Базовый договор с клиентом", tag: "Универсальный", specialty: "all", active: true },
  { id: 2, icon: "Receipt", title: "Акт выполненных работ", desc: "Закрывающий документ", tag: "Универсальный", specialty: "all", active: true },
  { id: 3, icon: "CreditCard", title: "Счёт на оплату", desc: "Выставить счёт клиенту", tag: "Финансы", specialty: "all", active: true },
  { id: 4, icon: "Shield", title: "Соглашение о конфиденциальности", desc: "NDA для сессий", tag: "Психолог", specialty: "psychologist", active: true },
  { id: 5, icon: "Calendar", title: "Абонемент на занятия", desc: "Пакет сессий или уроков", tag: "Репетитор", specialty: "tutor", active: true },
  { id: 6, icon: "Image", title: "Договор фотосъёмки", desc: "Права на фото и сроки", tag: "Фотограф", specialty: "photographer", active: true },
];

const specialtyOptions = [
  { value: "all", label: "Универсальный" },
  { value: "psychologist", label: "Психолог" },
  { value: "astrologer", label: "Астролог" },
  { value: "numerologist", label: "Нумеролог" },
  { value: "coach", label: "Коуч" },
  { value: "tutor", label: "Репетитор" },
  { value: "nanny", label: "Няня" },
  { value: "photographer", label: "Фотограф" },
];

const iconOptions = ["FileText", "Receipt", "CreditCard", "Shield", "Calendar", "Image", "FileSignature", "Clipboard", "BookOpen", "Users", "Star", "Heart"];

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({ icon: "FileText", specialty: "all", active: true });

  const deleteTemplate = (id: number) => setTemplates(templates.filter(t => t.id !== id));
  const toggleTemplate = (id: number) => setTemplates(templates.map(t => t.id === id ? { ...t, active: !t.active } : t));
  const saveTemplate = () => {
    if (!newTemplate.title || !newTemplate.desc || !newTemplate.tag) return;
    setTemplates([...templates, { ...newTemplate, id: Date.now() } as Template]);
    setNewTemplate({ icon: "FileText", specialty: "all", active: true });
    setShowNewTemplate(false);
  };
  const saveEditTemplate = () => {
    if (!editingTemplate) return;
    setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{templates.length} шаблонов · {templates.filter(t => t.active).length} активных</p>
        <button
          onClick={() => setShowNewTemplate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm"
        >
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {showNewTemplate && (
        <div className="card-warm rounded-2xl p-4 border-2 border-primary/20 space-y-3">
          <p className="font-cormorant text-lg font-semibold">Новый шаблон</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Название *</label>
              <input type="text" placeholder="Договор услуг" value={newTemplate.title || ""}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Тег *</label>
              <input type="text" placeholder="Универсальный" value={newTemplate.tag || ""}
                onChange={(e) => setNewTemplate({ ...newTemplate, tag: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Описание *</label>
            <input type="text" placeholder="Краткое описание шаблона" value={newTemplate.desc || ""}
              onChange={(e) => setNewTemplate({ ...newTemplate, desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Специализация</label>
              <select value={newTemplate.specialty || "all"}
                onChange={(e) => setNewTemplate({ ...newTemplate, specialty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary">
                {specialtyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Иконка</label>
              <select value={newTemplate.icon || "FileText"}
                onChange={(e) => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary">
                {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveTemplate} className="flex-1 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium">Сохранить</button>
            <button onClick={() => setShowNewTemplate(false)} className="px-4 py-2.5 rounded-xl border border-border bg-white/60 text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {templates.map((t) => (
          <div key={t.id} className={`card-warm rounded-2xl p-4 flex gap-3 items-center transition-opacity ${!t.active ? "opacity-50" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-amber-700/10 flex items-center justify-center flex-shrink-0">
              <Icon name={t.icon} size={18} className="text-amber-700" />
            </div>
            {editingTemplate?.id === t.id ? (
              <div className="flex-1 space-y-2">
                <input type="text" value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary" />
                <input type="text" value={editingTemplate.desc}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, desc: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs outline-none focus:border-primary" />
                <div className="flex gap-2">
                  <button onClick={saveEditTemplate} className="px-3 py-1 rounded-lg gold-gradient text-white text-xs">Сохранить</button>
                  <button onClick={() => setEditingTemplate(null)} className="px-3 py-1 rounded-lg border border-border text-xs">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="doc-tag bg-amber-100/80 text-amber-700 text-[10px]">{t.tag}</span>
                  <span className="doc-tag bg-gray-100 text-gray-500 text-[10px]">{specialtyOptions.find(s => s.value === t.specialty)?.label}</span>
                </div>
              </div>
            )}
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => toggleTemplate(t.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${t.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                <Icon name={t.active ? "Eye" : "EyeOff"} size={14} />
              </button>
              <button onClick={() => setEditingTemplate(t)}
                className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <Icon name="Pencil" size={14} />
              </button>
              <button onClick={() => deleteTemplate(t.id)}
                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
