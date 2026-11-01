import { daysBetween } from '../../common/dates.js';

export type ExpiryStatus = 'safe' | 'soon' | 'expired';

export function documentStatus(
  expiryDate: string,
  today: string,
  warningDays: number,
): { daysRemaining: number; status: ExpiryStatus } {
  const daysRemaining = daysBetween(today, expiryDate);
  if (daysRemaining <= 0) return { daysRemaining, status: 'expired' };
  if (daysRemaining <= warningDays) return { daysRemaining, status: 'soon' };
  return { daysRemaining, status: 'safe' };
}
