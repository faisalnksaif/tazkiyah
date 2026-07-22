// Single source of truth for date formatting shared across screens.

// India does not observe DST, so a fixed offset is safe (no timezone
// database / Intl dependency needed).
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Normalize a Date/string to a YYYY-MM-DD string, using IST (UTC+5:30) as the day boundary. */
export function toDateKey(input: Date | string = new Date()): string {
  const shifted = new Date(new Date(input).getTime() + IST_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

export function formatDisplayDate(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7); // YYYY-MM
}
