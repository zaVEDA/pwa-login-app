import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const specialties = [
  { icon: "Brain", label: "Психолог" },
  { icon: "Star", label: "Астролог" },
  { icon: "Hash", label: "Нумеролог" },
  { icon: "Target", label: "Коуч" },
  { icon: "BookOpen", label: "Репетитор" },
  { icon: "Baby", label: "Няня" },
  { icon: "Camera", label: "Фотограф" },
];

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

const motivationalPhrases = [
  "Сегодня лучший день, чтобы сделать первый шаг.",
  "Каждый подписанный договор — это уважение к себе и клиенту.",
  "Профессионал отличается не талантом, а порядком в делах.",
  "Один правильно оформленный документ защищает лучше любых слов.",
  "Ваше время стоит дорого — цените его в договоре.",
  "Прозрачность в работе — основа доверия клиента.",
  "Сегодня хороший день, чтобы навести порядок в документах.",
  "Ваша экспертиза заслуживает официального оформления.",
  "Чёткие условия — меньше недопонимания, больше результата.",
  "Каждый новый клиент — новая возможность сделать всё правильно.",
];

export default function Index() {
  const todayPhrase = motivationalPhrases[new Date().getDate() % motivationalPhrases.length];
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginStep, setLoginStep] = useState<"phone" | "code" | "status">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [inn, setInn] = useState("");
  const [fullName, setFullName] = useState("Анна Смирнова");
  const [innSaved, setInnSaved] = useState(false);
  const [isSelfEmployed, setIsSelfEmployed] = useState<boolean | null>(null);
  const [userStatus, setUserStatus] = useState<"self_employed" | "ip" | "ooo" | "individual" | null>(null);

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-start pt-8 px-5 overflow-y-auto"
        style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 50%, hsl(30 25% 87%) 100%)" }}
      >
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 gold-gradient shadow-lg shadow-amber-900/20">
              <span className="font-cormorant text-3xl font-bold text-white">ЧП</span>
            </div>
            <h1 className="font-cormorant text-4xl font-semibold text-foreground mb-2">ЧПэ</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Платформа для помогающих<br />специалистов
            </p>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {specialties.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSpecialty(s.label === selectedSpecialty ? null : s.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  selectedSpecialty === s.label
                    ? "gold-gradient text-white border-transparent shadow-sm"
                    : "bg-white/60 border-border text-foreground hover:border-primary/40"
                }`}
              >
                <Icon name={s.icon} size={12} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Login form */}
          <div className="card-warm rounded-2xl p-6 shadow-lg shadow-amber-900/10">
            <h2 className="font-cormorant text-2xl font-semibold mb-1">
              {loginStep === "phone" ? "Войти в аккаунт" : loginStep === "code" ? "Введите код" : "Ваш статус"}
            </h2>
            <p className="text-muted-foreground text-sm mb-5">
              {loginStep === "phone" ? "Введите номер телефона — вход через ПЭП" : loginStep === "code" ? `Код отправлен на +7 ${phone}` : "Выберите, как вы работаете"}
            </p>

            {loginStep === "status" ? (
              <div className="space-y-2.5">
                {([
                  { id: "self_employed", icon: "Leaf", title: "Самозанятый", desc: "Зарегистрирован в «Мой налог», плачу НПД 4–6%" },
                  { id: "ip", icon: "Briefcase", title: "ИП", desc: "Индивидуальный предприниматель, УСН или патент" },
                  { id: "ooo", icon: "Building2", title: "Сотрудник / руководитель ООО", desc: "Работаю в компании или возглавляю её" },
                  { id: "individual", icon: "User", title: "Физическое лицо", desc: "Работаю без регистрации, хочу разобраться" },
                  { id: null, icon: "HelpCircle", title: "Ещё не определился", desc: "Помогу разобраться, какой статус подходит" },
                ] as const).map((s) => {
                  const active = userStatus === s.id;
                  return (
                    <button
                      key={String(s.id)}
                      onClick={() => { setUserStatus(s.id as "self_employed" | "ip" | "ooo" | "individual" | null); setIsSelfEmployed(s.id === "self_employed"); setIsLoggedIn(true); }}
                      className={`w-full p-3.5 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${active ? "border-primary gold-gradient" : "border-border bg-white/60 hover:border-primary/30"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-white/20" : "bg-amber-700/10"}`}>
                          <Icon name={s.icon} size={16} className={active ? "text-white" : "text-amber-700"} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${active ? "text-white" : "text-foreground"}`}>{s.title}</p>
                          <p className={`text-xs mt-0.5 leading-tight ${active ? "text-white/70" : "text-muted-foreground"}`}>{s.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : loginStep === "phone" ? (
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+7</span>
                  <input
                    type="tel"
                    placeholder="900 000-00-00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                  />
                </div>
                <button
                  onClick={() => phone.length >= 10 && setLoginStep("code")}
                  className="w-full py-3 rounded-xl gold-gradient text-white font-medium text-sm shadow-sm shadow-amber-900/20 active:scale-[0.98] transition-transform"
                >
                  Получить код
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-semibold transition-colors ${
                        code.length === i
                          ? "border-primary bg-white"
                          : code.length > i
                          ? "border-primary/60 bg-white/80"
                          : "border-border bg-white/50"
                      }`}
                    >
                      {code[i] || ""}
                    </div>
                  ))}
                </div>
                <input
                  type="number"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 4);
                    setCode(val);
                    if (val.length === 4) setTimeout(() => setIsLoggedIn(true), 300);
                  }}
                  className="opacity-0 absolute pointer-events-none"
                  autoFocus
                />
                <button
                  onClick={() => setLoginStep("status")}
                  className="w-full py-3 rounded-xl gold-gradient text-white font-medium text-sm"
                >
                  Войти
                </button>
                <button onClick={() => setLoginStep("phone")} className="w-full py-2 text-xs text-muted-foreground">
                  Изменить номер
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
            Регистрируясь, вы соглашаетесь с{" "}
            <span className="text-primary cursor-pointer">условиями использования</span>{" "}
            и <span className="text-primary cursor-pointer">политикой конфиденциальности</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}
    >
      {/* Header */}
      <header className="px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Добро пожаловать</p>
            <h1 className="font-cormorant text-2xl font-semibold text-foreground">Анна Смирнова</h1>
          </div>
          <button className="relative">
            <div className="w-10 h-10 rounded-2xl gold-gradient flex items-center justify-center shadow-sm">
              <span className="font-cormorant text-lg font-bold text-white">АС</span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-28 space-y-6">

        {activeTab === "home" && (
          <div className="space-y-6 animate-slide-up">
            {/* Мотивирующая фраза дня */}
            <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5"
                style={{ background: "radial-gradient(circle, hsl(43 72% 58%), transparent)", transform: "translate(30%, -30%)" }} />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="Sparkles" size={14} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-[10px] text-amber-700 font-medium uppercase tracking-wider mb-1.5">Мысль дня</p>
                  <p className="font-cormorant text-lg font-medium text-foreground leading-snug italic">«{todayPhrase}»</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="font-cormorant text-xl font-semibold mb-3">Быстрые действия</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("docs")}
                  className="card-dark rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-600/15 flex items-center justify-center mb-3">
                    <Icon name="FilePlus" size={18} className="text-amber-700" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Создать документ</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Договор, акт, счёт</p>
                </button>
                <button
                  onClick={() => setActiveTab("templates")}
                  className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center mb-3">
                    <Icon name="LayoutTemplate" size={18} className="text-amber-700" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Шаблоны</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Под вашу деятельность</p>
                </button>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center mb-3">
                    <Icon name="GraduationCap" size={18} className="text-amber-700" />
                  </div>
                  <p className="text-sm font-medium text-foreground">База знаний</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Законы и инструкции</p>
                </button>
                <button className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border">
                  <div className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center mb-3">
                    <Icon name="BarChart3" size={18} className="text-amber-700" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Учёт доходов</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Доходы и налоги</p>
                </button>
              </div>
            </div>

            {/* Recent docs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-cormorant text-xl font-semibold">Последние документы</h2>
                <button onClick={() => setActiveTab("docs")} className="text-xs text-primary">Все →</button>
              </div>
              <div className="space-y-2.5">
                {recentDocs.map((doc) => (
                  <div key={doc.title} className="card-warm rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-amber-700/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={16} className="text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.client} · {doc.date}</p>
                    </div>
                    <span className={`doc-tag flex-shrink-0 ${
                      doc.status === "signed" ? "bg-green-100 text-green-700" :
                      doc.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {doc.statusLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax reminder */}
            <div
              className="rounded-2xl p-4 border border-amber-300/40"
              style={{ background: "linear-gradient(135deg, hsl(43 72% 58% / 0.12), hsl(38 65% 42% / 0.08))" }}
            >
              <div className="flex gap-3 items-start mb-3">
                <Icon name="Bell" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Налог за май</p>
                  <p className="text-xs text-muted-foreground mt-0.5">До 25 июня нужно оплатить ₽1 872 в приложении «Мой налог»</p>
                </div>
              </div>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.open("https://lknpd.nalog.ru/", "_blank"); }}
                className="w-full py-2 rounded-xl bg-amber-700/15 text-amber-800 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              >
                <Icon name="ExternalLink" size={12} />
                Открыть «Мой налог»
              </a>
            </div>
          </div>
        )}

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
            <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, hsl(43 72% 58%), transparent)", transform: "translate(30%, -30%)" }}
              />
              <span className="doc-tag bg-amber-500/15 text-amber-700 text-[10px] mb-3 inline-block">Рекомендуем</span>
              <h3 className="font-cormorant text-xl font-semibold text-foreground mb-2">Старт самозанятого</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Полный гайд: регистрация, первый клиент, первый документ, первый налог
              </p>
              <button className="flex items-center gap-2 text-amber-700 text-sm font-medium">
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

            <p className="text-center text-xs text-muted-foreground pb-2">ЧПэ · версия 1.0.0</p>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-5 z-50">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-900/15 border border-white/60 px-2 py-1.5 flex items-center justify-around">
          {(
            [
              { id: "home", icon: "Home", label: "Главная" },
              { id: "docs", icon: "FileText", label: "Документы" },
              { id: "templates", icon: "LayoutTemplate", label: "Шаблоны" },
              { id: "knowledge", icon: "BookOpen", label: "Знания" },
              { id: "account", icon: "User", label: "Профиль" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-pill ${activeTab === tab.id ? "active" : ""}`}
            >
              <Icon name={tab.icon} size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}