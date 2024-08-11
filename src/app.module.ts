import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlGeneratorModule } from 'nestjs-url-generator';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || undefined,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
      entities: [__dirname + '/Entity/*.{ts,js}'],
    }),
    UrlGeneratorModule.forRoot({
      secret: process.env.APP_KEY,
      appUrl: process.env.APP_URL,
    }),
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
