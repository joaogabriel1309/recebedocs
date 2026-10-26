import { Controller, Get, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DocumentosService } from './documentos.service.js';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
  ) { }

  @Get()
  buscarTodos() {
    return this.documentosService.buscarTodos();
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
  ) {
    return this.documentosService.criar(file)
  }
}
