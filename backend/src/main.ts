import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Seguridad
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // Configuración global
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));
  
  // Validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Documentación Swagger
  if (configService.get('SWAGGER_ENABLED', 'true') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('HotelBot API')
      .setDescription('Sistema de gestión hotelera con IA - API completa para reservas y gestión')
      .setVersion('1.0')
      .addTag('auth', 'Autenticación y autorización')
      .addTag('room-types', 'Gestión de tipos de habitación')
      .addTag('rooms', 'Gestión de habitaciones')
      .addTag('customers', 'Gestión de clientes')
      .addTag('reservations', 'Gestión de reservas')
      .addTag('meal-plans', 'Planes de comida')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 HotelBot API está ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
