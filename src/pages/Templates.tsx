import Icon from "@/components/ui/icon";
import PromoTemplateBanner from "@/components/promo/PromoTemplateBanner";
import { reachGoal } from "@/lib/metrika";

const LAUNCH_DATE = "11 сентября 2026";

const READY_TEMPLATES = [
  {
    icon: "ShieldCheck",
    title: "Согласие на обработку персональных данных",
    desc: "Базовый документ для работы с клиентами — фиксирует согласие на сбор и обработку личных данных до начала оказания услуг",
    tag: "Универсальный",
  },
  {
    icon: "FileText",
    title: "Соглашение на фото и видео съёмку",
    desc: "Чтобы разместить в портфолио, рилс или сторис фото- и видеоматериалы клиента — нужно получить его официальное согласие",
    tag: "Фотограф",
  },
];

const OTHER_DOC_TYPES = [
  { icon: "Receipt", title: "Счёт", desc: "Формируется под ваши реквизиты и отправляется клиенту за пару минут" },
  { icon: "FileCheck", title: "Акт", desc: "Создаётся на основании счёта или договора после оказания услуги" },
];

export default function Templates() {
  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
          <Icon name="ArrowLeft" size={16} /> На главную
        </a>

        <div className="text-center mb-7">
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
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Действующие шаблоны документов
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Сейчас на сайте уже есть готовые шаблоны, которые вы можете использовать в своей деятельности прямо сегодня.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="RefreshCw" size={17} className="text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">
            <span className="font-semibold">Шаблоны еженедельно пополняются!</span> Мы постоянно добавляем новые
            документы под разные виды деятельности.
          </p>
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Готовые шаблоны договоров и соглашений
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {READY_TEMPLATES.map((t) => (
            <div key={t.title} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={t.icon} size={17} className="text-primary" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  {t.tag}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{t.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Также доступны в сервисе
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {OTHER_DOC_TYPES.map((t) => (
            <div key={t.title} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={t.icon} size={17} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{t.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon name="Rocket" size={17} className="text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1.5">
                К {LAUNCH_DATE} — официальному запуску полной версии приложения — будут добавлены шаблоны по
                основным направлениям зарегистрированных пользователей
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Речь о тех видах деятельности, которые вы указали при регистрации. Приписка: шаблоны добавляются,
                если они экологичные и не противоречат законодательству РФ.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Info" size={17} className="text-amber-700" />
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">
            Пользуйтесь приложением уже сейчас — доступ полный и без ограничений. Все документы, которые вы создадите
            и подпишете до {LAUNCH_DATE}, будут учтены в лимите вашего тарифа после запуска: если их окажется
            больше, чем предусмотрено тарифом, документы сверх лимита нужно будет докупить.
          </p>
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Хотите шаблон под себя раньше всех?
        </p>

        <div className="mb-4">
          <PromoTemplateBanner
            onWant={() => {
              reachGoal("templates_page_promo_click");
              window.location.href = "/app";
            }}
          />
        </div>

        <a
          href="/app"
          onClick={() => reachGoal("templates_page_pro_click")}
          className="block bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6 hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(35 72% 48%)" }}>
              <Icon name="PenTool" size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">
                Или приобретите тариф «Творец»
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                На этом тарифе можно добавить свой собственный шаблон договора в сервис — без ожидания очереди*.
              </p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed mt-1.5">
                * В течение 24 часов с момента выгрузки, с даты официального запуска сервиса — 11 сентября 2026.
              </p>
            </div>
            <Icon name="ChevronRight" size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </a>

        <footer className="text-center py-8">
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