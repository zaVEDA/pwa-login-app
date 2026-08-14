export type FieldType = "choice" | "text" | "textarea" | "checkboxes";

export interface BriefField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  showIf?: (a: Record<string, unknown>) => boolean;
}

export interface BriefStep {
  title: string;
  subtitle: string;
  capyLine: string;
  fields: BriefField[];
}

const isGoods = (a: Record<string, unknown>) => a.kind === "Товар";
const isService = (a: Record<string, unknown>) => a.kind !== "Товар";

export const briefSteps: BriefStep[] = [
  {
    title: "Суть дела",
    subtitle: "Чем вы занимаетесь",
    capyLine: "Начнём с простого — расскажите, чем занимаетесь",
    fields: [
      { key: "kind", label: "Что вы предлагаете?", type: "choice", options: ["Услуга", "Товар", "И то, и другое"] },
      {
        key: "what",
        label: "Опишите своими словами",
        type: "textarea",
        placeholder: "Например: провожу индивидуальные консультации по подбору гардероба",
      },
      {
        key: "short_name",
        label: "Как назвать коротко, 2–3 слова?",
        type: "text",
        placeholder: "Фотосессия · Консультация психолога · Пошив штор",
        hint: "Это название попадёт в заголовок договора",
      },
      { key: "clients", label: "Кто ваши клиенты?", type: "choice", options: ["Обычные люди", "Компании", "И те, и другие"] },
    ],
  },
  {
    title: "Деньги",
    subtitle: "Цена и порядок оплаты",
    capyLine: "Самая частая причина споров — деньги. Давайте всё запишем",
    fields: [
      { key: "price_type", label: "Как считается цена?", type: "choice", options: ["Фиксированная за единицу", "За час", "Зависит от объёма", "Договорная"] },
      { key: "price", label: "Укажите цену", type: "text", placeholder: "Например: 5000 ₽ за встречу", optional: true },
      { key: "prepay", label: "Когда клиент платит?", type: "choice", options: ["Предоплата полностью", "Частичная предоплата", "После выполнения", "Частями"] },
      { key: "prepay_size", label: "Размер предоплаты", type: "text", placeholder: "Например: 50% или 2000 ₽", optional: true, showIf: (a) => a.prepay === "Частичная предоплата" || a.prepay === "Частями" },
      { key: "pay_method", label: "Каким способом принимаете оплату?", type: "checkboxes", options: ["Перевод на карту", "Счёт на оплату", "Наличные", "Онлайн-эквайринг"] },
    ],
  },
  {
    title: "Порядок работы",
    subtitle: "Как всё происходит",
    capyLine: "Теперь опишем, как проходит работа с клиентом",
    fields: [
      { key: "format", label: "Как вы работаете?", type: "choice", options: ["Лично", "Онлайн", "И так, и так"], showIf: isService },
      { key: "booking", label: "Нужна предварительная запись?", type: "choice", options: ["Да", "Нет"], showIf: isService },
      { key: "duration", label: "Сколько занимает по времени?", type: "choice", options: ["Одна встреча", "Несколько дней", "Несколько недель", "Работаем постоянно"], showIf: isService },
      { key: "delivery", label: "Как передаёте товар?", type: "choice", options: ["Лично в руки", "Доставка курьером", "Почта / транспортная"], showIf: isGoods },
      { key: "delivery_pay", label: "Кто платит за доставку?", type: "choice", options: ["Клиент", "Я", "Пополам"], optional: true, showIf: isGoods },
      {
        key: "done_when",
        label: "Что считается выполненным?",
        type: "textarea",
        placeholder: "Например: провели встречу и передали разбор гардероба в файле",
        hint: "С этого момента клиент не может требовать деньги обратно",
      },
    ],
  },
  {
    title: "Спорные ситуации",
    subtitle: "Самый важный шаг",
    capyLine: "А вот тут — самое ценное. Этого нет в шаблонах из интернета",
    fields: [
      { key: "cancel_client", label: "Клиент отменяет — за сколько дней можно без потерь?", type: "text", placeholder: "Например: за 3 дня — без потерь, позже предоплата не возвращается" },
      { key: "no_show", label: "Клиент не пришёл или пропал — что тогда?", type: "textarea", placeholder: "Например: услуга считается оказанной, предоплата остаётся у меня" },
      { key: "cancel_me", label: "Вы вынуждены перенести — как поступаете?", type: "textarea", placeholder: "Например: предупреждаю заранее и предлагаю новую дату или возвращаю деньги" },
      { key: "refund", label: "Возврат денег возможен?", type: "textarea", placeholder: "Например: до начала работы — да, после — нет" },
    ],
  },
  {
    title: "Особые условия",
    subtitle: "Отметьте, что подходит",
    capyLine: "Почти всё! Осталось отметить пару галочек",
    fields: [
      {
        key: "extras",
        label: "Что из этого про вас?",
        type: "checkboxes",
        optional: true,
        options: [
          "Публикую работы в портфолио и соцсетях",
          "Работаю с личной информацией клиента",
          "Передаю файлы, макеты, записи",
          "Работаю с детьми",
        ],
      },
      { key: "extras_other", label: "Что-то ещё важное?", type: "textarea", placeholder: "Опишите своими словами", optional: true },
      {
        key: "protect",
        label: "Что для вас критично защитить?",
        type: "textarea",
        placeholder: "Например: чтобы клиент не выкладывал мои материалы в открытый доступ",
        hint: "Напишите главное опасение — учтём в первую очередь",
        optional: true,
      },
    ],
  },
];
