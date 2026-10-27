import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Documento } from '../generated/prisma/client.js';
import { error } from 'console';

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) { }

  buscarTodos(): Promise<Documento[]> {
    return this.prisma.documento.findMany({
      orderBy: {
        criadoEm: 'desc'
      }
    })
  }

  async criar(file: Express.Multer.File): Promise<Documento> {
    const key = await this.storageService.uploadPdf(file.buffer);
    try {
      return await this.prisma.documento.create({
        data: {
          nomeOriginal: file.originalname,
          key,
          tamanho: file.size,
        }
      });
    } catch (erro) {
      this.logger.error('Erro ao salvar o documento no banco, iniciado processo de limpeza.');
      try {
        await this.storageService.remover(key);
      } catch (erroLimpeza) {
        this.logger.error(`Falha ao remover o arquivo ${key} após erro no banco`, erroLimpeza);
      }
    }
    throw error;
  }
}
