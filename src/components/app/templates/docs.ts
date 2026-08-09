export type FieldType = "text" | "date" | "tel" | "email" | "checkbox" | "radio";

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  options?: { value: string; label: string; description?: string }[];
  /** Автозаполнение из профиля пользователя с возможностью правки */
  autofill?: "phone" | "email" | "performer";
}

export interface TemplateDoc {
  title: string;
  heading: string;
  fields: TemplateField[];
  build: (v: Record<string, string>) => string;
}

const fmt = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
};

const or = (val: string, fallback: string) => (val && val.trim() ? val.trim() : fallback);

const consentPhotoVideo: TemplateDoc = {
  title: "Соглашение на фото и видео съемку",
  heading: "СОГЛАСИЕ на фото- и видеосъёмку и использование материалов",
  fields: [
    { key: "fio", label: "ФИО того, кого снимают", type: "text", placeholder: "Иванова Анна Петровна" },
    { key: "birth", label: "Дата рождения", type: "date" },
    {
      key: "identMode",
      label: "Как указать личность в документе",
      type: "radio",
      options: [
        { value: "passport", label: "Указать паспортные данные" },
        { value: "none", label: "Не указывать паспорт" },
      ],
    },
    { key: "passport", label: "Паспорт (серия, номер)", type: "text", placeholder: "4510 123456", optional: true },
    { key: "performer", label: "Ваши данные (наименование / ФИО, ИНН)", type: "text", placeholder: "ИП Смирнова М.В., ИНН 770000000000", autofill: "performer" },
    { key: "alreadyDone", label: "Съёмка уже прошла", type: "checkbox" },
    { key: "shootDate", label: "Дата съёмки", type: "date" },
    { key: "shootPlace", label: "Место съёмки", type: "text", placeholder: "г. Москва, студия «Свет»" },
    { key: "phone", label: "Ваш контактный номер телефона для отзыва согласия", type: "tel", placeholder: "9001234567", hint: "Только цифры, до 10 знаков. Например: 9001234567", autofill: "phone" },
    { key: "email", label: "Ваш контактный E-mail для отзыва согласия", type: "email", placeholder: "mail@example.ru", autofill: "email" },
    { key: "signDate", label: "Дата подписания", type: "date" },
  ],
  build: (v) => {
    const ident = v.identMode === "passport"
      ? `паспорт ${or(v.passport, "[серия, номер]")}`
      : "данные не указываются при электронной подписи";

    const shoot = v.alreadyDone === "1"
      ? `Фото- и (или) видеосъёмку меня в ходе ранее проведённой съёмки ${or(fmt(v.shootDate), "[дата]")}, ${or(v.shootPlace, "[место]")}.`
      : `Фото- и (или) видеосъёмку меня ${or(fmt(v.shootDate), "[дата]")}, ${or(v.shootPlace, "[место]")}.`;

    return `Я, ${or(v.fio, "[ФИО]")}, ${or(fmt(v.birth), "[дата рождения]")}, ${ident}, в соответствии со ст. 152.1 ГК РФ даю ${or(v.performer, "[наименование/ФИО исполнителя, ИНН]")} согласие на:

1. ${shoot}
2. Использование моих изображений в следующих целях: портфолио, сайт, соцсети (VK, Telegram, Дзен и др.), рекламные материалы, кейсы, статьи.
3. Обработку материалов: кадрирование, цветокоррекцию, ретушь, монтаж, применение фильтров, наложение текста/графики, а также обработку с применением ИИ-инструментов (в т. ч. генеративные эффекты, стилизация, изменение внешности).
4. Создание производных материалов (коллажи, нарезки, шортсы, рилсы, тизеры, обложки).
5. Распространение и доведение до всеобщего сведения в сети Интернет, в т. ч. через облачные сервисы и мессенджеры.

Срок использования: бессрочно
Территория: весь мир
Вознаграждение не требуется.

Подтверждаю, что не возражаю против публикации, не считаю материалы порочащими, претензий не имею.

Право на отзыв: да, с правом отзыва путём направления письменного уведомления посредством направления смс на номер телефона ${or(v.phone, "[номер]")} и электронный адрес ${or(v.email, "[e@mail]")}.

Дата: ${or(fmt(v.signDate), "[дд.мм.гггг]")}

Подпись: ________________________`;
  },
};

export const templateDocs: Record<string, TemplateDoc> = {
  [consentPhotoVideo.title]: consentPhotoVideo,
};