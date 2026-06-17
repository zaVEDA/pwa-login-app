import Icon from "@/components/ui/icon";

const features = [
  { icon: "FileText", title: "Документы", desc: "Договор, согласие на обработку персональных данных, акт — формируются за минуты" },
  { icon: "PenLine", title: "Подписание", desc: "Клиент подписывает прямо в приложении — без распечаток и сканов" },
  { icon: "CreditCard", title: "Оплата", desc: "Приём оплаты встроен в процесс — одним потоком с документами" },
  { icon: "BookOpen", title: "Обучение", desc: "Понятный язык и мини-обучалка для тех, кто впервые сталкивается с документооборотом" },
  { icon: "Database", title: "Аналитика", desc: "Выгрузка базы данных для своих отчётов и аналитики" },
  { icon: "ShieldCheck", title: "Правовая база", desc: "Документы соответствуют законодательству и готовят специалиста к любым проверкам" },
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

const spendItems = [
  { icon: "Laptop", label: "Оборудование", desc: "Ноутбук и монитор для параллельной работы" },
  { icon: "Scale", label: "Юридическое сопровождение", desc: "Документы, договоры с подрядчиками, реестр российского ПО" },
  { icon: "Bot", label: "ИИ и разработка PWA", desc: "Оплата платформы и программиста-консультанта" },
  { icon: "Palette", label: "Дизайн и фирменный стиль", desc: "Брендинг, маскот, визуальная идентика" },
  { icon: "Globe", label: "Сайт и аналитика", desc: "Сайт продукта с опросником и инструментами аналитики" },
  { icon: "Users", label: "Команда и исследования", desc: "Ассистенты для опросов и тестирования с пользователями" },
];

export default function InvestorSolution() {
  return (
    <>
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
          <h2 className="font-cormorant text-3xl font-semibold mb-1" style={{ color: "hsl(24 20% 13%)" }}>
            Юлия Кузнецова
          </h2>
          <p className="text-sm text-muted-foreground mb-6">17 лет в бухгалтерском и налоговом учёте</p>
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
          <p className="text-sm text-foreground/75 leading-relaxed mb-4">
            Этот проект — из личного опыта. Я работала в учёте, обучала людей работе с 1С, консультировала предпринимателей и видела одно и то же: люди боятся не работы, а бумаг. Я понимаю, как устроены программы, как меняется нормативная база и — главное — как объяснить это простым языком.
          </p>
          <div className="rounded-xl p-4 border-l-4" style={{ background: "hsl(35 72% 42% / 0.05)", borderLeftColor: "hsl(35 72% 42%)" }}>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Более 10 месяцев я работала с помогающими специалистами — изучала их практики, проходила путь клиента изнутри. Я хорошо понимаю, где именно документы становятся барьером — и как этот барьер убрать.
            </p>
          </div>
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
              <p className={`text-sm leading-snug ${m.done ? "text-foreground/80" : "text-foreground/50"}`}>{m.text}</p>
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
            <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-white/60 border"
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
    </>
  );
}