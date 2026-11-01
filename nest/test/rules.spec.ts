import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { addDays, daysBetween, isIsoDate } from '../src/common/dates.js';
import { documentStatus } from '../src/domains/documents/document.rules.js';
import {
  rollingSeries,
  windowSum,
} from '../src/domains/flight-hours/rolling.rules.js';
import {
  dutyLabel,
  remainingDuties,
  specDutyCode,
} from '../src/domains/schedules/schedule.rules.js';

const TODAY = '2026-05-15';
const read = (name: string) =>
  JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'));
const flight = read('mock-flight-hours.json');
const documents = read('mock-documents.json');
const hoursByDate = new Map<string, number>(
  flight.flightHours.map((row: { date: string; hours: number }) => [
    row.date,
    row.hours,
  ]),
);

describe('dates', () => {
  it('counts whole days, adds days in UTC, and rejects impossible dates', () => {
    expect(daysBetween('2026-05-31', '2026-06-11')).toBe(11);
    expect(daysBetween('2026-05-31', '2026-05-29')).toBe(-2);
    expect(addDays('2026-05-31', 1)).toBe('2026-06-01');
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
  });
});

describe('documentStatus', () => {
  it('treats 0 days as expired, 30 as soon and 31 as safe', () => {
    expect(documentStatus('2026-05-15', TODAY, 30).status).toBe('expired');
    expect(documentStatus('2026-06-14', TODAY, 30).status).toBe('soon');
    expect(documentStatus('2026-06-15', TODAY, 30).status).toBe('safe');
  });

  it('gives 152 safe, 224 safe, 14 soon, 27 soon and -14 expired at 15 May', () => {
    const got = documents.documents.map((doc: { expiryDate: string }) =>
      documentStatus(doc.expiryDate, TODAY, documents.thresholds.warningDays),
    );
    expect(got).toEqual([
      { daysRemaining: 152, status: 'safe' },
      { daysRemaining: 224, status: 'safe' },
      { daysRemaining: 14, status: 'soon' },
      { daysRemaining: 27, status: 'soon' },
      { daysRemaining: -14, status: 'expired' },
    ]);
  });
});

describe('rolling sums', () => {
  it('the 1W series runs 8 to 22 May and is projected from 16 May', () => {
    const series = rollingSeries(hoursByDate, TODAY, 7);
    expect(series.map((p) => p.hours)).toEqual([
      15.0, 15.0, 16.6, 12.6, 16.3, 22.2, 24.0, 25.2, 31.4, 36.4, 42.8, 44.0,
      44.7, 42.7, 36.3,
    ]);
    expect(series[0].date).toBe('2026-05-08');
    expect(series[14].date).toBe('2026-05-22');
    expect(series.map((p) => p.projected)).toEqual([
      ...Array(8).fill(false),
      ...Array(7).fill(true),
    ]);
  });

  it('the 1M series starts at 102.2 and its centre equals the monthly card', () => {
    const series = rollingSeries(hoursByDate, TODAY, 30);
    expect(series[0].hours).toBe(102.2);
    expect(series[7].hours).toBe(87.2);
  });

  it('the limit cards at 15 May are 6.4, 25.2, 87.2 and 1013.8', () => {
    expect(
      [1, 7, 30, 365].map((days) => windowSum(hoursByDate, TODAY, days)),
    ).toEqual([6.4, 25.2, 87.2, 1013.8]);
  });

  it('counts missing days as zero and includes the end day', () => {
    expect(windowSum(new Map([['2026-05-01', 5]]), '2026-05-02', 2)).toBe(5);
    expect(windowSum(new Map([['2026-05-02', 5]]), '2026-05-02', 1)).toBe(5);
  });

  it('a 30-day window includes day -29 and excludes day -30', () => {
    const edge = new Map([
      ['2026-04-16', 1],
      ['2026-04-15', 10],
    ]);
    expect(windowSum(edge, TODAY, 30)).toBe(1);
  });
});

describe('schedule rules', () => {
  it('labels DUTY days with the base and other days with the duty type', () => {
    expect(dutyLabel({ duty_type: 'DUTY', base_name: 'MKW' })).toBe('MKW');
    expect(dutyLabel({ duty_type: 'TX', base_name: 'CJN' })).toBe('TX');
  });

  it('remaining is scheduled minus logged, never below zero', () => {
    expect(remainingDuties({ count_schedules: 6, count_logbooks: 6 })).toBe(0);
    expect(remainingDuties({ count_schedules: 5, count_logbooks: 2 })).toBe(3);
    expect(remainingDuties({ count_schedules: 1, count_logbooks: 3 })).toBe(0);
  });

  it('maps data duty codes to spec codes and passes others through', () => {
    expect(specDutyCode('DTY')).toBe('DUTY');
    expect(specDutyCode('RLV')).toBe('RL');
    expect(specDutyCode('TRD')).toBe('TR');
    expect(specDutyCode('TRX')).toBe('TX');
    expect(specDutyCode('ULV')).toBe('UL');
    expect(specDutyCode('SCK')).toBe('SCK');
  });
});

describe('loadConfig', () => {
  it('defaults to TODAY 2026-05-15, port 3001, an 8h token and a non-Secure cookie outside production', () => {
    expect(loadConfig({})).toMatchObject({
      port: 3001,
      today: '2026-05-15',
      jwtTtl: '8h',
      cookieSecure: false,
      publicUrl: 'http://localhost:3001',
    });
  });

  it('requires JWT_SECRET in production and makes the cookie Secure there', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(
      'JWT_SECRET is required',
    );
    expect(
      loadConfig({
        NODE_ENV: 'production',
        JWT_SECRET: 's3cret',
        LOGIN_USERNAME: 'ops',
        LOGIN_PASSWORD: 'pw',
      }).cookieSecure,
    ).toBe(true);
  });

  it('requires LOGIN_USERNAME and LOGIN_PASSWORD in production, and keeps the test login elsewhere', () => {
    const production = { NODE_ENV: 'production', JWT_SECRET: 's3cret' };
    expect(() => loadConfig(production)).toThrow(
      'LOGIN_USERNAME and LOGIN_PASSWORD are required',
    );
    expect(() => loadConfig({ ...production, LOGIN_USERNAME: 'ops' })).toThrow(
      'LOGIN_USERNAME and LOGIN_PASSWORD are required',
    );
    expect(
      loadConfig({
        ...production,
        LOGIN_USERNAME: 'ops',
        LOGIN_PASSWORD: 'pw',
      }),
    ).toMatchObject({ loginUsername: 'ops', loginPassword: 'pw' });
    expect(loadConfig({})).toMatchObject({
      loginUsername: 'johndoe',
      loginPassword: 'susiairtest',
    });
  });

  it('rejects a malformed TODAY or JWT_TTL', () => {
    expect(() => loadConfig({ TODAY: '15/05/2026' })).toThrow(
      'TODAY must be YYYY-MM-DD',
    );
    expect(() => loadConfig({ JWT_TTL: 'eight hours' })).toThrow(
      'JWT_TTL must look like',
    );
  });
});
