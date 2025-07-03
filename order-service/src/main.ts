import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thêm global prefix /api
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:5173'],
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Orders Service API')
    .setDescription('API documentation for Orders Management Microservice')
    .setVersion('1.0')
    .addTag('orders', 'Quản lý đơn hàng')
    .addTag('payments', 'Tích hợp thanh toán')
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
