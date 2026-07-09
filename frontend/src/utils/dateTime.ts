import { DEFAULT_TIMEZONE } from "./theme";

export function formatDateTimeInTimezone(
  date: string | Date,
  timezone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("es-MX", {
    ...options,
    timeZone: timezone,
  }).format(value);
}
