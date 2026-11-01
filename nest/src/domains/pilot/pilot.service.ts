import { Inject, Injectable } from '@nestjs/common';
import { type AppConfig, CONFIG } from '../../config.js';
import { DataService } from '../../data/data.service.js';
import { PilotMeDto } from './pilot.dto.js';

@Injectable()
export class PilotService {
  constructor(
    private readonly data: DataService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  me(): PilotMeDto {
    const { name, totalFlightHours } = this.data.pilot;
    return {
      name,
      totalFlightHours,
      avatarUrl: `${this.config.publicUrl}/assets/avatar.svg`,
      today: this.config.today,
    };
  }
}
