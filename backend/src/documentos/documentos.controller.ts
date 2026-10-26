import { Controller, Get } from '@nestjs/common';

@Controller('documentos')
export class DocumentosController {
  @Get()
  buscarTodos() {
    return [];
  }
}
