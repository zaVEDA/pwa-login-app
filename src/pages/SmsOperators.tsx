import Icon from "@/components/ui/icon";

interface Operator {
  name: string;
  note?: string;
}

const OPERATORS: Operator[] = [
  { name: "Билайн" },
  { name: "МегаФон" },
  { name: "МОТИВ" },
  { name: "МТС" },
  { name: "Т2", note: "сообщения временно приходят от прежнего имени отправителя" },
];

export default function SmsOperators() {
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
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)), hsl(var(--ring)))" }}
          >
            <Icon name="MessageSquareText" size={26} className="text-white" />
          </div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Операторы связи для подписания документов по СМС
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Подписание документов простой электронной подписью (ПЭП) в CapyDoc.ru работает через одноразовый код,
            который приходит в СМС.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon name="Info" size={17} className="text-amber-700" />
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              При регистрации в приложении и покупке тарифа, пожалуйста, обратите внимание: функционал подписания
              электронных документов реализован через отправку СМС. А значит для успешной работы с сервисом у вас
              и у ваших клиентов, которым вы будете пересылать документы на подписание, должна быть связь одного
              из операторов, перечисленных ниже.
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Действующие операторы связи
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {OPERATORS.map((op) => (
            <div
              key={op.name}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
              >
                <Icon name="Signal" size={19} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-foreground">{op.name}</p>
              {op.note && (
                <p className="text-[10px] text-amber-700 leading-snug">{op.note}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-cormorant text-lg font-bold text-primary mb-1.5">Кто отправляет СМС</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Отправка одноразовых кодов для подписания документов простой электронной подписью (ПЭП)
              осуществляется через сервис СМС-рассылки SMS.ru, который взаимодействует с операторами сотовой
              связи, действующими на территории Российской Федерации: МТС, МегаФон, Билайн, МОТИВ, Т2 (Tele2)
              и другими операторами, подключёнными к SMS.ru.
            </p>
          </div>

          <div>
            <h2 className="font-cormorant text-lg font-bold text-primary mb-1.5">Почему имя отправителя может отличаться</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Имя отправителя, которое видит получатель СМС (например, «capydoc.ru»), устанавливается и
              утверждается каждым оператором связи самостоятельно и отдельно друг от друга. Пока оператор не
              подтвердит новое имя отправителя, сообщения через него могут приходить от прежнего наименования
              Исполнителя.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">На сегодняшний день:</p>
            <ul className="space-y-1.5 mb-2">
              <li className="text-sm text-foreground/80 leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-0 text-primary">•</span>
                МТС, МегаФон, Билайн, МОТИВ и большинство других операторов — сообщения приходят от имени
                <span className="font-medium text-foreground"> capydoc.ru</span>;
              </li>
              <li className="text-sm text-foreground/80 leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-0 text-primary">•</span>
                Т2 (Tele2) — сообщения временно приходят от прежнего наименования Исполнителя, до момента
                утверждения оператором имени отправителя <span className="font-medium text-foreground">capydoc.ru</span>.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Это техническая особенность работы операторов связи и сервиса рассылки, она не влияет на
              юридическую силу подписания документа простой электронной подписью и не означает, что сообщение
              отправлено сторонним лицом. Обновление имени отправителя у Т2 (Tele2) выполняется в рабочем
              порядке; после подтверждения оператором раздел будет обновлён.
            </p>
          </div>

          <div>
            <h2 className="font-cormorant text-lg font-bold text-primary mb-1.5">Если сомневаетесь в подлинности СМС</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Код из СМС всегда привязан к конкретному документу, который отображается в интерфейсе сервиса
              перед вводом кода. Если вы не инициировали подписание документа в CapyDoc.ru — не вводите код
              нигде.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4 px-2">
          Раздел ведётся во исполнение п. 12.3 Публичной оферты ООО «ЗАВЕДУЮЩАЯ»
        </p>

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
