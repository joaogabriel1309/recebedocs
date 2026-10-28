import { BadRequestException, Injectable, Logger, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Documento, Perfil, Prisma } from '../generated/prisma/client.js';
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

  async criarLote(
    files: Express.Multer.File[],
    usuario: UsuarioPublico,
  ): Promise<Documento[]> {
    if (!files?.length || files.length > 10) {
      throw new BadRequestException(
        'Envie de 1 a 10 arquivos por vez',
      );
    }

    if (files.some((file) => file.size === 0)) {
      throw new BadRequestException(
        'Não é permitido enviar arquivos vazios',
      );
    }

    const tamanhoTotal = files.reduce(
      (total, file) => total + file.size,
      0,
    );

    if (
      files.some((file) => file.size > 5 * 1024 * 1024) ||
      tamanhoTotal > 20 * 1024 * 1024
    ) {
      throw new PayloadTooLargeException(
        'O limite é 5 MB por arquivo e 20 MB por envio',
      );
    }

    const chavesEnviadas: string[] = [];
    const dados: Prisma.DocumentoCreateManyInput[] = [];

    try {
      for (const file of files) {
        const key = await this.storageService.uploadPdf(
          file.buffer,
        );

        chavesEnviadas.push(key);

        dados.push({
          nomeOriginal: file.originalname,
          key,
          tamanho: file.size,
          usuarioId: usuario.id,
        });
      }

      return await this.prisma.documento.createManyAndReturn({
        data: dados,
      });
    } catch (erro) {
      this.logger.error(
        'Falha ao salvar o lote de documentos. Iniciando limpeza.',
        erro,
      );

      const resultados = await Promise.allSettled(
        chavesEnviadas.map((key) =>
          this.storageService.remover(key),
        ),
      );

      resultados.forEach((resultado, indice) => {
        if (resultado.status === 'rejected') {
          this.logger.error(
            `Falha ao remover ${chavesEnviadas[indice]}`,
            resultado.reason,
          );
        }
      });

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
