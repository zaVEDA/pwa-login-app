import Icon from "@/components/ui/icon";

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const recentDocs = [
  { title: "Договор об оказании услуг", client: "Анна М.", date: "09 июн", status: "signed", statusLabel: "Подписан" },
  { title: "Акт выполненных работ", client: "Игорь С.", date: "07 июн", status: "pending", statusLabel: "Ожидает" },
  { title: "Счёт на оплату", client: "Мария В.", date: "05 июн", status: "draft", statusLabel: "Черновик" },
];

const templates = [
  { icon: "FileText", title: "Договор услуг", desc: "Базовый договор с клиентом", tag: "Универсальный" },
  { icon: "Receipt", title: "Акт выполненных работ", desc: "Закрывающий документ", tag: "Универсальный" },
  { icon: "CreditCard", title: "Счёт на оплату", desc: "Выставить счёт клиенту", tag: "Финансы" },
  { icon: "Shield", title: "Соглашение о конфиденциальности", desc: "NDA для сессий", tag: "Психолог" },
  { icon: "Calendar", title: "Абонемент на занятия", desc: "Пакет сессий или уроков", tag: "Репетитор" },
  { icon: "Image", title: "Договор фотосъёмки", desc: "Права на фото и сроки", tag: "Фотограф" },
];

const knowledgeArticles = [
  { icon: "BookOpen", title: "Как оформить самозанятость", desc: "Пошаговая инструкция регистрации через приложение «Мой налог»", time: "5 мин" },
  { icon: "Receipt", title: "Налоговый чек для клиента", desc: "Когда и как выдавать, чтобы не получить штраф", time: "3 мин" },
  { icon: "TrendingUp", title: "Лимит дохода самозанятого", desc: "2,4 млн в год — что делать, если приближаетесь к лимиту", time: "4 мин" },
  { icon: "FileCheck", title: "Какие документы нужны", desc: "Договор, акт, счёт — обязательно ли всё это?", time: "6 мин" },
  { icon: "Users", title: "Можно ли работать с ИП", desc: "Ограничения и особенности сотрудничества", time: "4 мин" },
  { icon: "AlertCircle", title: "Частые ошибки", desc: "Топ-5 ошибок самозанятых при работе с документами", time: "7 мин" },
];

const specialties = [
  { icon: "Brain", label: "Психолог" },
  { icon: "Star", label: "Астролог" },
  { icon: "Hash", label: "Нумеролог" },
  { icon: "Target", label: "Коуч" },
  { icon: "BookOpen", label: "Репетитор" },
  { icon: "Baby", label: "Няня" },
  { icon: "Camera", label: "Фотограф" },
];

const themes = {
  honey: { label: "Янтарь", phraseIcon: "Leaf" },
  sage:  { label: "Шалфей", phraseIcon: "Sprout" },
  rose:  { label: "Роза",   phraseIcon: "Flower2" },
  clay:  { label: "Глина",  phraseIcon: "TreePine" },
} as const;

interface Props {
  activeTab: Tab;
  isSelfEmployed: boolean | null;
  inn: string;
  setInn: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  innSaved: boolean;
  setInnSaved: (v: boolean) => void;
  setIsLoggedIn: (v: boolean) => void;
  colorTheme: keyof typeof themes;
  setColorTheme: (t: keyof typeof themes) => void;
}

