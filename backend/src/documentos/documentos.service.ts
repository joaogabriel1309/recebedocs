import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Documento, Perfil } from '../generated/prisma/client.js';
import type { UsuarioPublico } from '../auth/auth.service.js';

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) { }

  buscarTodos(usuario: UsuarioPublico): Promise<Documento[]> {
    return this.prisma.documento.findMany({
      where:
        usuario.perfil === Perfil.ADMIN
          ? {}
          : { usuarioId: usuario.id },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async criar(
    file: Express.Multer.File,
    usuario: UsuarioPublico,
  ): Promise<Documento> {
    const key = await this.storageService.uploadPdf(file.buffer);

    try {
      return await this.prisma.documento.create({
        data: {
          nomeOriginal: file.originalname,
          key,
          tamanho: file.size,
          usuarioId: usuario.id,
        },
      });
    } catch (erro) {
      this.logger.error(
        'Erro ao salvar o documento no banco. Iniciando limpeza.',
      );

      try {
        await this.storageService.remover(key);
      } catch (erroLimpeza) {
        this.logger.error(
          `Falha ao remover o arquivo ${key} após erro no banco`,
          erroLimpeza,
        );
      }

      throw erro;
    }
  }

  async gerarDownload(id: string, usuario: UsuarioPublico) {
    const documento = await this.prisma.documento.findUnique({
      where: { id }
    });

    if (
      !documento ||
      (
        usuario.perfil !== Perfil.ADMIN &&
        documento.usuarioId !== usuario.id
      )
    ) {
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

  async validaDocumento(id: string, usuario: UsuarioPublico) {
    if (usuario.perfil !== Perfil.ADMIN) {
      throw new NotFoundException('Somente administradores podem validar documentos');
    }

    const documento = await this.prisma.documento.findUnique({
      where: { id }
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.prisma.documento.update({
      where: { id },
      data: {
        validado: true,
      },
      select: {
        id: true,
        validado: true,
      }
    })
  }
}
