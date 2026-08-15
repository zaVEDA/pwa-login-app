import { useState } from "react";
import Icon from "@/components/ui/icon";
import { templates } from "../constants";
import DocsFilters from "./DocsFilters";
import type { DateRange } from "react-day-picker";

const PERSONAL_DATA_TITLE = "Согласие на обработку персональных данных";

interface Props {
  docFilter: string;
  setDocFilter: (v: string) => void;
  showTemplatePicker: boolean;
  setShowTemplatePicker: (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowInvoice: (v: boolean) => void;
  setNewAgreementDoc: (v: string | null) => void;

  dateRange: DateRange | undefined;
  setDateRange: (v: DateRange | undefined) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (v: boolean) => void;
  dateFilterLabel: string;
  clientFilter: string;
  setClientFilter: (v: string) => void;
  clientPickerOpen: boolean;
  setClientPickerOpen: (v: boolean) => void;
  clientOptions: string[];
}

export default function DocsTabHeader({
  docFilter,
  setDocFilter,
  showTemplatePicker,
  setShowTemplatePicker,
  setShowInvoice,
  setNewAgreementDoc,
  dateRange,
  setDateRange,
  datePickerOpen,
  setDatePickerOpen,
  dateFilterLabel,
  clientFilter,
  setClientFilter,
  clientPickerOpen,
  setClientPickerOpen,
  clientOptions,
}: Props) {
  const [actHintOpen, setActHintOpen] = useState(false);
  const [agreementListOpen, setAgreementListOpen] = useState(false);

  const closeMenu = () => {
    setShowTemplatePicker(false);
    setActHintOpen(false);
    setAgreementListOpen(false);
  };

  const agreementTemplates = templates.filter((t) => t.title !== PERSONAL_DATA_TITLE);

  return (
    <>
      <div className="flex items-center justify-between gap-2 relative">
        <h2 className="font-cormorant text-2xl font-semibold flex-1 min-w-0 truncate">Мои документы</h2>
        <button
          onClick={() => setShowTemplatePicker((v) => !v)}
          className="flex-shrink-0 flex items-center gap-1.5 pl-3.5 pr-4 py-2.5 rounded-xl gold-gradient shadow-sm active:scale-95 transition-transform"
        >
          <Icon name="Plus" size={18} className="text-white flex-shrink-0" />
          <span className="text-sm font-semibold text-white whitespace-nowrap">Создать документ</span>
        </button>

        {showTemplatePicker && (
          <>
            <div className="fixed inset-0 z-30" onClick={closeMenu} />
            <div className="absolute right-0 top-14 z-40 w-80 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in max-h-[70vh] overflow-y-auto">
              <p className="px-3.5 pt-2.5 pb-1 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                Выберите вид документа
              </p>

              <button
                onClick={() => { closeMenu(); setNewAgreementDoc(PERSONAL_DATA_TITLE); }}
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
                onClick={() => { closeMenu(); setShowInvoice(true); }}
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
                  <button
                    onClick={() => { closeMenu(); setShowInvoice(true); }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
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
                      onClick={() => { closeMenu(); setNewAgreementDoc(t.title); }}
                      className="w-full flex items-center gap-2.5 pl-8 pr-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-100/60 transition-colors"
                    >
                      <Icon name={t.icon} size={15} className="text-primary flex-shrink-0" />
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <DocsFilters
        docFilter={docFilter}
        setDocFilter={setDocFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        datePickerOpen={datePickerOpen}
        setDatePickerOpen={setDatePickerOpen}
        dateFilterLabel={dateFilterLabel}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        clientPickerOpen={clientPickerOpen}
        setClientPickerOpen={setClientPickerOpen}
        clientOptions={clientOptions}
      />
    </>
  );
}