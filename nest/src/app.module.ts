import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { type AppConfig, CONFIG } from './config.js';
import { DataModule } from './data/data.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { FlightHoursModule } from './flight-hours/flight-hours.module.js';
import { PilotModule } from './pilot/pilot.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';

/** Composition root. Global wiring comes from CommonModule, DataModule and the global JwtModule. */
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtTtl, algorithm: 'HS256' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
    CommonModule,
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
})
export class AppModule {}
