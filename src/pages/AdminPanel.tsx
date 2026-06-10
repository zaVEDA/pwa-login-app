import { useState } from "react";
import Icon from "@/components/ui/icon";

type AdminTab = "templates" | "phrases" | "users";

type User = {
  id: number;
  name: string;
  phone: string;
  status: "self_employed" | "ip" | "ooo" | "individual" | null;
  specialty: string;
  registeredAt: string;
  lastLoginAt: string;
  loginCount: number;
  paidAt: string | null;
  paymentAmount: number | null;
  docsTotal: number;
  docsSigned: number;
  tabVisits: { home: number; docs: number; templates: number; knowledge: number; account: number };
  avgSessionMin: number;
  dropTab: string | null;
};

const mockUsers: User[] = [
  { id: 1, name: "Анна Смирнова", phone: "+7 916 000-00-01", status: "self_employed", specialty: "Психолог", registeredAt: "01.05.2024", lastLoginAt: "10.06.2024", loginCount: 34, paidAt: "05.05.2024", paymentAmount: 990, docsTotal: 12, docsSigned: 9, tabVisits: { home: 34, docs: 28, templates: 15, knowledge: 8, account: 5 }, avgSessionMin: 7, dropTab: null },
  { id: 2, name: "Игорь Петров", phone: "+7 903 111-22-33", status: "ip", specialty: "Коуч", registeredAt: "12.05.2024", lastLoginAt: "09.06.2024", loginCount: 18, paidAt: "15.05.2024", paymentAmount: 990, docsTotal: 7, docsSigned: 5, tabVisits: { home: 18, docs: 14, templates: 9, knowledge: 12, account: 3 }, avgSessionMin: 5, dropTab: null },
  { id: 3, name: "Мария Волкова", phone: "+7 926 222-33-44", status: "self_employed", specialty: "Астролог", registeredAt: "20.05.2024", lastLoginAt: "08.06.2024", loginCount: 9, paidAt: null, paymentAmount: null, docsTotal: 3, docsSigned: 1, tabVisits: { home: 9, docs: 4, templates: 7, knowledge: 3, account: 1 }, avgSessionMin: 3, dropTab: "templates" },
  { id: 4, name: "Дмитрий Козлов", phone: "+7 999 333-44-55", status: "ooo", specialty: "Фотограф", registeredAt: "25.05.2024", lastLoginAt: "07.06.2024", loginCount: 22, paidAt: "28.05.2024", paymentAmount: 1990, docsTotal: 15, docsSigned: 13, tabVisits: { home: 22, docs: 20, templates: 11, knowledge: 4, account: 7 }, avgSessionMin: 9, dropTab: null },
  { id: 5, name: "Елена Фролова", phone: "+7 912 444-55-66", status: "individual", specialty: "Няня", registeredAt: "01.06.2024", lastLoginAt: "06.06.2024", loginCount: 4, paidAt: null, paymentAmount: null, docsTotal: 1, docsSigned: 0, tabVisits: { home: 4, docs: 1, templates: 3, knowledge: 4, account: 0 }, avgSessionMin: 2, dropTab: "knowledge" },
  { id: 6, name: "Сергей Лебедев", phone: "+7 985 555-66-77", status: "self_employed", specialty: "Репетитор", registeredAt: "03.06.2024", lastLoginAt: "10.06.2024", loginCount: 11, paidAt: "05.06.2024", paymentAmount: 990, docsTotal: 6, docsSigned: 4, tabVisits: { home: 11, docs: 9, templates: 6, knowledge: 5, account: 2 }, avgSessionMin: 6, dropTab: null },
];

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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");
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

        {/* ===== ПОЛЬЗОВАТЕЛИ ===== */}
        {activeTab === "users" && !selectedUser && (
          <div className="space-y-4">

            {/* Сводная аналитика */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Всего пользователей", value: mockUsers.length, icon: "Users", color: "text-amber-700" },
                { label: "Платящих", value: mockUsers.filter(u => u.paidAt).length, icon: "CreditCard", color: "text-green-600" },
                { label: "Документов создано", value: mockUsers.reduce((a, u) => a + u.docsTotal, 0), icon: "FileText", color: "text-amber-700" },
                { label: "Подписано клиентами", value: mockUsers.reduce((a, u) => a + u.docsSigned, 0), icon: "FileCheck", color: "text-green-600" },
                { label: "Конверсия в оплату", value: `${Math.round(mockUsers.filter(u => u.paidAt).length / mockUsers.length * 100)}%`, icon: "TrendingUp", color: "text-amber-700" },
                { label: "Ср. сессия (мин)", value: `${Math.round(mockUsers.reduce((a, u) => a + u.avgSessionMin, 0) / mockUsers.length)}`, icon: "Clock", color: "text-amber-700" },
              ].map((s) => (
                <div key={s.label} className="card-warm rounded-2xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={s.icon} size={13} className={s.color} />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                  <p className={`font-cormorant text-2xl font-semibold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Поиск */}
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск по имени или телефону..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Таблица */}
            <div className="space-y-2.5">
              {mockUsers
                .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch))
                .map((u) => {
                  const statusLabels: Record<string, string> = { self_employed: "Самозанятый", ip: "ИП", ooo: "ООО", individual: "Физлицо" };
                  const statusColors: Record<string, string> = { self_employed: "bg-green-100 text-green-700", ip: "bg-blue-100 text-blue-700", ooo: "bg-purple-100 text-purple-700", individual: "bg-gray-100 text-gray-600" };
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full card-warm rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                          <span className="font-cormorant font-bold text-white text-sm">
                            {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.phone} · {u.specialty}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {u.status && <span className={`doc-tag text-[10px] ${statusColors[u.status]}`}>{statusLabels[u.status]}</span>}
                          {u.paidAt
                            ? <span className="doc-tag bg-green-100 text-green-700 text-[10px]">Оплатил</span>
                            : <span className="doc-tag bg-gray-100 text-gray-500 text-[10px]">Не платил</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "Входов", value: u.loginCount },
                          { label: "Документов", value: u.docsTotal },
                          { label: "Подписано", value: u.docsSigned },
                          { label: "Мин/сессия", value: u.avgSessionMin },
                        ].map((m) => (
                          <div key={m.label} className="bg-white/50 rounded-lg p-2 text-center">
                            <p className="font-semibold text-sm text-foreground">{m.value}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">{m.label}</p>
                          </div>
                        ))}
                      </div>
                      {u.dropTab && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                          <Icon name="AlertTriangle" size={12} />
                          Возможная точка потери — вкладка «{u.dropTab === "templates" ? "Шаблоны" : u.dropTab === "knowledge" ? "База знаний" : u.dropTab}»
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* ===== КАРТОЧКА ПОЛЬЗОВАТЕЛЯ ===== */}
        {activeTab === "users" && selectedUser && (
          <div className="space-y-4 animate-slide-up">
            <button onClick={() => setSelectedUser(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="ArrowLeft" size={14} /> Назад к списку
            </button>

            {/* Шапка */}
            <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
                style={{ background: "radial-gradient(circle, hsl(43 72% 58%), transparent)", transform: "translate(30%,-30%)" }} />
              <div className="flex gap-4 items-center mb-4">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                  <span className="font-cormorant text-xl font-bold text-white">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-semibold text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-white/50">{selectedUser.phone}</p>
                  <p className="text-xs text-amber-400 mt-0.5">{selectedUser.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Регистрация", value: selectedUser.registeredAt },
                  { label: "Последний вход", value: selectedUser.lastLoginAt },
                  { label: "Оплата", value: selectedUser.paidAt ?? "Нет" },
                  { label: "Сумма", value: selectedUser.paymentAmount ? `₽${selectedUser.paymentAmount}` : "—" },
                ].map((i) => (
                  <div key={i.label} className="bg-white/5 rounded-xl p-2.5">
                    <p className="text-[10px] text-white/40 mb-0.5">{i.label}</p>
                    <p className="text-sm font-medium text-white">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Активность по вкладкам */}
            <div className="card-warm rounded-2xl p-4 shadow-sm">
              <p className="font-cormorant text-lg font-semibold mb-3">Активность по разделам</p>
              <div className="space-y-2.5">
                {(Object.entries(selectedUser.tabVisits) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([tab, visits]) => {
                    const tabNames: Record<string, string> = { home: "Главная", docs: "Документы", templates: "Шаблоны", knowledge: "База знаний", account: "Профиль" };
                    const max = Math.max(...Object.values(selectedUser.tabVisits));
                    const pct = Math.round(visits / max * 100);
                    return (
                      <div key={tab}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground font-medium">{tabNames[tab]}</span>
                          <span className="text-muted-foreground">{visits} визитов</span>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                          <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
                <span className="text-muted-foreground">Средняя сессия</span>
                <span className="font-medium">{selectedUser.avgSessionMin} мин</span>
              </div>
              {selectedUser.dropTab && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                  <Icon name="AlertTriangle" size={13} />
                  Возможная точка потери — «{selectedUser.dropTab === "templates" ? "Шаблоны" : selectedUser.dropTab === "knowledge" ? "База знаний" : selectedUser.dropTab}»
                </div>
              )}
            </div>

            {/* Документы */}
            <div className="card-warm rounded-2xl p-4 shadow-sm">
              <p className="font-cormorant text-lg font-semibold mb-3">Документы</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Создано", value: selectedUser.docsTotal, color: "text-amber-700" },
                  { label: "Подписано через ПЭП", value: selectedUser.docsSigned, color: "text-green-600" },
                  { label: "Конверсия", value: selectedUser.docsTotal ? `${Math.round(selectedUser.docsSigned / selectedUser.docsTotal * 100)}%` : "0%", color: "text-amber-700" },
                ].map((d) => (
                  <div key={d.label} className="bg-white/50 rounded-xl p-3 text-center">
                    <p className={`font-cormorant text-2xl font-semibold ${d.color}`}>{d.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}