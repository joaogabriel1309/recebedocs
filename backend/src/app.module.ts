import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DocumentosModule } from './documentos/documentos.module.js';
import { StorageModule } from './storage/storage.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DocumentosModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
