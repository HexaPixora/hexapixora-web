// Load apps/api/.env before anything reads process.env. dotenv never overrides
// variables already present in the shell environment, so existing setups (DB,
// JWT secrets exported elsewhere) are unaffected.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { env } from './config/env';
import { corsOrigin } from './config/cors';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // Raise the JSON body limit above Express's 100kb default: page-builder saves
  // serialize a whole page's module tree, which can exceed it. (File uploads go
  // through multer with its own limit, not this parser.)
  app.useBodyParser('json', { limit: '2mb' });

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

  // Uniform error responses + no stack-trace leakage on 5xx.
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Flush Prisma connections / in-flight work cleanly on SIGTERM (Render,
  // Docker, etc. send it on deploy/restart) so requests aren't cut mid-flight.
  app.enableShutdownHooks();

  // Bind IPv4 on all interfaces. Without the explicit host, Nest binds IPv6
  // (`::`) only, so server-side fetches to http://localhost:3001 — which Node 18+
  // resolves to 127.0.0.1 (IPv4) first — get ECONNREFUSED. 0.0.0.0 also makes the
  // API reachable from other devices on the LAN.
  await app.listen(env.port, '0.0.0.0');
}
bootstrap();
