import { Global, Module } from '@nestjs/common';
import { DataService } from './data.service.js';

/** Global so every feature can read the in-memory data without importing this module. */
@Global()
@Module({
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
