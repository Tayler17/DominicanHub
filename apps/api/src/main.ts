import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Global prefix
  app.setGlobalPrefix('api');

  // API versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // CORS
  app.enableCors({
    origin: [
      configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (dev only)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Dominican Hub API')
      .setDescription('Marketplace + Logistics Orchestration Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log(`📖 Swagger docs available at http://localhost:${port}/docs`);
  }

  await app.listen(port);
  console.log(`🚀 Dominican Hub API running on http://localhost:${port}/api/v1`);
}

bootstrap();
