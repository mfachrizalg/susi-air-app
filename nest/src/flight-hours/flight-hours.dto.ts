import { ApiProperty } from '@nestjs/swagger';
import { IsIn, Matches } from 'class-validator';
import type { LimitKey, RangeKey } from '../data/data.service.js';

export const RANGES = ['1w', '1m', '3m', '6m', '1y'] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class FlightHoursQueryDto {
  @ApiProperty({
    example: '2026-05-01',
    description: 'First day, inclusive (YYYY-MM-DD).',
  })
  @Matches(DATE_PATTERN)
  from!: string;

  @ApiProperty({
    example: '2026-05-15',
    description: 'Last day, inclusive (YYYY-MM-DD). Span max 366 days.',
  })
  @Matches(DATE_PATTERN)
  to!: string;
}

export class SummaryQueryDto {
  @ApiProperty({ enum: [...RANGES], example: '1w' })
  @IsIn(RANGES)
  range!: RangeKey;
}

export class FlightHourDto {
  @ApiProperty({ format: 'date', example: '2026-05-15' })
  date!: string;

  @ApiProperty({ example: 6.4 })
  hours!: number;
}

export class SummaryPointDto {
  @ApiProperty({ format: 'date', example: '2026-05-08' })
  date!: string;

  @ApiProperty({ example: 15 })
  hours!: number;

  @ApiProperty({ description: 'True after today. The hours are planned.' })
  projected!: boolean;
}

export class SummaryCardDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'annual'] })
  key!: LimitKey;

  @ApiProperty({ example: 'Weekly' })
  label!: string;

  @ApiProperty({ example: 25.2 })
  hours!: number;

  @ApiProperty({ example: 40 })
  limit!: number;
}

export class FlightHoursSummaryDto {
  @ApiProperty({ enum: [...RANGES], example: '1w' })
  range!: RangeKey;

  @ApiProperty({ example: 40, description: 'Limit for the selected range.' })
  limit!: number;

  @ApiProperty({ example: 45, description: 'Top of the chart axis.' })
  max!: number;

  @ApiProperty({
    example: 7,
    description: 'Length of each rolling window in days.',
  })
  windowDays!: number;

  @ApiProperty({ type: [SummaryPointDto] })
  points!: SummaryPointDto[];

  @ApiProperty({ type: [SummaryCardDto] })
  cards!: SummaryCardDto[];
}
