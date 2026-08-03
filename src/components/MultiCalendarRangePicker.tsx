import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { useLanguage } from "@/i18n/language-context";
import {
  CALENDAR_SYSTEMS,
  formatDayNumber,
  formatMonthCaption,
  type CalendarSystem,
} from "@/lib/calendar-system";

const SYSTEM_LABEL: Record<CalendarSystem, "calendar.gregorian" | "calendar.jalali" | "calendar.hijri"> = {
  gregory: "calendar.gregorian",
  persian: "calendar.jalali",
  "islamic-umalqura": "calendar.hijri",
};

interface MultiCalendarRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  system: CalendarSystem;
  onSystemChange: (system: CalendarSystem) => void;
}

/** Range picker that renders the same Gregorian dates in Jalali, Gregorian or Hijri. */
const MultiCalendarRangePicker = ({
  value,
  onChange,
  system,
  onSystemChange,
}: MultiCalendarRangePickerProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label={t("booking.calendarSystem")}
        className="inline-flex rounded-md border border-border p-0.5 bg-background"
      >
        {CALENDAR_SYSTEMS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === system}
            data-testid={`calendar-system-${option}`}
            onClick={() => onSystemChange(option)}
            className={`px-3 py-1.5 rounded-[5px] text-[11px] uppercase tracking-wider transition-colors ${
              option === system
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(SYSTEM_LABEL[option])}
          </button>
        ))}
      </div>

      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={1}
        className="rounded-md border-border shadow-soft text-sm pointer-events-auto"
        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        formatters={{
          formatDay: (date) => formatDayNumber(date, language, system),
          formatCaption: (date) => formatMonthCaption(date, language, system),
        }}
      />
    </div>
  );
};

export default MultiCalendarRangePicker;
