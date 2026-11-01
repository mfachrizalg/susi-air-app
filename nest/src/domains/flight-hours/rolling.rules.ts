import { addDays } from '../../common/dates.js';

/** Chart points run from today-7 to today+7: 15 bars. */
export const HALF_SPAN_DAYS = 7;

export interface RollingPoint {
  date: string;
  hours: number;
  /** True after today. These hours are planned, not yet flown (D3). */
  projected: boolean;
}

/** Hours in the `days` days ending on `end` (end included). Missing days count as 0. Rounded to 0.1 h. */
export function windowSum(
  hoursByDate: ReadonlyMap<string, number>,
  end: string,
  days: number,
): number {
  let sum = 0;
  for (let back = 0; back < days; back++)
    sum += hoursByDate.get(addDays(end, -back)) ?? 0;
  return Math.round(sum * 10) / 10;
}

/** One rolling sum per day from today-7 to today+7, each over `windowDays` ending on its own date. */
export function rollingSeries(
  hoursByDate: ReadonlyMap<string, number>,
  today: string,
  windowDays: number,
): RollingPoint[] {
  const points: RollingPoint[] = [];
  for (let offset = -HALF_SPAN_DAYS; offset <= HALF_SPAN_DAYS; offset++) {
    const date = addDays(today, offset);
    points.push({
      date,
      hours: windowSum(hoursByDate, date, windowDays),
      projected: date > today,
    });
  }
  return points;
}
