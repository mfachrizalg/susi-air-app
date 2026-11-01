import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { type AppConfig, CONFIG, TOKEN_COOKIE } from './config.js';

export const swaggerDocument = () =>
  new DocumentBuilder()
    .setTitle('Susi Air Pilot API')
    .setVersion('1.0.0')
    .addCookieAuth(TOKEN_COOKIE)
    .addBearerAuth()
    .build();

/** Shared by main.ts and the e2e tests, so both get the same pipes, cookies and routes. */
export function configureApp(app: NestExpressApplication): void {
  const { corsOrigins } = app.get<AppConfig>(CONFIG);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(cookieParser());
  app.useStaticAssets(join(import.meta.dirname, '..', 'assets'), {
    prefix: '/assets',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerDocument()),
    { raw: false },
  );
}
