/** Spec duty code for each data code in mock-schedules.json, matched by list order. */
const SPEC_DUTY_CODES: Partial<Record<string, string>> = {
  DTY: 'DUTY',
  RLV: 'RL',
  TRD: 'TR',
  TRX: 'TX',
  ULV: 'UL',
};

/** Maps a data duty code to its spec code. Codes not listed pass through. */
export function specDutyCode(code: string): string {
  return SPEC_DUTY_CODES[code] ?? code;
}

/** The base code on DUTY days, otherwise the duty-type code (D6). */
export function dutyLabel(row: {
  duty_type: string;
  base_name: string;
}): string {
  return row.duty_type === 'DUTY' ? row.base_name : row.duty_type;
}

/** Scheduled minus logged, never below zero. Zero is shown as a tick in the UI. */
export function remainingDuties(row: {
  count_schedules: number;
  count_logbooks: number;
}): number {
  return Math.max(0, row.count_schedules - row.count_logbooks);
}
