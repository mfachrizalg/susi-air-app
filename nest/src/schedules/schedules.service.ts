import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service.js';
import { SchedulesDto } from './schedules.dto.js';
import { dutyLabel, remainingDuties } from './schedule.rules.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly data: DataService) {}

  month(year: string, month: string): SchedulesDto {
    const prefix = `${year}-${month}`;
    return {
      year: Number(year),
      month: Number(month),
      legend: [...this.data.legend],
      schedules: this.data.schedules
        .filter((row) => row.duty_date.startsWith(prefix))
        .map((row) => ({
          ...row,
          label: dutyLabel(row),
          remaining: remainingDuties(row),
        })),
    };
  }
}
