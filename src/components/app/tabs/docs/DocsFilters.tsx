import Icon from "@/components/ui/icon";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

interface Props {
  docFilter: string;
  setDocFilter: (f: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (r: DateRange | undefined) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (v: boolean) => void;
  dateFilterLabel: string;
  clientFilter: string;
  setClientFilter: (v: string) => void;
  clientPickerOpen: boolean;
  setClientPickerOpen: (v: boolean) => void;
  clientOptions: string[];
}

export default function DocsFilters({
  docFilter,
  setDocFilter,
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
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        {["Все", "Счета", "Акты", "Накладные", "Черновики"].map((f) => (
          <button
            key={f}
            onClick={() => setDocFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              docFilter === f
                ? "gold-gradient text-white border-transparent"
                : "bg-white/60 border-border text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Доп. фильтры: по дате и по клиенту */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                dateRange?.from ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/60 border-border text-foreground"
              }`}
            >
              <Icon name="CalendarDays" size={13} />
              {dateFilterLabel}
              {dateRange?.from && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }}
                  className="ml-0.5"
                >
                  <Icon name="X" size={12} />
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              defaultMonth={dateRange?.from}
            />
            {dateRange?.from && (
              <button
                onClick={() => { setDateRange(undefined); setDatePickerOpen(false); }}
                className="w-full mt-1 py-2 rounded-lg text-xs text-muted-foreground hover:bg-amber-50 transition-colors"
              >
                Сбросить дату
              </button>
            )}
          </PopoverContent>
        </Popover>

        <Popover open={clientPickerOpen} onOpenChange={setClientPickerOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all max-w-[160px] ${
                clientFilter ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/60 border-border text-foreground"
              }`}
            >
              <Icon name="User" size={13} className="flex-shrink-0" />
              <span className="truncate">{clientFilter || "Клиент"}</span>
              {clientFilter && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); setClientFilter(""); }}
                  className="flex-shrink-0"
                >
                  <Icon name="X" size={12} />
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1 max-h-64 overflow-y-auto" align="start">
            {clientOptions.length === 0 && (
              <p className="text-xs text-muted-foreground px-2.5 py-2">Пока нет клиентов</p>
            )}
            {clientOptions.map((name) => (
              <button
                key={name}
                onClick={() => { setClientFilter(name); setClientPickerOpen(false); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                  clientFilter === name ? "bg-primary/10 text-primary font-medium" : "hover:bg-amber-50 text-foreground"
                }`}
              >
                {name}
                {clientFilter === name && <Icon name="Check" size={13} className="ml-auto" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
