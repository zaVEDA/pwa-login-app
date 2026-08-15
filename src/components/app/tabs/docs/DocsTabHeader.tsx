import Icon from "@/components/ui/icon";
import { templateDocs } from "@/components/app/templates/docs";
import { templates } from "../constants";
import DocsFilters from "./DocsFilters";
import type { DateRange } from "react-day-picker";

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
  return (
    <>
      <div className="flex items-center justify-between relative">
        <h2 className="font-cormorant text-2xl font-semibold">Мои документы</h2>
        <button
          onClick={() => docFilter === "Договоры" ? setShowTemplatePicker((v) => !v) : setShowInvoice(true)}
          className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-sm"
        >
          <Icon name="Plus" size={16} className="text-white" />
        </button>

        {showTemplatePicker && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowTemplatePicker(false)} />
            <div className="absolute right-0 top-11 z-40 w-72 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-in max-h-80 overflow-y-auto">
              <p className="px-3.5 pt-2.5 pb-1 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                Новое соглашение из шаблона
              </p>
              {templates.filter((t) => templateDocs[t.title]).map((t) => (
                <button
                  key={t.title}
                  onClick={() => { setShowTemplatePicker(false); setNewAgreementDoc(t.title); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-foreground hover:bg-amber-50 transition-colors"
                >
                  <Icon name={t.icon} size={15} className="text-primary flex-shrink-0" />
                  {t.title}
                </button>
              ))}
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
