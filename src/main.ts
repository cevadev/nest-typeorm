import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Activamos la transformacion de forma implicita
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        //habilitamos la conversion implicita para el caso de la paginacion donde en lugar de query params
        //enviamos un DTO pero los parametro de limit y offset vienen como string
        //esta propiedad hace que implicitamente se conviertan a numero
        enableImplicitConversion: true,
      },
    }),
  );

  //activamos la serializacion
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('PLATZI STORE')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
