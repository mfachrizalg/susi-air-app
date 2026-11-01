import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class SchedulesQueryDto {
  @ApiProperty({ example: '2026', description: 'Four digits.' })
  @Matches(/^\d{4}$/)
  year!: string;

  @ApiProperty({ example: '05', description: '01 to 12.' })
  @Matches(/^(0[1-9]|1[0-2])$/)
  month!: string;
}

export class LegendEntryDto {
  @ApiProperty({ example: 'TRX' })
  code!: string;

  @ApiProperty({ example: 'Training' })
  label!: string;

  @ApiProperty({ example: '#F59E0B' })
  color!: string;
}

export class ScheduleDto {
  @ApiProperty({ example: '97027' })
  id!: string;

  @ApiProperty({ format: 'date', example: '2026-05-15' })
  duty_date!: string;

  @ApiProperty({
    example: 1,
    description: 'Raw value from the file: 1 pending, 2 completed.',
  })
  status!: number;

  @ApiProperty({ example: 'MKW' })
  base_name!: string;

  @ApiProperty({
    example: '#10B981',
    description: 'Fill colour of the day cell.',
  })
  base_color!: string;

  @ApiProperty({ example: 'DTY' })
  duty_type!: string;

  @ApiProperty({
    example: 6,
    description: 'Planned flights or duties for the day.',
  })
  count_schedules!: number;

  @ApiProperty({ example: 6, description: 'Flights or duties already logged.' })
  count_logbooks!: number;

  @ApiProperty({
    example: 'MKW',
    description: 'base_name on DTY days, duty_type otherwise.',
  })
  label!: string;

  @ApiProperty({
    example: 0,
    description: 'max(0, count_schedules - count_logbooks).',
  })
  remaining!: number;
}

export class SchedulesDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 5 })
  month!: number;

  @ApiProperty({ type: [LegendEntryDto] })
  legend!: LegendEntryDto[];

  @ApiProperty({
    type: [ScheduleDto],
    description: 'Rows for the month, in file order.',
  })
  schedules!: ScheduleDto[];
}
