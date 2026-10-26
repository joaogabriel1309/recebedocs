import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller.js';
import { DocumentosService } from './documentos.service.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [StorageModule],
  controllers: [DocumentosController],
  providers: [DocumentosService]
})
export class DocumentosModule { }
