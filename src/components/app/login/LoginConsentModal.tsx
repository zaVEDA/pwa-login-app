import Icon from "@/components/ui/icon";

interface Props {
  onClose: () => void;
  onAccept: () => void;
}

export default function LoginConsentModal({ onClose, onAccept }: Props) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="card-warm rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h3 className="font-cormorant text-xl font-semibold">Согласие при входе в сервис</h3>
          <button onClick={onClose} className="text-muted-foreground">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto text-sm text-muted-foreground leading-relaxed space-y-4">
          <div>
            <p className="font-medium text-foreground mb-1">1. Обработка персональных данных</p>
            <p>
              Регистрируясь в сервисе «CapyDoc.ru», я даю согласие на обработку моих персональных
              данных (номер телефона, адрес электронной почты, ФИО и иные данные, которые я укажу)
              в целях регистрации, идентификации и предоставления мне услуг сервиса. Обработка включает
              сбор, запись, систематизацию, накопление, хранение, уточнение, использование, передачу
              (в объёме, необходимом для оказания услуг), блокирование и удаление данных. Подробнее —{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                Политика обработки персональных данных
              </a>.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">2. Публичная оферта</p>
            <p>
              Я присоединяюсь к условиям использования сервиса, изложенным в{" "}
              <a href="/offer" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                Публичной оферте
              </a>{" "}
              (тарифы, порядок оказания услуг, права и обязанности сторон).
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">3. Соглашение об использовании ПЭП</p>
            <p>
              Одноразовый код, направляемый мне в SMS на номер телефона, признаётся моей простой
              электронной подписью (ПЭП) на основании 63-ФЗ «Об электронной подписи». Действия,
              подтверждённые вводом верного кода из SMS, признаются совершёнными мной лично и
              равнозначны документам на бумаге с собственноручной подписью. Сервис фиксирует факт
              подписания (телефон, дата и время, код) в журнале — это доказательство совершённого
              действия. Я обязуюсь не передавать доступ к телефону и коду третьим лицам.
            </p>
          </div>
          <p className="text-[11px]">
            Согласие действует до его отзыва. Отозвать согласие можно, обратившись в поддержку сервиса.
          </p>
        </div>
        <div className="px-5 py-4 border-t border-border/60">
          <button
            onClick={onAccept}
            className="w-full py-3 rounded-xl gold-gradient text-white text-sm font-medium active:scale-[0.98] transition-transform"
          >
            Согласен(а) и принимаю
          </button>
        </div>
      </div>
    </div>
  );
}
