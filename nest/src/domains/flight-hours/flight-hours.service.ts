import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { addDays, daysBetween, isIsoDate } from '../../common/dates.js';
import { type AppConfig, CONFIG } from '../../config.js';
import {
  DataService,
  type LimitKey,
  type RangeKey,
} from '../../data/data.service.js';
import {
  FlightHourDto,
  FlightHoursSummaryDto,
  SummaryCardDto,
} from './flight-hours.dto.js';
import { rollingSeries, windowSum } from './rolling.rules.js';

/** Longest `/flight-hours` span, counted inclusively (a leap year is 366 days). */
const MAX_SPAN_DAYS = 366;

/** Limit cards: each sums the days ending on today. */
const CARDS: Record<LimitKey, { label: string; days: number }> = {
  daily: { label: 'Daily', days: 1 },
  weekly: { label: 'Weekly', days: 7 },
  monthly: { label: 'Monthly', days: 30 },
  annual: { label: 'Annual', days: 365 },
};

@Injectable()
export class FlightHoursService {
  private readonly hoursByDate: ReadonlyMap<string, number>;

  constructor(
    private readonly data: DataService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {
    this.hoursByDate = new Map<string, number>(
      data.flightHours.map((row) => [row.date, row.hours]),
    );
  }

  list(from: string, to: string): FlightHourDto[] {
    if (!isIsoDate(from) || !isIsoDate(to))
      throw new BadRequestException('from and to must be valid dates');
    const span = daysBetween(from, to);
    if (span < 0) throw new BadRequestException('from must be on or before to');
    if (span + 1 > MAX_SPAN_DAYS)
      throw new BadRequestException(
        `The range may span at most ${MAX_SPAN_DAYS} days`,
      );

    const rows: FlightHourDto[] = [];
    for (let date = from; date <= to; date = addDays(date, 1)) {
      rows.push({ date, hours: this.hoursByDate.get(date) ?? 0 });
    }
    return rows;
  }

  summary(range: RangeKey): FlightHoursSummaryDto {
    const bounds = this.data.chartBounds[range];
    const today = this.config.today;
    const cards: SummaryCardDto[] = (Object.keys(CARDS) as LimitKey[]).map(
      (key) => ({
        key,
        label: CARDS[key].label,
        hours: windowSum(this.hoursByDate, today, CARDS[key].days),
        limit: this.data.limits[key],
      }),
    );
    return {
      range,
      limit: bounds.limit,
      max: bounds.max,
      windowDays: bounds.windowDays,
      points: rollingSeries(this.hoursByDate, today, bounds.windowDays),
      cards,
    };
  }
}
