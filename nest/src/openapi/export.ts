import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { configureApp, swaggerDocument } from '../app-config.js';
import { AppModule } from '../app.module.js';

// No database: the data is read from nest/data when the module is created, so this runs anywhere.
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  logger: ['error'],
});
configureApp(app);
const doc = SwaggerModule.createDocument(app, swaggerDocument());
writeFileSync(
  new URL('../../openapi.json', import.meta.url),
  `${JSON.stringify(doc, null, 2)}\n`,
);
await app.close();
console.log('wrote openapi.json');
