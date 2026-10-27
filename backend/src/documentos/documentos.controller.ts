import { Controller, Get, Header, HttpCode, Param, ParseFilePipeBuilder, ParseUUIDPipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentosService } from './documentos.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { RequestAutenticada } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../admin/admin.guard.js';

@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
  ) { }

  @Get()
  @Header('Cache-Control', 'no-store')
  buscarTodos(@Req() request: RequestAutenticada) {
    return this.documentosService.buscarTodos(request.usuario);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  criar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'application/pdf' })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Req() request: RequestAutenticada
  ) {
    return this.documentosService.criar(file, request.usuario)
  }

  @Get(':id/download')
  @Header('Cache-control', 'no-store')
  gerarDownload(@Param('id', ParseUUIDPipe) id: string, @Req() request: RequestAutenticada) {
    return this.documentosService.gerarDownload(id, request.usuario,);
  }

  @Post(':id/validado')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  validado(@Param('id', ParseUUIDPipe) id: string, @Req() request: RequestAutenticada) {
    return this.documentosService.validaDocumento(id, request.usuario);
  }
}
