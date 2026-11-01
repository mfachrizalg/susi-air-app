/** The base code on DTY days, otherwise the duty-type code (D6). */
export function dutyLabel(row: {
  duty_type: string;
  base_name: string;
}): string {
  return row.duty_type === 'DTY' ? row.base_name : row.duty_type;
}

/** Scheduled minus logged, never below zero. Zero is shown as a tick in the UI. */
export function remainingDuties(row: {
  count_schedules: number;
  count_logbooks: number;
}): number {
  return Math.max(0, row.count_schedules - row.count_logbooks);
}
