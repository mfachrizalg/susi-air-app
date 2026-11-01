import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ApiEnvelope } from '../common/api-envelope.decorators.js';
import {
  FlightHourDto,
  FlightHoursQueryDto,
  FlightHoursSummaryDto,
  SummaryQueryDto,
} from './flight-hours.dto.js';
import { FlightHoursService } from './flight-hours.service.js';

@ApiCookieAuth()
@ApiBearerAuth()
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHours: FlightHoursService) {}

  @Get()
  @ApiEnvelope(FlightHourDto, { array: true })
  list(@Query() query: FlightHoursQueryDto): FlightHourDto[] {
    return this.flightHours.list(query.from, query.to);
  }

  @Get('summary')
  @ApiEnvelope(FlightHoursSummaryDto)
  summary(@Query() query: SummaryQueryDto): FlightHoursSummaryDto {
    return this.flightHours.summary(query.range);
  }
}
