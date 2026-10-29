import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller.js';
import { DocumentosService } from './documentos.service.js';
import { StorageModule } from '../storage/storage.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminGuard } from '../admin/admin.guard.js';
import { IaModule } from '../ia/ia.module.js';

@Module({
  imports: [StorageModule, PrismaModule, AuthModule, IaModule],
  controllers: [DocumentosController],
  providers: [DocumentosService, AdminGuard]
})
export class DocumentosModule { }
