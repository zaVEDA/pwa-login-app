import Icon from "@/components/ui/icon";

type St = "done" | "planned";

function Tag({ s }: { s: St }) {
  const m = {
    done: { t: "Сделано", c: "bg-green-100 text-green-700 border-green-200", i: "CheckCircle2" },
    planned: { t: "В работе / отложено", c: "bg-amber-100 text-amber-700 border-amber-200", i: "Clock" },
  } as const;
  const x = m[s];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${x.c}`}>
      <Icon name={x.i} size={11} />
      {x.t}
    </span>
  );
}

function Block({ icon, title, tag, children }: { icon: string; title: string; tag?: St; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
        <h2 className="font-semibold text-foreground flex-1 leading-tight">{title}</h2>
        {tag && <Tag s={tag} />}
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <Icon name="Dot" size={18} className="text-primary flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export default function Agreements() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Рабочее окно · наши договорённости</p>
          <h1 className="font-cormorant text-3xl font-bold text-foreground mb-1">Что мы решили</h1>
          <p className="text-sm text-muted-foreground">
            Все решения из нашей работы над проектом в одном месте. Обновляется по мере работы. Июль 2026.
          </p>
        </div>

        <div className="space-y-4">
          <Block icon="Calendar" title="Даты на лендинге" tag="done">
            <P>Везде заменили «15 июля» → «1 августа»: запуск, тарифы, плашка предпродажи.</P>
            <P>Срок предпродажной скидки продлён до 1 августа — акция снова активна.</P>
          </Block>

          <Block icon="LogIn" title="Вход в аккаунт" tag="done">
            <P>Первый вход с нового устройства — по СМС (ПЭП). Код: 4 цифры, 10 минут.</P>
            <P>Повторный вход со знакомого устройства — по email и паролю.</P>
          </Block>

          <Block icon="Timer" title="Пауза между отправками СМС" tag="done">
            <P>60 секунд между повторными отправками кода — уже работает.</P>
          </Block>

          <Block icon="ShieldAlert" title="Защита от подбора кода" tag="planned">
            <P>3 неверных ввода кода → блокировка входа на 30 минут.</P>
            <P>Показываем, сколько минут осталось до разблокировки.</P>
          </Block>

          <Block icon="MessageSquareWarning" title="Лимит отправки СМС" tag="planned">
            <P>3 отправки кода → блок на 30 минут.</P>
            <P>Не более 3 СМС в сутки на один номер.</P>
          </Block>

          <Block icon="Mail" title="Подтверждение email" tag="planned">
            <P>Подтвердить email нужно до оплаты, желательно в течение суток.</P>
            <P>Без подтверждённого email нельзя оплатить тариф и подписывать документы.</P>
            <P>Нужен сервис рассылки (Unisender Go) + служебный адрес noreply@zavdoc.ru — отложено.</P>
          </Block>

          <Block icon="KeyRound" title="Восстановление пароля" tag="done">
            <P>Сначала через email, если не вышло — через СМС.</P>
            <P>Количество запросов кода — до 3 включительно.</P>
          </Block>

          <Block icon="ScrollText" title="Журнал событий входа (152-ФЗ)" tag="planned">
            <P>Фиксируем: телефон, IP, время, результат (успех / ошибка / блокировка).</P>
          </Block>

          <Block icon="FileSignature" title="Подписание документов через ПЭП" tag="planned">
            <P>Авторизация (СМС + подтверждённый email).</P>
            <P>Оплаченный тариф — либо доступ «Для родных» (ставит Заведующая).</P>
            <P>Отправка клиенту согласия на ПДн + соглашения об использовании ПЭП.</P>
          </Block>

          <Block icon="FileText" title="Юридические документы" tag="planned">
            <P>Пока на сайте не размещаем — ждём готовности от юриста.</P>
            <P>Оферта и Политика ПДн — на сайт; Согласие ПДн + ПЭП — при входе; Тарифы — при оплате.</P>
          </Block>

          <Block icon="LayoutGrid" title="Навигация для тебя" tag="done">
            <P>Скрытая страница для юриста — /legal-flow.</P>
            <P>Переключатель режимов (эта панель): Лендинг, Юристу, Гость, Заведующая, Договорённости.</P>
          </Block>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3">
          <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
          <span>Страница видна только тебе через переключатель режимов. Клиенты её не видят.</span>
        </div>
      </div>
    </div>
  );
}
