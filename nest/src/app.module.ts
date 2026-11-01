import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller.js';
import { AuthModule } from './domains/auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { type AppConfig, CONFIG } from './config.js';
import { DataModule } from './data/data.module.js';
import { DocumentsModule } from './domains/documents/documents.module.js';
import { FlightHoursModule } from './domains/flight-hours/flight-hours.module.js';
import { PilotModule } from './domains/pilot/pilot.module.js';
import { SchedulesModule } from './domains/schedules/schedules.module.js';

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
  controllers: [AppController],
})
export class AppModule {}
