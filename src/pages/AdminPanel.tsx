import { useState } from "react";
import Icon from "@/components/ui/icon";

type AdminTab = "templates" | "phrases" | "users";

type Template = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  specialty: string;
  active: boolean;
};

type Phrase = {
  id: number;
  text: string;
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

const initialPhrases: Phrase[] = [
  { id: 1, text: "Сегодня лучший день, чтобы сделать первый шаг.", active: true },
  { id: 2, text: "Каждый подписанный договор — это уважение к себе и клиенту.", active: true },
  { id: 3, text: "Профессионал отличается не талантом, а порядком в делах.", active: true },
  { id: 4, text: "Один правильно оформленный документ защищает лучше любых слов.", active: true },
  { id: 5, text: "Ваше время стоит дорого — цените его в договоре.", active: true },
  { id: 6, text: "Прозрачность в работе — основа доверия клиента.", active: true },
  { id: 7, text: "Сегодня хороший день, чтобы навести порядок в документах.", active: true },
  { id: 8, text: "Ваша экспертиза заслуживает официального оформления.", active: true },
  { id: 9, text: "Чёткие условия — меньше недопонимания, больше результата.", active: true },
  { id: 10, text: "Каждый новый клиент — новая возможность сделать всё правильно.", active: true },
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

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [passError, setPassError] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("templates");
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [phrases, setPhrases] = useState<Phrase[]>(initialPhrases);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showNewPhrase, setShowNewPhrase] = useState(false);

  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({ icon: "FileText", specialty: "all", active: true });
  const [newPhrase, setNewPhrase] = useState("");

  const handleAdminLogin = () => {
    if (adminPass === "admin2024") {
      setIsAuthed(true);
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

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

  const deletePhrase = (id: number) => setPhrases(phrases.filter(p => p.id !== id));
  const togglePhrase = (id: number) => setPhrases(phrases.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const savePhrase = () => {
    if (!newPhrase.trim()) return;
    setPhrases([...phrases, { id: Date.now(), text: newPhrase.trim(), active: true }]);
    setNewPhrase("");
    setShowNewPhrase(false);
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5"
        style={{ background: "linear-gradient(160deg, hsl(20 15% 10%) 0%, hsl(22 20% 14%) 100%)" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient shadow-lg mb-4">
              <Icon name="Lock" size={24} className="text-white" />
            </div>
            <h1 className="font-cormorant text-3xl font-semibold text-white mb-1">Кабинет администратора</h1>
            <p className="text-white/40 text-sm">Только для владельца платформы</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Введите пароль"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              className={`w-full px-4 py-3 rounded-xl border bg-white/5 text-white text-sm outline-none transition-colors placeholder:text-white/30 ${passError ? "border-red-500" : "border-white/10 focus:border-amber-500/60"}`}
            />
            {passError && <p className="text-red-400 text-xs text-center">Неверный пароль</p>}
            <button
              onClick={handleAdminLogin}
              className="w-full py-3 rounded-xl gold-gradient text-white font-medium text-sm"
            >
              Войти
            </button>
            <a href="/" className="block text-center text-xs text-white/30 pt-1">← Вернуться в приложение</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}>
      {/* Header */}
      <header className="px-5 pt-10 pb-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Платформа ЧПэ</p>
            <h1 className="font-cormorant text-2xl font-semibold">Кабинет администратора</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border bg-white/50">
              ← В приложение
            </a>
            <button
              onClick={() => setIsAuthed(false)}
              className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center"
            >
              <Icon name="LogOut" size={15} className="text-amber-700" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          {([
            { id: "templates", icon: "LayoutTemplate", label: "Шаблоны" },
            { id: "phrases", icon: "Sparkles", label: "Фразы дня" },
            { id: "users", icon: "Users", label: "Пользователи" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "gold-gradient text-white shadow-sm" : "bg-white/60 border border-border text-foreground"}`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 pb-16 max-w-3xl mx-auto space-y-4">

        {/* ===== ШАБЛОНЫ ===== */}
        {activeTab === "templates" && (
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

            {/* Форма добавления */}
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

            {/* Список шаблонов */}
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
        )}

        {/* ===== ФРАЗЫ ДНЯ ===== */}
        {activeTab === "phrases" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{phrases.length} фраз · {phrases.filter(p => p.active).length} активных</p>
              <button onClick={() => setShowNewPhrase(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm">
                <Icon name="Plus" size={14} />
                Добавить
              </button>
            </div>

            {showNewPhrase && (
              <div className="card-warm rounded-2xl p-4 border-2 border-primary/20 space-y-3">
                <p className="font-cormorant text-lg font-semibold">Новая фраза</p>
                <textarea
                  placeholder="Введите мотивирующую фразу..."
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={savePhrase} className="flex-1 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium">Сохранить</button>
                  <button onClick={() => setShowNewPhrase(false)} className="px-4 py-2.5 rounded-xl border border-border bg-white/60 text-sm">Отмена</button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {phrases.map((p, i) => (
                <div key={p.id} className={`card-warm rounded-2xl p-4 transition-opacity ${!p.active ? "opacity-50" : ""}`}>
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-lg bg-amber-700/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-amber-700">{i + 1}</span>
                    </div>
                    {editingPhrase?.id === p.id ? (
                      <div className="flex-1 space-y-2">
                        <textarea value={editingPhrase.text} rows={2}
                          onChange={(e) => setEditingPhrase({ ...editingPhrase, text: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => { setPhrases(phrases.map(ph => ph.id === editingPhrase.id ? editingPhrase : ph)); setEditingPhrase(null); }}
                            className="px-3 py-1 rounded-lg gold-gradient text-white text-xs">Сохранить</button>
                          <button onClick={() => setEditingPhrase(null)} className="px-3 py-1 rounded-lg border border-border text-xs">Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <p className="flex-1 text-sm font-cormorant font-medium italic leading-snug">«{p.text}»</p>
                    )}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => togglePhrase(p.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        <Icon name={p.active ? "Eye" : "EyeOff"} size={12} />
                      </button>
                      <button onClick={() => setEditingPhrase(p)}
                        className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                        <Icon name="Pencil" size={12} />
                      </button>
                      <button onClick={() => deletePhrase(p.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ПОЛЬЗОВАТЕЛИ (заглушка) ===== */}
        {activeTab === "users" && (
          <div className="card-dark rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="BarChart3" size={24} className="text-amber-400" />
            </div>
            <h3 className="font-cormorant text-xl font-semibold text-white mb-2">Аналитика пользователей</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Таблица с данными пользователей, их активностью,<br />документами и датами оплат — в следующем шаге
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
