import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '../domains/auth/jwt-auth.guard.js';
import { SessionStore } from '../domains/auth/session.store.js';
import { CONFIG, loadConfig } from '../config.js';
import { EnvelopeInterceptor } from './envelope.interceptor.js';
import { HttpExceptionFilter } from './http-exception.filter.js';

@Global()
@Module({
  providers: [
    { provide: CONFIG, useFactory: () => loadConfig() },
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    SessionStore,
  ],
  exports: [CONFIG, SessionStore],
})
export class CommonModule {}
