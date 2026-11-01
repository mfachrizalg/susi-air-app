import { addDays } from '../../common/dates.js';

export const HALF_SPAN_DAYS = 7;

export interface RollingPoint {
  date: string;
  hours: number;
  projected: boolean;
}

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
