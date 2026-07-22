// Single source of truth for date formatting shared across screens.
export function toDateKey(input: Date | string = new Date()): string {
  return new Date(input).toISOString().slice(0, 10);
}

export function formatDisplayDate(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7); // YYYY-MM
}
