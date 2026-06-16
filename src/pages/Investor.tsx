import Icon from "@/components/ui/icon";

const APP_URL = window.location.origin;

const problems = [
  { icon: "FileX", text: "Неудобное оформление документов в бухгалтерских программах" },
  { icon: "Smartphone", text: "Невозможность нормально заполнить документы с телефона" },
  { icon: "Clock", text: "Потери времени на ввод одних и тех же данных в разные окна" },
  { icon: "Lock", text: "Нет единой системы: формирование, подписание и контроль — в разных местах" },
  { icon: "BarChart2", text: "Сложности с выгрузкой данных для аналитики и отчётов" },
];

const features = [
  { icon: "FileText", title: "Документы", desc: "Договор, согласие на обработку персональных данных, акт — формируются за минуты" },
  { icon: "PenLine", title: "Подписание", desc: "Клиент подписывает прямо в приложении — без распечаток и сканов" },
  { icon: "CreditCard", title: "Оплата", desc: "Приём оплаты встроен в процесс — одним потоком с документами" },
  { icon: "BookOpen", title: "Обучение", desc: "Понятный язык и мини-обучалка для тех, кто впервые сталкивается с документооборотом" },
  { icon: "Database", title: "Аналитика", desc: "Выгрузка базы данных для своих отчётов и аналитики" },
  { icon: "ShieldCheck", title: "Правовая база", desc: "Документы соответствуют законодательству и готовят специалиста к любым проверкам" },
];

const audience = [
  { emoji: "🧠", label: "Психологи" },
  { emoji: "🎯", label: "Коучи" },
  { emoji: "💬", label: "Консультанты" },
  { emoji: "✨", label: "Мастера" },
];

const milestones = [
  { done: true, text: "Черновик технического задания готов" },
  { done: true, text: "Взаимодействие с юристами запущено" },
  { done: true, text: "MVP в формате PWA разрабатывается" },
  { done: true, text: "Изучены особенности налогообложения ИТ-компаний" },
  { done: false, text: "Тест с реальными пользователями и живые продажи" },
  { done: false, text: "Социальные сети: лояльность и узнаваемость" },
  { done: false, text: "Выбор формы собственности и регистрация" },
  { done: false, text: "Разработка мобильной версии на основе PWA" },
];

const investOptions = [
  {
    title: "Минимальный вход",
    amount: "от 350 000 ₽",
    color: "hsl(38 40% 94%)",
    border: "hsl(36 28% 82%)",
    items: [
      "Договор процентного займа (официально)",
      "Ставка 36% годовых, срок 12–15 мес.",
      "Досрочный возврат до 4 мес. — ставка 10%",
    ],
  },
  {
    title: "Полное финансирование",
    amount: "1 500 000 ₽",
    color: "linear-gradient(135deg, hsl(35 72% 48% / 0.08), hsl(40 80% 62% / 0.12))",
    border: "hsl(35 72% 48% / 0.35)",
    accent: true,
    items: [
      "Те же условия займа",
      "Приоритет участия во 2-м раунде",
      "Возможность получить долю в ООО от 1%",
    ],
  },
];

const spendItems = [
  { icon: "Laptop", label: "Оборудование", desc: "Ноутбук и монитор для параллельной работы" },
  { icon: "Scale", label: "Юридическое сопровождение", desc: "Документы, договоры с подрядчиками, реестр российского ПО" },
  { icon: "Bot", label: "ИИ и разработка PWA", desc: "Оплата платформы и программиста-консультанта" },
  { icon: "Palette", label: "Дизайн и фирменный стиль", desc: "Брендинг, маскот, визуальная идентика" },
  { icon: "Globe", label: "Сайт и аналитика", desc: "Сайт продукта с опросником и инструментами аналитики" },
  { icon: "Users", label: "Команда и исследования", desc: "Ассистенты для опросов и тестирования с пользователями" },
];

