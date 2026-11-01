import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ApiEnvelope } from '../../common/api-envelope.decorators.js';
import { PilotMeDto } from './pilot.dto.js';
import { PilotService } from './pilot.service.js';

@ApiCookieAuth()
@ApiBearerAuth()
@Controller('pilot')
export class PilotController {
  constructor(private readonly pilot: PilotService) {}

  @Get('me')
  @ApiEnvelope(PilotMeDto)
  me(): PilotMeDto {
    return this.pilot.me();
  }
}
