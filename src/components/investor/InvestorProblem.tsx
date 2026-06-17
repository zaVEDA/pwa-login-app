import Icon from "@/components/ui/icon";

const problems = [
  {
    icon: "GraduationCap",
    tag: "Нелогично",
    title: "Покупают доступ к большим платформам",
    text: "Чтобы оформить элементарную рассрочку для клиента или подписать согласие на обработку персональных данных, помогающие специалисты вынуждены приобретать доступы к образовательным платформам.",
  },
  {
    icon: "Banknote",
    tag: "Дорого",
    title: "Консультация у грамотного специалиста от 30 000 р",
    text: "Хороший налоговый специалист или бухгалтер, который выстроит систему — дорогое «удовольствие». ИП или самозанятый, работающий на себя, просто не может позволить себе такой ценник.",
  },
  {
    icon: "CircleHelp",
    tag: "Бесполезно",
    title: "Дешёвые консультации отбивают желание искать решение",
    text: "После встречи с знакомым или недорогим специалистом остаётся ощущение, что вопрос вообще нерешаемый. Апатия, недоверие — и человек больше не хочет обращаться ни к каким консультантам.",
  },
  {
    icon: "Puzzle",
    tag: "Сложно",
    title: "Вместо решения — стопка программ, которые нужно связать",
    text: "Чтобы вести нормальный учёт, предлагают купить несколько сервисов и самому разобраться, как их подружить между собой. За 3 333 ₽ в месяц получить квалифицированный учёт — невозможно. До сих пор.",
  },
];

const socialItems = [
  { icon: "FileCheck", title: "Официальные договоры", desc: "Клиент защищён, специалист защищён" },
  { icon: "Receipt", title: "Декларирование доходов", desc: "Прозрачная деятельность без страха проверок" },
  { icon: "Users", title: "Доверие к профессии", desc: "Ответственный рынок помогающих практик" },
];

const marketRows = [
  { label: "Весь рынок самозанятых", value: "16 629 553", pct: 100, color: "hsl(36 28% 82%)", textColor: "text-foreground/50" },
  { label: "Помогающие специалисты (≈15%)", value: "≈ 2 494 000", pct: 15, color: "hsl(35 72% 70%)", textColor: "text-foreground/60" },
  { label: "Целевая аудитория с болью (≈5%)", value: "≈ 831 000", pct: 5, color: "hsl(35 72% 55%)", textColor: "text-foreground/70" },
  { label: "Цель через 12 мес.", value: "3 000", pct: 0.018, color: "hsl(35 72% 40%)", textColor: "font-semibold text-foreground", accent: true },
];

