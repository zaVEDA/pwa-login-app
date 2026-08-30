import { useState } from "react";
import Icon from "@/components/ui/icon";
import RevealItem from "@/components/why-not/RevealItem";
import JokeCarousel from "@/components/why-not/JokeCarousel";
import { reachGoal } from "@/lib/metrika";

const spheres = [
  "Услуги: консультации, групповые сессии, тренинги, психологические или околопсихологические консультации",
  "Услуги тренера в зале, йоги, сеансы звукотерапии, концерты, а также любого рода массаж",
  "Сдача и аренда квартир",
  "Услуги красоты",
  "Ремонт техники и монтаж: машинок, холодильников, монтаж потолков, шиномонтаж, ремонт машин и т.д.",
  "Автоэлектрика, домашняя проводка",
  "Дизайн, копирайтинг, создание сайтов и подключение ботов",
  "Продажа и покупка б/у вещей с рук",
  "Занятия с детьми",
];

const seriousReasons = [
  {
    icon: "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/9bc98a75-9414-4e3d-9a76-df54ad7fef96.jpg",
    title: "У вас уже есть договоры с унифицированными формами",
    desc: "Если по вашим договорам с клиентами предусмотрены строго унифицированные формы документов — пока этот функционал в приложении, к сожалению, отсутствует.",
  },
  {
    icon: "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/58fbe659-9864-4997-84f7-7592c23829c4.jpg",
    title: "Клиенты не согласны подписать соглашение об использовании ПЭП",
    desc: "Для подписания документов простой электронной подписью клиент должен согласиться с условиями её использования. Если ваши клиенты против — сервис не подойдёт.",
  },
  {
    icon: "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/eb03e3f0-cf46-4491-8e91-adb0a65be000.jpg",
    title: "Вам нужна автоматическая оплата подписки на платный канал в Telegram",
    desc: "Такого функционала в сервисе пока нет.",
  },
  {
    icon: "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/772e524f-b0a1-4736-b317-cea1031dc439.jpg",
    title: "У вас нет разовых и индивидуальных продаж — только массовые продукты",
    desc: "Тогда вам нужен свой сайт с подключённой системой оплат.",
    linkPlaceholder: true,
  },
];

export default function WhyNotDigital() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
          <Icon name="ArrowLeft" size={16} /> На главную
        </a>

        <div className="text-center mb-9">
          <div className="flex items-end justify-center gap-2 mb-6">
            <img src="/logo-capydoc.png" alt="CapyDoc.ru" width="78" height="78" className="flex-shrink-0 rounded-xl" />
            <div className="flex flex-col items-stretch text-left">
              <span className="flex justify-between mx-auto text-[22px] font-black uppercase leading-none" style={{ color: "hsl(24 20% 13%)", width: "90%" }}>
                {"Сервис".split("").map((ch, i) => <span key={i}>{ch}</span>)}
              </span>
              <span className="font-cormorant font-semibold text-[36px] leading-tight whitespace-nowrap">
                <span style={{ color: "hsl(35 72% 42%)" }}>Capy</span><span style={{ color: "hsl(24 20% 13%)" }}>Doc.ru</span>
              </span>
            </div>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold leading-tight mb-4" style={{ color: "hsl(24 20% 13%)" }}>
            Почему вам НЕ нужны<br />электронные документы
          </h1>
        </div>

        {/* Шуточный блок — карусель */}
        <RevealItem>
          <JokeCarousel />
        </RevealItem>

        {/* Раскрывающийся список сфер */}
        <RevealItem delay={80}>
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-10">
            <button
              onClick={() => {
                setExpanded((v) => !v);
                if (!expanded) reachGoal("why_not_spheres_expand");
              }}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <p className="text-sm font-semibold text-foreground/85 leading-relaxed">
                А ещё — если вы не оказываете ни одну из этих услуг
              </p>
              <Icon
                name="ChevronDown"
                size={18}
                className="text-primary flex-shrink-0 transition-transform"
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            <div
              style={{
                maxHeight: expanded ? "600px" : "0px",
                opacity: expanded ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.4s ease, opacity 0.3s ease",
              }}
            >
              <ul className="space-y-3 mt-4 pt-4 border-t" style={{ borderColor: "hsl(36 28% 82%)" }}>
                {spheres.map((s, i) => (
                  <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-5 relative">
                    <span className="absolute left-0 top-0.5 text-primary">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealItem>

        {/* Серьёзные причины */}
        <RevealItem delay={0}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
            А теперь серьёзно
          </p>
          <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold mb-8 text-center" style={{ color: "hsl(24 20% 13%)" }}>
            3+1 реальные причины, когда сервис не подойдёт
          </h2>
        </RevealItem>

        <div className="space-y-4 mb-10">
          {seriousReasons.map((r, i) => (
            <RevealItem key={r.title} delay={i * 90}>
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <img
                  src={r.icon}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-cormorant text-lg font-bold text-foreground mb-1.5">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {r.desc}
                    {r.linkPlaceholder && (
                      <>
                        {" "}
                        <span className="italic text-xs text-muted-foreground/70">
                          (скоро здесь появится ссылка на новый раздел сайта)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </div>

        <RevealItem>
          <div
            className="rounded-3xl p-6 sm:p-8 relative overflow-hidden text-center mb-10"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 40%))" }}
          >
            <h2 className="font-cormorant text-2xl font-semibold text-white mb-3 relative z-10">
              Во всех остальных случаях — welcome!
            </h2>
            <p className="text-white/80 text-sm mb-6 relative z-10">
              Договоры, счета, акты и согласия за пару минут с телефона, с подписью по СМС
            </p>
            <a
              href="/app"
              onClick={() => reachGoal("why_not_cta_start")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03] relative z-10"
              style={{ background: "white", color: "hsl(35 72% 38%)" }}
            >
              <Icon name="Eye" size={16} />
              Зайти и ознакомиться
            </a>
          </div>
        </RevealItem>

        <footer className="text-center py-6">
          <p className="text-xs text-muted-foreground">
            ООО «ЗАВЕДУЮЩАЯ» · ИНН 3801165360 · ОГРН 1253800010320
          </p>
          <p className="text-xs text-muted-foreground">
            e-mail: 89016625752@mail.ru · capydoc@mail.ru · тел.: +7 901 662-57-52
          </p>
        </footer>
      </div>
    </div>
  );
}