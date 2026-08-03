// Tri-calendar support: Gregorian, Jalali (Persian) and Hijri (Islamic).
// All dates stay as native Gregorian `Date` objects; only the presentation
// layer switches calendar systems via `Intl`.

export type CalendarSystem = "gregory" | "persian" | "islamic-umalqura";

export const CALENDAR_SYSTEMS: CalendarSystem[] = ["gregory", "persian", "islamic-umalqura"];

const PREFERRED_LOCALE: Record<CalendarSystem, string> = {
  gregory: "en",
  persian: "fa-IR",
  "islamic-umalqura": "ar-SA",
};

/** Picks a sensible default calendar for a visitor language. */
export const defaultCalendarForLanguage = (language: string): CalendarSystem => {
  const base = language.split("-")[0];
  if (base === "fa") return "persian";
  if (base === "ar" || base === "ur" || base === "ps") return "islamic-umalqura";
  return "gregory";
};

const buildLocale = (language: string, system: CalendarSystem): string => {
  const base = system === "gregory" ? language || "en" : PREFERRED_LOCALE[system];
  return `${base}-u-ca-${system}`;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (
  language: string,
  system: CalendarSystem,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const locale = buildLocale(language, system);
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
};

export const formatDayNumber = (date: Date, language: string, system: CalendarSystem): string =>
  getFormatter(language, system, { day: "numeric" }).format(date);

export const formatMonthCaption = (date: Date, language: string, system: CalendarSystem): string =>
  getFormatter(language, system, { month: "long", year: "numeric" }).format(date);

export const formatFullDate = (date: Date, language: string, system: CalendarSystem): string =>
  getFormatter(language, system, { day: "numeric", month: "long", year: "numeric" }).format(date);

export const formatShortDate = (date: Date, language: string, system: CalendarSystem): string =>
  getFormatter(language, system, { day: "numeric", month: "short" }).format(date);

export const formatDateRange = (
  from: Date | undefined,
  to: Date | undefined,
  language: string,
  system: CalendarSystem,
): string => {
  if (!from) return "";
  if (!to) return formatFullDate(from, language, system);
  return `${formatShortDate(from, language, system)} – ${formatFullDate(to, language, system)}`;
};
