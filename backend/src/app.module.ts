import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DocumentosModule } from './documentos/documentos.module.js';

@Module({
  imports: [DocumentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
