import {
  Controller,
  Get,
  Header,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from './admin.guard.js';
import { AdminService } from './admin.service.js';

@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('documentos')
  @Header('Cache-Control', 'no-store')
  listarDocumentosPorUsuario() {
    return this.adminService.listarDocumentosPorUsuario();
  }
}