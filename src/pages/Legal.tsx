import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import LegalFilesBlock from "@/components/legal/LegalFilesBlock";
import LegalGate, { clearLegalAuth } from "@/components/legal/LegalGate";

const DOCS = [
  { key: "drafts", title: "Юридические документы (черновики)", md: "/legal-drafts.md", doc: "/legal-drafts.doc" },
  { key: "explained", title: "Пояснительная записка", md: "/legal-explained.md", doc: "/legal-explained.doc" },
];

type Status = "done" | "planned";

const FLOW_DOCS = [
  { n: 1, name: "Публичная оферта (Пользовательское соглашение)", place: "На сайте (публично)", accept: "Начало использования сайта/сервиса = акцепт" },
  { n: 2, name: "Политика обработки персональных данных", place: "На сайте (отдельная страница, ссылка из оферты и согласия)", accept: "Ознакомление; ссылка обязательна по 152-ФЗ" },
  { n: 3, name: "Согласие на обработку ПДн + Соглашение об использовании ПЭП", place: "При входе в приложение", accept: "Подтверждение по СМС = простая электронная подпись (ПЭП), с логированием" },
  { n: 4, name: "Тарифы и условия оплаты", place: "При оплате тарифа", accept: "Оплата = акцепт" },
  { n: 5, name: "Политика безопасности (внутренняя)", place: "НЕ публикуется", accept: "Внутренний документ (шифрование, бэкапы, доступ)" },
];

