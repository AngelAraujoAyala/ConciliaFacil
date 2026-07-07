import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // rawBody: true es CRITICO para que Stripe pueda verificar la firma del webhook.
  // Sin esto, req.rawBody es undefined y constructEvent() falla silenciosamente,
  // impidiendo que se procese el evento y se actualice la BD.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // El webhook de Stripe necesita estar fuera del prefijo /api porque el CLI
  // y el Dashboard de Stripe envian los eventos a una URL fija sin ese prefijo.
  app.setGlobalPrefix('api', {
    exclude: ['billing/webhook'],
  });

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
