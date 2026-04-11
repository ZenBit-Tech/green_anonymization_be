import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DEFAULT_FRONTEND_ORIGIN, DEFAULT_PORT } from '@common/constants';
import ThrottlerExceptionFilter from '@common/filters/throttler-exception.filter';
import AppModule from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Anonymizer Backend API')
    .setDescription(
      'API documentation for the backend of out data anonymizer app',
    )
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const configService = new ConfigService();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      configService.getOrThrow<string>('FRONTEND_ORIGIN') ??
        DEFAULT_FRONTEND_ORIGIN,
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  });
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  await app.listen(configService.getOrThrow<number>('PORT') ?? DEFAULT_PORT);
}

bootstrap().catch(() => {
  process.exit(1);
});
