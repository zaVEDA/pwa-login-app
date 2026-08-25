import Icon from "@/components/ui/icon";
import CreateDocMenu from "@/components/app/CreateDocMenu";
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
  const closeMenu = () => setShowTemplatePicker(false);

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
              <CreateDocMenu
                onPersonalData={() => { closeMenu(); setNewAgreementDoc(PERSONAL_DATA_TITLE); }}
                onInvoice={() => { closeMenu(); setShowInvoice(true); }}
                onAgreementSelect={(title) => { closeMenu(); setNewAgreementDoc(title); }}
              />
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