const SPEC_DUTY_CODES: Partial<Record<string, string>> = {
  DTY: 'DUTY',
  RLV: 'RL',
  TRD: 'TR',
  TRX: 'TX',
  ULV: 'UL',
};

export function specDutyCode(code: string): string {
  return SPEC_DUTY_CODES[code] ?? code;
}

export function dutyLabel(row: {
  duty_type: string;
  base_name: string;
}): string {
  return row.duty_type === 'DUTY' ? row.base_name : row.duty_type;
}

export function remainingDuties(row: {
  count_schedules: number;
  count_logbooks: number;
}): number {
  return Math.max(0, row.count_schedules - row.count_logbooks);
}
