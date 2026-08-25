import { useState } from "react";
import Icon from "@/components/ui/icon";
import { templates } from "./tabs/constants";

const PERSONAL_DATA_TITLE = "Согласие на обработку персональных данных";

interface Props {
  onPersonalData: () => void;
  onInvoice: () => void;
  onAgreementSelect: (title: string) => void;
}

export default function CreateDocMenu({ onPersonalData, onInvoice, onAgreementSelect }: Props) {
  const [actHintOpen, setActHintOpen] = useState(false);
  const [agreementListOpen, setAgreementListOpen] = useState(false);
  const agreementTemplates = templates.filter((t) => t.title !== PERSONAL_DATA_TITLE);

  return (
    <>
      <p className="px-3.5 pt-2.5 pb-1 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        Выберите вид документа
      </p>

      <button
        onClick={onPersonalData}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors"
      >
        <Icon name="ShieldCheck" size={16} className="text-primary flex-shrink-0" />
        <span>
          Согласие на обработку
          <br />
          персональных данных
        </span>
      </button>

      <button
        onClick={onInvoice}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors border-t border-border/40"
      >
        <Icon name="Receipt" size={16} className="text-primary flex-shrink-0" />
        Счёт
      </button>

      <button
        onClick={() => setActHintOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors border-t border-border/40"
      >
        <Icon name="FileCheck" size={16} className="text-primary flex-shrink-0" />
        Акт
        <Icon name={actHintOpen ? "ChevronUp" : "ChevronDown"} size={13} className="ml-auto text-muted-foreground" />
      </button>
      {actHintOpen && (
        <div className="px-3.5 pb-3 -mt-1 bg-amber-50/60">
          <p className="text-[11px] leading-snug text-muted-foreground mb-2">
            Акт формируется на основании счёта или договора. Сначала оформите счёт или договор, а затем создайте акт из его карточки кнопкой «Создать на основании».
          </p>
          <button onClick={onInvoice} className="text-xs font-medium text-primary hover:underline">
            Создать счёт →
          </button>
        </div>
      )}

      <button
        onClick={() => setAgreementListOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors border-t border-border/40"
      >
        <Icon name="FileSignature" size={16} className="text-primary flex-shrink-0" />
        Договор / соглашение
        <Icon name={agreementListOpen ? "ChevronUp" : "ChevronDown"} size={13} className="ml-auto text-muted-foreground" />
      </button>
      {agreementListOpen && (
        <div className="bg-amber-50/60 border-t border-border/40">
          {agreementTemplates.map((t) => (
            <button
              key={t.title}
              onClick={() => onAgreementSelect(t.title)}
              className="w-full flex items-center gap-2.5 pl-8 pr-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-100/60 transition-colors"
            >
              <Icon name={t.icon} size={15} className="text-primary flex-shrink-0" />
              {t.title}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
