import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';

export interface LegendEntry {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleRow {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface DocumentRecord {
  id: string;
  label: string;
  expiryDate: string;
}

export interface FlightHourRecord {
  date: string;
  hours: number;
}

export interface ChartBound {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export type LimitKey = 'daily' | 'weekly' | 'monthly' | 'annual';
export type RangeKey = '1w' | '1m' | '3m' | '6m' | '1y';

interface SchedulesFile {
  legend: LegendEntry[];
  schedules: ScheduleRow[];
}

interface DocumentsFile {
  thresholds: { warningDays: number };
  documents: DocumentRecord[];
}

interface FlightHoursFile {
  pilot: { name: string; totalFlightHours: number };
  limits: Record<LimitKey, number>;
  chartBounds: Record<RangeKey, ChartBound>;
  flightHours: FlightHourRecord[];
}

const DATA_DIR = new URL('../../data/', import.meta.url);

/** Keys the rules read. Boot fails when one is missing, so a bad data file never serves requests. */
const REQUIRED = {
  'mock-schedules.json': ['legend', 'schedules'],
  'mock-documents.json': ['thresholds.warningDays', 'documents'],
  'mock-flight-hours.json': [
    'pilot.name',
    'pilot.totalFlightHours',
    'limits.daily',
    'limits.weekly',
    'limits.monthly',
    'limits.annual',
    'chartBounds.1w',
    'chartBounds.1m',
    'chartBounds.3m',
    'chartBounds.6m',
    'chartBounds.1y',
    'flightHours',
  ],
} as const;

function loadFile<T>(name: keyof typeof REQUIRED): T {
  const json: unknown = JSON.parse(
    readFileSync(new URL(name, DATA_DIR), 'utf8'),
  );
  for (const path of REQUIRED[name]) {
    const value = path
      .split('.')
      .reduce<unknown>(
        (node, key) => (node as Record<string, unknown> | undefined)?.[key],
        json,
      );
    if (value === undefined) throw new Error(`${name}: missing "${path}"`);
  }
  return json as T;
}

/** Loads the three mock files once, at construction. Every getter is read-only. */
@Injectable()
export class DataService {
  private readonly schedulesFile = loadFile<SchedulesFile>(
    'mock-schedules.json',
  );
  private readonly documentsFile = loadFile<DocumentsFile>(
    'mock-documents.json',
  );
  private readonly flightFile = loadFile<FlightHoursFile>(
    'mock-flight-hours.json',
  );

  get legend(): readonly LegendEntry[] {
    return this.schedulesFile.legend;
  }

  get schedules(): readonly ScheduleRow[] {
    return this.schedulesFile.schedules;
  }

  get documents(): readonly DocumentRecord[] {
    return this.documentsFile.documents;
  }

  get warningDays(): number {
    return this.documentsFile.thresholds.warningDays;
  }

  get pilot(): Readonly<{ name: string; totalFlightHours: number }> {
    return this.flightFile.pilot;
  }

  get limits(): Readonly<Record<LimitKey, number>> {
    return this.flightFile.limits;
  }

  get chartBounds(): Readonly<Record<RangeKey, ChartBound>> {
    return this.flightFile.chartBounds;
  }

  get flightHours(): readonly FlightHourRecord[] {
    return this.flightFile.flightHours;
  }
}
