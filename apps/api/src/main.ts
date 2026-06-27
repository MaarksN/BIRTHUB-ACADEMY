import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './modules/app.module';
import { ApiExceptionFilter } from './modules/common/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.use((request: Request & { requestId?: string }, response: Response, next: NextFunction) => {
    const incoming = request.header('x-request-id');
    request.requestId = incoming && incoming.length <= 128 ? incoming : crypto.randomUUID();
    response.setHeader('x-request-id', request.requestId);
    next();
  });
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Inside Sales IA Automação API')
    .setDescription('API REST para LMS multi-tenant, progresso, quizzes, IA simulada, automações e certificados.')
    .setVersion('0.1.0')
    .addCookieAuth('inside_session')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(Number(process.env.PORT ?? 3333));
}

void bootstrap();
