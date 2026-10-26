import { Controller, Get } from '@nestjs/common';
import { DocumentosService } from './documentos.service.js';

@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
  ) { }

  @Get()
  buscarTodos() {
    return this.documentosService.buscarTodos();
  }
}
