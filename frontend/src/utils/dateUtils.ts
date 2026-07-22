// Single source of truth for date formatting shared across screens.
import moment from 'moment';

const IST_OFFSET = '+05:30';

/** Normalize a Date/string to a YYYY-MM-DD string, using IST (UTC+5:30) as the day boundary. */
export function toDateKey(input: Date | string = new Date()): string {
  return moment(input).utcOffset(IST_OFFSET).format('YYYY-MM-DD');
}

export function formatDisplayDate(dateKey: string): string {
  return moment(dateKey, 'YYYY-MM-DD').format('ddd, MMM D');
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7); // YYYY-MM
}
