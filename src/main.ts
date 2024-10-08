import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { json, urlencoded } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    urlencoded({ limit: '10mb', extended: true, parameterLimit: 1000000 }),
  );

  app.use(json({ limit: '10mb' }));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('twig');

  app.enableCors({
    origin: ['https://www.speedscope.app'],
  });

  await app.listen(3000);
}

bootstrap();
