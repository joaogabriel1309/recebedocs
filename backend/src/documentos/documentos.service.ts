import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Documento } from '../generated/prisma/client.js';
import { error } from 'console';
import { url } from 'inspector';

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

  async gerarDownload(id: string) {
    const documento = await this.prisma.documento.findUnique({
      where: { id }
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    const download = await this.storageService.gerarUrlDownload(documento.key);

    return {
      id: documento.id,
      nomeOriginal: documento.nomeOriginal,
      url: download.url,
      expiraEmSegundos: download.expiraEmSegundos,
    };
  }
}