export default function TabContent({
  activeTab,
  isSelfEmployed,
  inn,
  setInn,
  fullName,
  setFullName,
  innSaved,
  setInnSaved,
  setIsLoggedIn,
  colorTheme,
  setColorTheme,
}: Props) {
  return (
    <>
      {activeTab === "docs" && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-semibold">Мои документы</h2>
            <button className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-sm">
              <Icon name="Plus" size={16} className="text-white" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
            {["Все", "Договоры", "Акты", "Счета", "Черновики"].map((f, i) => (
              <button
                key={f}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  i === 0
                    ? "gold-gradient text-white border-transparent"
                    : "bg-white/60 border-border text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {[
              ...recentDocs,
              { title: "Договор на фотосессию", client: "Дмитрий К.", date: "01 июн", status: "signed", statusLabel: "Подписан" },
              { title: "Счёт на консультацию", client: "Елена Ф.", date: "28 май", status: "pending", statusLabel: "Ожидает" },
            ].map((doc, i) => (
              <div
                key={i}
                className="card-warm rounded-2xl p-4 shadow-sm flex gap-3 items-center active:scale-[0.98] transition-transform"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(38 65% 42% / 0.15), hsl(30 45% 35% / 0.1))" }}
                >
                  <Icon name="FileText" size={20} className="text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.client} · {doc.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`doc-tag ${
                    doc.status === "signed" ? "bg-green-100 text-green-700" :
                    doc.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {doc.statusLabel}
                  </span>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/60 border border-border"
              >
                <Icon name={s.icon} size={11} />
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
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(38 65% 42% / 0.15), hsl(30 45% 35% / 0.1))" }}
                >
                  <Icon name={t.icon} size={20} className="text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="doc-tag bg-amber-100/80 text-amber-700 text-[10px]">{t.tag}</span>
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
            <span className="doc-tag bg-amber-100/80 text-amber-700 text-[10px] mb-3 inline-block">Рекомендуем</span>
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
                <div className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={a.icon} size={16} className="text-amber-700" />
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

      {activeTab === "account" && (
        <div className="space-y-5 animate-slide-up">
          {/* Profile card */}
          <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 shimmer" />
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                <span className="font-cormorant text-2xl font-bold text-white">АС</span>
              </div>
              <div>
                <h3 className="font-cormorant text-xl font-semibold text-foreground">Анна Смирнова</h3>
                <p className="text-sm text-muted-foreground">+7 (916) 000-00-00</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name="Briefcase" size={11} className="text-amber-700" />
                  <span className="text-xs text-amber-700">Психолог · Самозанятая</span>
                </div>
              </div>
            </div>
          </div>

          {/* Цветовая тема */}
          <div className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Palette" size={15} className="text-amber-700" />
              <p className="text-sm font-medium">Оформление</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(themes) as [keyof typeof themes, typeof themes[keyof typeof themes]][]).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    colorTheme === key
                      ? "gold-gradient text-white border-transparent shadow-sm"
                      : "bg-white/60 border-border text-muted-foreground"
                  }`}
                >
                  <Icon name={t.phraseIcon} size={11} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ИНН блок — только для самозанятых */}
          {isSelfEmployed && <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Hash" size={15} className="text-amber-700" />
              <p className="text-sm font-medium">Данные самозанятого</p>
              {innSaved && <span className="ml-auto doc-tag bg-green-100 text-green-700 text-[10px]">Сохранено</span>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ФИО</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setInnSaved(false); }}
                placeholder="Иванова Анна Сергеевна"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ИНН</label>
              <input
                type="number"
                value={inn}
                onChange={(e) => { setInn(e.target.value.slice(0, 12)); setInnSaved(false); }}
                placeholder="123456789012"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={() => inn.length === 12 && setInnSaved(true)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${inn.length === 12 ? "gold-gradient text-white shadow-sm" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            >
              Сохранить данные
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ИНН и ФИО будут автоматически подставляться во все документы
            </p>
          </div>}

          {/* Мой налог — только для самозанятых */}
          {isSelfEmployed && <div
            className="rounded-2xl p-4 border border-amber-300/40"
            style={{ background: "linear-gradient(135deg, hsl(43 72% 58% / 0.12), hsl(38 65% 42% / 0.08))" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/15 flex items-center justify-center flex-shrink-0">
                <Icon name="Receipt" size={16} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Выбить чек самозанятого</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Откроет официальное приложение ФНС «Мой налог» для выдачи чека клиенту
                </p>
              </div>
            </div>
            <a
              href="mynalog://register"
              onClick={(e) => { e.preventDefault(); window.open("https://lknpd.nalog.ru/", "_blank"); }}
              className="mt-3 w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Icon name="ExternalLink" size={14} />
              Открыть «Мой налог»
            </a>
          </div>}

          {/* Settings list */}
          <div className="space-y-2">
            {[
              { icon: "User", label: "Профиль и деятельность", danger: false },
              { icon: "FileSignature", label: "Настройки подписи (ПЭП)", danger: false },
              { icon: "Bell", label: "Уведомления", danger: false },
              { icon: "BarChart3", label: "Учёт и налоги", danger: false },
              { icon: "HelpCircle", label: "Справка и поддержка", danger: false },
              { icon: "LogOut", label: "Выйти", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.label === "Выйти" ? () => setIsLoggedIn(false) : undefined}
                className={`w-full card-warm rounded-xl p-3.5 flex items-center gap-3 text-left shadow-sm active:scale-[0.98] transition-transform ${item.danger ? "border border-red-200/50" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.danger ? "bg-red-50" : "bg-amber-700/10"}`}>
                  <Icon name={item.icon} size={15} className={item.danger ? "text-red-500" : "text-amber-700"} />
                </div>
                <span className={`flex-1 text-sm ${item.danger ? "text-red-500" : "text-foreground"}`}>{item.label}</span>
                {!item.danger && <Icon name="ChevronRight" size={15} className="text-muted-foreground" />}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground pb-2">ЗаВедующая · версия 1.0.0</p>
        </div>
      )}
    </>
  );
}