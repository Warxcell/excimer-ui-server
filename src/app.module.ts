import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlGeneratorModule } from 'nestjs-url-generator';
import { ConfigModule } from '@nestjs/config';
import dataSourceOptions from './datasource';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      // synchronize: process.env.NODE_ENV !== 'production',
      synchronize: true,
      migrationsTableName: 'migrations',
      autoLoadEntities: true,
      entities: [__dirname + '/entity/*.{ts,js}'],
    }),
    UrlGeneratorModule.forRoot({
      secret: process.env.APP_KEY,
      appUrl: process.env.APP_URL,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
