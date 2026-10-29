import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller.js';
import { DocumentosService } from './documentos.service.js';
import { StorageModule } from '../storage/storage.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminGuard } from '../admin/admin.guard.js';
import { AnaliseModule } from '../analise/analise.module.js';

@Module({
  imports: [StorageModule, PrismaModule, AuthModule, AnaliseModule],
  controllers: [DocumentosController],
  providers: [DocumentosService, AdminGuard]
})
export class DocumentosModule { }
