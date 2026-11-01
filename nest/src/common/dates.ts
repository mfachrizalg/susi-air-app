const DAY_MS = 86_400_000;

/** Whole days from `from` to `to` (both YYYY-MM-DD). Negative when `to` is earlier. */
export const daysBetween = (from: string, to: string): number =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS,
  );

/** Adds whole days to a YYYY-MM-DD string. */
export const addDays = (iso: string, days: number): string =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);

/** True for a real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
export const isIsoDate = (value: string): boolean => {
  const ms = Date.parse(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(ms) &&
    new Date(ms).toISOString().slice(0, 10) === value
  );
};
