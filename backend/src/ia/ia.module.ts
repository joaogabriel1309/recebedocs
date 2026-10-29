import { Module } from '@nestjs/common';
import { ClassificadorService } from './classificador.service.js';

@Module({
  providers: [ClassificadorService],
  exports: [ClassificadorService]
})
export class IaModule { }