export default function Investor() {
  return (
    <div className="min-h-screen font-golos" style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(35 72% 48%), transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(140 30% 55%), transparent)" }} />
        </div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 tracking-wider uppercase"
            style={{ background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 72% 38%)" }}>
            Инвестиционное предложение · Раунд 1
          </span>
          <h1 className="font-cormorant text-5xl md:text-6xl font-semibold leading-tight mb-5"
            style={{ color: "hsl(24 20% 13%)" }}>
            Сервис документооборота<br />
            <span style={{ color: "hsl(35 72% 48%)" }}>для помогающих специалистов</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Психологи, консультанты и коучи теряют время и деньги на бумажную работу. 
            Мы решаем это одним приложением.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 42%))", color: "white" }}
            >
              <Icon name="Smartphone" size={16} />
              Смотреть приложение
            </a>
            <a href="#invest"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm border transition-all hover:bg-white/60"
              style={{ borderColor: "hsl(36 28% 82%)", color: "hsl(24 20% 13%)" }}>
              <Icon name="TrendingUp" size={16} />
              Условия инвестирования
            </a>
          </div>
        </div>
      </section>

      {/* Аудитория */}
      <section className="px-5 py-10 max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4">
          {audience.map((a) => (
            <div key={a.label} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 border shadow-sm text-sm font-medium"
              style={{ borderColor: "hsl(36 28% 82%)" }}>
              <span className="text-xl">{a.emoji}</span>
              {a.label}
            </div>
          ))}
        </div>
      </section>

      {/* Рынок и показатели */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Рынок и цели</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Огромный рынок — и мы знаем, как в него войти
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Объём рынка */}
          <div className="col-span-1 sm:col-span-2 p-6 rounded-2xl border text-center"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48% / 0.07), hsl(40 80% 62% / 0.1))", borderColor: "hsl(35 72% 48% / 0.25)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Объём рынка</p>
            <p className="font-cormorant text-5xl font-semibold mb-1" style={{ color: "hsl(35 72% 38%)" }}>16 629 553</p>
            <p className="text-sm text-foreground/70">зарегистрированных самозанятых в России</p>
            <p className="text-xs text-muted-foreground mt-1">по данным на 31.05.2026</p>
          </div>
          {/* Пользователи */}
          <div className="p-5 rounded-2xl border bg-white/70"
            style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(140 40% 45% / 0.1)" }}>
                <Icon name="Users" size={15} className="text-emerald-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Через 12 месяцев</p>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(140 40% 35%)" }}>30 000+</p>
            <p className="text-sm text-foreground/70 mt-1">активных пользователей</p>
          </div>
          {/* Тариф */}
          <div className="p-5 rounded-2xl border bg-white/70"
            style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name="Tag" size={15} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Средний тариф</p>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>3 333 ₽</p>
            <p className="text-sm text-foreground/70 mt-1">в месяц</p>
          </div>
          {/* Выручка */}
          <div className="col-span-1 sm:col-span-2 p-5 rounded-2xl border text-center"
            style={{ background: "hsl(35 72% 48%)", borderColor: "hsl(35 72% 40%)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">Планируемая выручка · 12 мес.</p>
            <p className="font-cormorant text-5xl font-semibold text-white">11,6 млн ₽</p>
          </div>
        </div>

        {/* Воронка захвата рынка */}
        <div className="mt-6 p-6 rounded-2xl border bg-white/60" style={{ borderColor: "hsl(36 28% 82%)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Воронка захвата рынка</p>
          <div className="space-y-3">
            {[
              { label: "Весь рынок самозанятых", value: "16 629 553", pct: 100, color: "hsl(36 28% 82%)", textColor: "text-foreground/50" },
              { label: "Помогающие специалисты (≈15%)", value: "≈ 2 494 000", pct: 15, color: "hsl(35 72% 70%)", textColor: "text-foreground/60" },
              { label: "Целевая аудитория с болью (≈5%)", value: "≈ 831 000", pct: 5, color: "hsl(35 72% 55%)", textColor: "text-foreground/70" },
              { label: "Цель через 12 мес.", value: "30 000", pct: 0.18, color: "hsl(35 72% 40%)", textColor: "font-semibold text-foreground", accent: true },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-sm ${row.textColor}`}>{row.label}</span>
                  <span className={`text-sm font-mono ${row.accent ? "font-bold" : "text-muted-foreground"}`} style={row.accent ? { color: "hsl(35 72% 38%)" } : {}}>{row.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(row.pct, 0.5)}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t flex items-center gap-2" style={{ borderColor: "hsl(36 28% 82%)" }}>
            <Icon name="Info" size={13} className="text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Для достижения цели достаточно привлечь <strong>0,18% от общего рынка</strong> — или <strong>3,6% от целевой аудитории</strong> помогающих специалистов.
            </p>
          </div>
        </div>
      </section>

      {/* Проблема */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Проблема</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Специалисты тратят часы на то,<br />что должно занимать минуты
        </h2>
        <div className="space-y-3">
          {problems.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border"
              style={{ borderColor: "hsl(36 28% 82%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(0 60% 50% / 0.08)" }}>
                <Icon name={p.icon} size={16} className="text-rose-500" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 pt-1.5">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Решение */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Решение</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Всё в одном приложении
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/70 border shadow-sm"
              style={{ borderColor: "hsl(36 28% 82%)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name={f.icon} size={18} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Почему я */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <div className="rounded-3xl p-8 border"
          style={{ background: "linear-gradient(135deg, hsl(35 72% 48% / 0.07), hsl(140 25% 60% / 0.06))", borderColor: "hsl(35 72% 48% / 0.2)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Основатель</p>
          <h2 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "hsl(24 20% 13%)" }}>
            17 лет в учёте и тысячи предпринимателей
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {[
              { num: "17+", label: "лет в бух. и налоговом учёте" },
              { num: "200+", label: "учеников 1С" },
              { num: "1000+", label: "часов консультаций предпринимателей" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(35 72% 42%)" }}>{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed">
            Этот проект рождён из личного понимания боли — изнутри. 
            Я знаю, как работают бухгалтерские программы, как ведут себя клиенты при работе с документами, 
            как меняется нормативная база. И знаю, как объяснить это простым языком — потому что сама самоучка.
          </p>
        </div>
      </section>

      {/* Дорожная карта */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Дорожная карта</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Что сделано и что впереди
        </h2>
        <div className="space-y-2.5">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: m.done ? "hsl(140 30% 50% / 0.07)" : "hsl(38 30% 94%)" }}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${m.done ? "" : "border-2"}`}
                style={m.done
                  ? { background: "hsl(140 40% 45%)" }
                  : { borderColor: "hsl(36 28% 78%)" }}>
                {m.done && <Icon name="Check" size={11} className="text-white" />}
              </div>
              <p className={`text-sm leading-relaxed ${m.done ? "text-foreground/80" : "text-muted-foreground"}`}>{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* На что деньги */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Использование средств</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          На что направлены инвестиции
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {spendItems.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 border"
              style={{ borderColor: "hsl(36 28% 82%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name={s.icon} size={16} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-2xl text-center"
          style={{ background: "hsl(35 72% 48% / 0.08)", border: "1px dashed hsl(35 72% 48% / 0.3)" }}>
          <p className="font-cormorant text-2xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>Итого: 1 500 000 ₽</p>
          <p className="text-xs text-muted-foreground mt-1">Минимальный вход от 350 000 ₽</p>
        </div>
      </section>

      {/* Условия инвестирования */}
      <section id="invest" className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Инвестирование</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Условия участия · Раунд 1
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {investOptions.map((opt, i) => (
            <div key={i} className="p-6 rounded-2xl border"
              style={{ background: opt.color, borderColor: opt.border, boxShadow: opt.accent ? "0 4px 24px hsl(35 72% 48% / 0.12)" : undefined }}>
              {opt.accent && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
                  style={{ background: "hsl(35 72% 48%)", color: "white" }}>Приоритет</span>
              )}
              <h3 className="font-cormorant text-xl font-semibold mb-1">{opt.title}</h3>
              <p className="text-2xl font-bold mb-4" style={{ color: "hsl(35 72% 38%)" }}>{opt.amount}</p>
              <ul className="space-y-2">
                {opt.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/75">
                    <Icon name="CheckCircle" size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 2 раунд */}
        <div className="p-5 rounded-2xl border"
          style={{ background: "hsl(38 30% 93%)", borderColor: "hsl(36 28% 80%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Repeat2" size={16} style={{ color: "hsl(35 72% 42%)" }} />
            <span className="text-sm font-semibold">Второй раунд — через 2–2,5 месяца</span>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/70">
            <li>• Отчёт о проделанной работе и показателях</li>
            <li>• Финансовая модель и бизнес-план</li>
            <li>• Финансирование рекламы и разработки мобильной версии</li>
            <li>• Действующий инвестор получает предложение первым</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 max-w-3xl mx-auto text-center">
        <div className="rounded-3xl p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 40%))" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
          <h2 className="font-cormorant text-3xl font-semibold text-white mb-3 relative z-10">
            Готовы обсудить участие?
          </h2>
          <p className="text-white/80 text-sm mb-6 relative z-10">
            Посмотрите на работающий прототип приложения прямо сейчас
          </p>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03] relative z-10"
            style={{ background: "white", color: "hsl(35 72% 38%)" }}
          >
            <Icon name="Smartphone" size={16} />
            Открыть приложение
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 text-center border-t" style={{ borderColor: "hsl(36 28% 85%)" }}>
        <p className="font-cormorant text-lg font-medium mb-1" style={{ color: "hsl(35 72% 42%)" }}>ДокуМастер</p>
        <p className="text-xs text-muted-foreground">Инвестиционное предложение · 2026</p>
      </footer>

    </div>
  );
}