import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptors/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); //integration of pipes globally
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({ origin: true, credentials: true }); //cors enabling
  app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 })); // upload requirements
  app.use('./uploads', express.static('./uploads')); // opening this folder for everyone
  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
