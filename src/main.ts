import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validacion global usando class-validator (Tarea 2a)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger / OpenAPI (Tarea 2a: documentacion @ApiProperty)
  const config = new DocumentBuilder()
    .setTitle('Clinica Veterinaria - MVP SaaS')
    .setDescription(
      'API del MVP que implementa: DTO con class-validator (Tarea 2a), ' +
        'comunicacion sincrona vs asincrona (Tarea 2b) y patron Saga (Tarea 2c).',
    )
    .setVersion('1.0')
    .addTag('citas', 'Reserva de citas (sincrono directo)')
    .addTag('saga', 'Orquestacion del flujo completo Reservar -> Cobrar -> Confirmar')
    .addTag('notificaciones', 'Envio asincrono de recordatorios')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`API lista en http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger UI en http://localhost:${port}/docs`, 'Bootstrap');
}
bootstrap();
