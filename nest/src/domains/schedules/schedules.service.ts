import { Injectable } from '@nestjs/common';
import { DataService } from '../../data/data.service.js';
import { SchedulesDto } from './schedules.dto.js';
import { dutyLabel, remainingDuties, specDutyCode } from './schedule.rules.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly data: DataService) {}

  month(year: string, month: string): SchedulesDto {
    const prefix = `${year}-${month}`;
    return {
      year: Number(year),
      month: Number(month),
      legend: this.data.legend.map((entry) => ({
        ...entry,
        code: specDutyCode(entry.code),
      })),
      schedules: this.data.schedules
        .filter((row) => row.duty_date.startsWith(prefix))
        .map((row) => {
          const duty = { ...row, duty_type: specDutyCode(row.duty_type) };
          return {
            ...duty,
            label: dutyLabel(duty),
            remaining: remainingDuties(row),
          };
        }),
    };
  }
}
