// Load apps/api/.env before anything reads process.env. dotenv never overrides
// variables already present in the shell environment, so existing setups (DB,
// JWT secrets exported elsewhere) are unaffected.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Security headers. crossOriginResourcePolicy is relaxed so uploaded media
  // served from /api/media/file can be embedded by the web app on another origin.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(cookieParser());

  // Validate and sanitize every incoming payload. whitelist drops properties
  // not declared on the DTO — this blocks mass-assignment while letting clients
  // safely round-trip server-managed fields (id, timestamps), which are simply
  // stripped rather than rejected.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: env.corsOrigins,
    credentials: true,
  });

  await app.listen(env.port);
}
bootstrap();