export default function InvestorProblem() {
  return (
    <>
      {/* Рынок и показатели */}
      <section className="px-5 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Рынок и цели</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "hsl(24 20% 13%)" }}>
          Огромный рынок — и мы знаем, как в него войти
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="col-span-1 sm:col-span-2 p-6 rounded-2xl border text-center"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48% / 0.07), hsl(40 80% 62% / 0.1))", borderColor: "hsl(35 72% 48% / 0.25)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Объём рынка</p>
            <p className="font-cormorant text-5xl font-semibold mb-1" style={{ color: "hsl(35 72% 38%)" }}>от 16 629 553</p>
            <p className="text-sm text-foreground/70">только зарегистрированных самозанятых в России</p>
            <p className="text-xs text-muted-foreground mt-1">по данным на 31.05.2026</p>
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t" style={{ borderColor: "hsl(35 72% 48% / 0.2)" }}>
              Реальная аудитория шире — сервис полезен любому, кто что-то продаёт, покупает, сдаёт или оказывает услугу: ИП, фрилансерам, арендодателям и физлицам. Акцент на помогающих специалистах — стартовая точка, которая уточняется по итогам тестирования
            </p>
          </div>
          <div className="p-5 rounded-2xl border bg-white/70" style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(140 40% 45% / 0.1)" }}>
                <Icon name="Users" size={15} className="text-emerald-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Целевая аудитория</p>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>831 000</p>
            <p className="text-xs text-muted-foreground mt-1">помогающих специалистов с болью</p>
          </div>
          <div className="p-5 rounded-2xl border bg-white/70" style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name="Target" size={15} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Цель · 12 месяцев</p>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>3 000</p>
            <p className="text-xs text-muted-foreground mt-1">активных пользователей</p>
          </div>
          <div className="p-5 rounded-2xl border bg-white/70" style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(35 72% 48% / 0.1)" }}>
                <Icon name="Tag" size={15} style={{ color: "hsl(35 72% 42%)" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Средний тариф</p>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>3 333 ₽</p>
            <p className="text-xs text-muted-foreground mt-1">в месяц на пользователя</p>
          </div>
          <div className="p-5 rounded-2xl border bg-white/70" style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(140 40% 45% / 0.1)" }}>
                <Icon name="TrendingUp" size={15} className="text-emerald-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Выручка · 12 месяцев</p>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color: "hsl(35 72% 38%)" }}>11,6 млн</p>
            <p className="text-xs text-muted-foreground mt-1">минимальный плановый объём</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border bg-white/60" style={{ borderColor: "hsl(36 28% 82%)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Воронка рынка</p>
          <div className="space-y-3">
            {marketRows.map((row) => (
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
              Для достижения цели достаточно привлечь <strong>0,018% от общего рынка</strong> — или <strong>0,36% от целевой аудитории</strong> помогающих специалистов.
            </p>
          </div>
        </div>
      </section>

      {/* Проблема */}
      <section className="px-5 py-14 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Проблема</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-10" style={{ color: "hsl(24 20% 13%)" }}>
          Отсутствие безопасности, понятности, предсказуемости —<br />вот что мешает человеку в деятельности, которая кормит его семью
        </h2>
        <p className="text-sm leading-relaxed text-foreground/70 mb-8 -mt-4">
          Наш сервис документооборота даёт именно это — через доступную стоимость, логичный интерфейс, качественные ответы и готовые решения. Но рынок до сих пор не предлагал ничего подобного.
        </p>
        <div className="space-y-4">
          {problems.map((p, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: "hsl(36 28% 82%)" }}>
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(0 60% 50% / 0.08)" }}>
                  <Icon name={p.icon} size={15} className="text-rose-500" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-400">{p.tag}</span>
              </div>
              <div className="px-4 pb-4">
                <p className="font-cormorant text-xl font-semibold mb-1" style={{ color: "hsl(24 20% 13%)" }}>{p.title}</p>
                <p className="text-sm leading-relaxed text-foreground/70">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl px-6 py-5 border-l-4" style={{ background: "hsl(0 60% 50% / 0.05)", borderLeftColor: "hsl(0 60% 50% / 0.4)" }}>
          <p className="font-cormorant text-xl font-semibold leading-snug mb-2" style={{ color: "hsl(24 20% 13%)" }}>
            Итого: страх неизвестности
          </p>
          <p className="text-sm leading-relaxed text-foreground/70">
            Непонимание того, как вести законную деятельность — прозрачную для контролирующих органов и при этом не разорительную — порождает страх, который останавливает. Специалист не знает, с чего начать, и просто не начинает.
          </p>
        </div>
      </section>

      {/* Нет аналогов */}
      <section className="px-5 py-14 max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Конкуренты</p>
        <h2 className="font-cormorant text-3xl font-semibold mb-4" style={{ color: "hsl(24 20% 13%)" }}>
          Аналогов — нет
        </h2>
        <p className="text-sm leading-relaxed text-foreground/70 mb-6">
          Существующие решения созданы для бухгалтеров и финансистов, но не для людей без финансового образования. Вот с чем сталкивается специалист, пытаясь найти альтернативу:
        </p>
        <div className="space-y-3">
          {[
            { icon: "MonitorX", text: "Слишком большие и сложные программы — перегружены функциями, которые никогда не понадобятся" },
            { icon: "FileWarning", text: "Требуют только официального учёта — не оставляют пространства для гибкости" },
            { icon: "Smartphone", text: "Называются мобильными, но использовать невозможно — не попадёшь пальцем в кнопки" },
            { icon: "Copy", text: "Одни и те же данные приходится вводить снова и снова в каждом разделе" },
            { icon: "PenOff", text: "Нет подписания по ЭДО — всё равно приходится распечатывать и сканировать" },
            { icon: "BookX", text: "Много умных слов — мало понятного для человека без финансового образования" },
            { icon: "Shuffle", text: "Нет простой логики — непонятно, с чего начать и что делать дальше" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 border" style={{ borderColor: "hsl(36 28% 82%)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(0 60% 50% / 0.07)" }}>
                <Icon name={item.icon} size={15} className="text-rose-400" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/75 pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Наше отличие */}
      <section className="px-5 pb-4 max-w-3xl mx-auto">
        <div className="rounded-2xl p-6 border" style={{ background: "linear-gradient(135deg, hsl(35 72% 48% / 0.08), hsl(40 80% 62% / 0.1))", borderColor: "hsl(35 72% 48% / 0.25)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(35 72% 42%)" }}>Наше отличие</p>
          <h2 className="font-cormorant text-3xl font-semibold mb-4" style={{ color: "hsl(24 20% 13%)" }}>
            Просто. Мобильно. Понятно.
          </h2>
          <div className="space-y-3">
            {[
              { icon: "Smartphone", text: "Разработано с нуля под мобильный экран — всё крупно, удобно, попадёшь пальцем" },
              { icon: "Repeat", text: "Данные вводятся один раз и автоматически подставляются во все документы" },
              { icon: "PenLine", text: "Подписание по ЭДО встроено в процесс — без распечаток и сканов" },
              { icon: "MessageCircle", text: "Язык живой, не бухгалтерский — понятен без специального образования" },
              { icon: "Map", text: "Чёткая логика шагов — человек всегда знает, что делать дальше" },
              { icon: "FileSpreadsheet", text: "Выгрузка в Excel — данные можно передать в бухгалтерскую программу для дальнейшей обработки" },
              { icon: "ClipboardList", text: "Аналитика по недостающим документам — сразу видно, что не оформлено и что может создать риски" },
              { icon: "Lightbulb", text: "Лёгкие подсказки, которые помогут не налететь на штрафы и не получить блокировку счёта по 115-ФЗ" },
              { icon: "MessageSquare", text: "Ответ на вопрос — до того, как он стал проблемой: встроенные сценарии и пояснения по ситуациям" },
              { icon: "GraduationCap", text: "Обучение и служба поддержки — рядом на каждом шаге, особенно для тех, кто сталкивается с документами впервые" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(35 72% 42% / 0.12)" }}>
                  <Icon name={item.icon} size={14} style={{ color: "hsl(35 72% 42%)" }} />
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Социальная миссия */}
      <section className="px-5 py-14 max-w-3xl mx-auto">
        <div className="rounded-2xl p-6 border" style={{ background: "linear-gradient(135deg, hsl(36 40% 96%) 0%, hsl(36 30% 92%) 100%)", borderColor: "hsl(36 40% 78%)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(35 72% 42%)" }}>Социальная задача</p>
          <h2 className="font-cormorant text-3xl font-semibold mb-4" style={{ color: "hsl(24 20% 13%)" }}>
            Больше специалистов,<br />которые работают честно
          </h2>
          <p className="text-sm leading-relaxed text-foreground/70 mb-4">
            Когда помогающий специалист — психолог, коуч, репетитор, мастер — понимает, как правильно оформить свою деятельность, он перестаёт бояться. И начинает работать открыто: подписывает официальные документы с клиентами, декларирует доходы, платит налоги.
          </p>
          <div className="rounded-xl p-4 mb-6 border-l-4" style={{ background: "hsl(35 72% 42% / 0.06)", borderLeftColor: "hsl(35 72% 42%)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "hsl(24 20% 13%)" }}>Мы не навязываем правила игры</p>
            <p className="text-sm leading-relaxed text-foreground/70">
              Оплату и декларирование налогов специалист производит сам — это его ответственность и его выбор. Мы помогаем вести учёт, держать руку на пульсе и анализировать внесённые данные, чтобы ничего не упустить.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {socialItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 rounded-xl bg-white/60 border" style={{ borderColor: "hsl(36 28% 82%)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(35 72% 42% / 0.1)" }}>
                  <Icon name={item.icon} size={15} style={{ color: "hsl(35 72% 42%)" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "hsl(24 20% 13%)" }}>{item.title}</p>
                <p className="text-xs leading-relaxed text-foreground/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}