function Badge({ status }: { status: Status }) {
  const map = {
    done: { label: "Реализовано", cls: "bg-green-100 text-green-700 border-green-200", icon: "CheckCircle2" },
    planned: { label: "Отложено", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: "Clock" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${m.cls}`}>
      <Icon name={m.icon} size={12} />
      {m.label}
    </span>
  );
}

function Section({ n, title, status, children }: { n: string; title: string; status?: Status; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-semibold text-primary text-sm">{n}</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground flex-1">{title}</h2>
        {status && <Badge status={status} />}
      </div>
      <div className="pl-11 space-y-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <Icon name="Dot" size={18} className="text-primary flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function renderMd(md: string) {
  const lines = md.split("\n");
  const out: JSX.Element[] = [];
  let key = 0;
  let table: string[][] | null = null;

  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    out.push(
      <div key={key++} className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i} className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} className="border border-border px-2 py-1.5 align-top">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    table = null;
  };

  const inline = (s: string) =>
    s.replace(/\*\*(.*?)\*\*/g, "$1");

  for (const raw of lines) {
    const ln = raw.trimEnd();
    if (ln.trim().startsWith("|")) {
      const cells = ln.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (cells.every((c) => /^[-: ]*$/.test(c))) continue;
      (table ??= []).push(cells);
      continue;
    } else flushTable();

    if (ln.startsWith("> ")) {
      out.push(<p key={key++} className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3 my-1.5">{inline(ln.slice(2))}</p>);
    } else if (ln.trim() === "---") {
      out.push(<hr key={key++} className="my-5 border-border" />);
    } else if (ln.startsWith("### ")) {
      out.push(<h3 key={key++} className="text-base font-semibold mt-4 mb-1.5">{inline(ln.slice(4))}</h3>);
    } else if (ln.startsWith("## ")) {
      out.push(<h2 key={key++} className="text-lg font-bold mt-5 mb-2 text-primary">{inline(ln.slice(3))}</h2>);
    } else if (ln.startsWith("# ")) {
      out.push(<h1 key={key++} className="text-xl font-bold mt-6 mb-2">{inline(ln.slice(2))}</h1>);
    } else if (ln.trim().startsWith("- ")) {
      out.push(<li key={key++} className="text-sm ml-5 list-disc my-0.5">{inline(ln.trim().slice(2))}</li>);
    } else if (ln.trim()) {
      out.push(<p key={key++} className="text-sm my-1.5 leading-relaxed">{inline(ln)}</p>);
    }
  }
  flushTable();
  return out;
}

export default function Legal() {
  const [active, setActive] = useState(DOCS[0]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(active.md)
      .then((r) => r.text())
      .then((t) => { setContent(t); setLoading(false); })
      .catch(() => { setContent("Не удалось загрузить документ."); setLoading(false); });
  }, [active]);

  return (
    <LegalGate>
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Внутренний документ · не для клиентов</p>
            <h1 className="font-cormorant text-3xl font-bold text-foreground mb-2">
              Юридический раздел
            </h1>
            <p className="text-sm text-muted-foreground">
              Порядок авторизации и подписания, юридические документы и вложения — всё для проверки юристом.
              Обновлено: июль 2026.
            </p>
          </div>
          <button
            onClick={clearLegalAuth}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 flex-shrink-0"
          >
            <Icon name="LogOut" size={13} /> Выйти
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8">
          <Section n="1" title="Вход в аккаунт" status="done">
            <Li><b>Первый вход с нового устройства</b> — только через SMS-код на телефон (ПЭП).</Li>
            <Li><b>Повторный вход с доверенного устройства</b> — по логину (email) и паролю.</Li>
            <Li>Устройство запоминается после успешного подтверждения SMS-кода.</Li>
            <Li>SMS-код: 4 цифры, срок действия — 10 минут.</Li>
          </Section>

          <Section n="2" title="Защита от подбора кода" status="done">
            <Li><b>3 неверных ввода кода</b> подряд → блокировка входа на <b>30 минут</b>.</Li>
            <Li>Во время блокировки нельзя ни вводить код, ни запрашивать новый.</Li>
            <Li>Пользователю показывается, сколько минут осталось до разблокировки.</Li>
          </Section>

          <Section n="3" title="Лимит отправки SMS-кодов" status="done">
            <Li>Пауза <b>60 секунд</b> между повторными отправками.</Li>
            <Li><b>3 отправки</b> кода за 30 минут → пауза <b>30 минут</b>.</Li>
            <Li>После паузы ещё запросы разрешены, но по достижении суточного лимита → блокировка отправки на <b>сутки</b>.</Li>
            <Li>Суточный лимит на номер: <b>6 SMS для входа</b> (до 2 устройств), <b>3 SMS</b> для регистрации и восстановления.</Li>
          </Section>

          <Section n="4" title="Подтверждение электронной почты" status="planned">
            <Li>Email нужно подтвердить <b>до оплаты</b>, желательно в течение <b>суток</b> после регистрации.</Li>
            <Li>Без подтверждённого email: <b>нельзя оплатить тариф и нельзя подписывать документы</b>.</Li>
            <Li>Остальной функционал (просмотр, знакомство с сервисом) остаётся доступным.</Li>
            <Li><span className="text-amber-700">Отправка писем требует сервиса рассылки (Unisender Go / SendPulse) и служебного адреса вида noreply@capydoc.ru — вынесено в отложенные задачи.</span></Li>
          </Section>

          <Section n="5" title="Восстановление доступа (забыли пароль)" status="done">
            <Li><b>Сначала — через email</b> (письмо с кодом/ссылкой).</Li>
            <Li>Если через email не получилось — <b>через SMS</b>.</Li>
            <Li>Количество единоразовых запросов кода — <b>до 3 включительно</b> (те же лимиты, что и при входе).</Li>
          </Section>

          <Section n="6" title="Журнал событий (защита персональных данных)" status="planned">
            <Li>Фиксируются все события входа: телефон, IP-адрес, время, результат.</Li>
            <Li>Результат: успех / неверный код / блокировка.</Li>
            <Li>Цель — выполнение требований 152-ФЗ (регистрация событий доступа) и доказательная база при спорах.</Li>
          </Section>

          <Section n="7" title="Подписание документов через ПЭП" status="planned">
            <p className="mb-2 text-foreground font-medium">Чтобы отправить документ клиенту на подпись, специалист должен:</p>
            <Li>Авторизоваться (SMS + подтверждённый email).</Li>
            <Li>Оплатить тариф — либо получить бесплатный доступ «Для родных» (галочку ставит Заведующая/админ).</Li>
            <Li>Отправить клиенту первый запрос: согласие на обработку персональных данных + соглашение об использовании ПЭП вместо собственноручной подписи.</Li>
            <Li>Факт подписания фиксируется в журнале: кто, какой документ, каким кодом, когда, с какого устройства.</Li>
          </Section>

          <Section n="8" title="Юридические документы" status="planned">
            <Li>Пока на сайте <b>не размещаем</b> — ждём готовности от юриста.</Li>
            <div className="overflow-x-auto -mx-2 mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">#</th>
                    <th className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">Документ</th>
                    <th className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">Где размещается</th>
                    <th className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">Как принимается пользователем</th>
                  </tr>
                </thead>
                <tbody>
                  {FLOW_DOCS.map((d) => (
                    <tr key={d.n}>
                      <td className="border border-border px-2 py-1.5 align-top text-center">{d.n}</td>
                      <td className="border border-border px-2 py-1.5 align-top font-medium text-foreground">{d.name}</td>
                      <td className="border border-border px-2 py-1.5 align-top">{d.place}</td>
                      <td className="border border-border px-2 py-1.5 align-top">{d.accept}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section n="9" title="Даты и предпродажа (лендинг)" status="done">
            <Li>Старт первой версии приложения — <b>с 1 августа</b>.</Li>
            <Li>Предпродажная скидка на подписку 6 месяцев действует <b>до 1 августа</b>.</Li>
          </Section>

          <Section n="10" title="Навигация (для Заведующей)" status="done">
            <Li>Эта страница — сводка всех договорённостей по проекту, доступна по ссылке <b>/legal</b>.</Li>
            <Li>В предпросмотре есть переключатель режимов (кнопка в правом нижнем углу): <b>Лендинг</b>, <b>Юристу</b>, <b>Гость</b> (вход + тестовые документы), <b>Заведующая</b> (админ-вход).</Li>
            <Li>Переключатель виден везде, кроме боевого сайта capydoc.ru — клиенты его не видят.</Li>
          </Section>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="ScrollText" size={22} className="text-primary" />
            <h2 className="text-xl font-bold">Юридические документы</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Черновики для проверки юристом. На сайте пока не опубликованы. Можно читать здесь или скачать в Word.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {DOCS.map((d) => (
            <button
              key={d.key}
              onClick={() => setActive(d)}
              className={`text-xs px-3 py-2 rounded-xl font-medium border ${
                active.key === d.key ? "bg-primary text-primary-foreground border-transparent" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <a href={active.doc} download className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium bg-card border border-border hover:border-primary">
            <Icon name="Download" size={14} className="text-primary" /> Скачать этот документ (Word)
          </a>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          {loading ? (
            <div className="flex justify-center py-10"><Icon name="Loader" size={22} className="animate-spin text-primary" /></div>
          ) : (
            <div className="prose-none">{renderMd(content)}</div>
          )}
        </div>

        <LegalFilesBlock />

        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3">
          <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            Статусы: <span className="text-green-700 font-medium">Реализовано</span> — работает в приложении сейчас;{" "}
            <span className="text-amber-700 font-medium">Отложено</span> — согласовано, ожидает реализации.
            Страница скрытая, доступна только по прямой ссылке /legal.
          </span>
        </div>
      </div>
    </div>
    </LegalGate>
  );
}