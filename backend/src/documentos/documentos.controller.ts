import { Controller, Get, Header, HttpCode, Param, ParseFilePipeBuilder, ParseUUIDPipe, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentosService, LIMITE_ARQUIVOS_LOTE, TAMANHO_MAXIMO_ARQUIVO } from './documentos.service.js';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { RequestAutenticada } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../admin/admin.guard.js';

// O multer decodifica nomes de arquivo como latin1 por padrão; o front-end
// envia UTF-8, então nomes acentuados chegavam corrompidos.
const CHARSET_NOME_ARQUIVO = 'utf8';

function validacaoPdf() {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType: 'application/pdf' })
    .build({ fileIsRequired: true });
}

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
      defParamCharset: CHARSET_NOME_ARQUIVO,
      limits: {
        fileSize: TAMANHO_MAXIMO_ARQUIVO,
        files: 1,
      },
    }),
  )
  criar(
    @UploadedFile(validacaoPdf())
    file: Express.Multer.File,
    @Req() request: RequestAutenticada
  ) {
    return this.documentosService.criar(file, request.usuario)
  }

  @Post('lote')
  @UseInterceptors(
    FilesInterceptor('files', LIMITE_ARQUIVOS_LOTE, {
      defParamCharset: CHARSET_NOME_ARQUIVO,
      limits: {
        fileSize: TAMANHO_MAXIMO_ARQUIVO,
        files: LIMITE_ARQUIVOS_LOTE,
      },
    }),
  )
  criarLote(
    @UploadedFiles(validacaoPdf())
    files: Express.Multer.File[],
    @Req() request: RequestAutenticada
  ) {
    return this.documentosService.criarLote(files, request.usuario);
  }

  @Get(':id/download')
  @Header('Cache-Control', 'no-store')
  gerarDownload(@Param('id', ParseUUIDPipe) id: string, @Req() request: RequestAutenticada) {
    return this.documentosService.gerarDownload(id, request.usuario);
  }

  @Post(':id/validado')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  validado(@Param('id', ParseUUIDPipe) id: string, @Req() request: RequestAutenticada) {
    return this.documentosService.validaDocumento(id, request.usuario);
  }
}
