import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ApiEnvelope } from '../common/api-envelope.decorators.js';
import { SchedulesDto, SchedulesQueryDto } from './schedules.dto.js';
import { SchedulesService } from './schedules.service.js';

@ApiCookieAuth()
@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  @ApiEnvelope(SchedulesDto)
  month(@Query() query: SchedulesQueryDto): SchedulesDto {
    return this.schedules.month(query.year, query.month);
  }
}
