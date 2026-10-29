import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, PayloadTooLargeException, UnprocessableEntityException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Perfil, Prisma } from '../generated/prisma/client.js';
import type { UsuarioPublico } from '../auth/auth.service.js';
import { ClassificadorService } from '../ia/classificador.service.js';

export const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024;
export const TAMANHO_MAXIMO_LOTE = 20 * 1024 * 1024;
export const LIMITE_ARQUIVOS_LOTE = 10;

const TAMANHO_MAXIMO_NOME = 255;

// A chave interna do arquivo no bucket não é exposta aos clientes.
const camposPublicos = {
  id: true,
  nomeOriginal: true,
  tamanho: true,
  validado: true,
  criadoEm: true,
  usuarioId: true,
} satisfies Prisma.DocumentoSelect;

export type DocumentoPublico = Prisma.DocumentoGetPayload<{
  select: typeof camposPublicos;
}>;

export function normalizarNomeArquivo(nome: string): string {
  const limpo = nome
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .trim();

  if (!limpo) {
    return 'documento.pdf';
  }

  return Array.from(limpo).slice(0, TAMANHO_MAXIMO_NOME).join('');
}

export function pdfProtegidoPorSenha(buffer: Buffer): boolean {
  return buffer.includes('/Encrypt');
}

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
    private readonly classificador: ClassificadorService,
  ) { }

  buscarTodos(usuario: UsuarioPublico): Promise<DocumentoPublico[]> {
    return this.prisma.documento.findMany({
      where:
        usuario.perfil === Perfil.ADMIN
          ? {}
          : { usuarioId: usuario.id },
      orderBy: [
        { criadoEm: 'desc' },
        { id: 'desc' },
      ],
      select: camposPublicos,
    });
  }

  async criar(
    file: Express.Multer.File,
    usuario: UsuarioPublico,
  ): Promise<DocumentoPublico> {
    if (file.size === 0) {
      throw new BadRequestException(
        'Não é permitido enviar arquivos vazios',
      );
    }

    if (pdfProtegidoPorSenha(file.buffer)) {
      throw new BadRequestException(
        'O PDF está protegido por senha. Remova a senha e envie novamente.',
      );
    }

    const analise = await this.classificador.classificar(file.buffer);

    if (analise && !analise.comprovante && analise.confianca !== 'baixa') {
      throw new UnprocessableEntityException(
        `Documento recusado ${analise.motivo}`,
      )
    }

    const key = await this.storageService.uploadPdf(file.buffer);

    try {
      return await this.prisma.documento.create({
        data: {
          nomeOriginal: normalizarNomeArquivo(file.originalname),
          key,
          tamanho: file.size,
          usuarioId: usuario.id,
        },
        select: camposPublicos,
      });
    } catch (erro) {
      this.logger.error(
        'Erro ao salvar o documento no banco. Iniciando limpeza.',
        erro,
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
  ): Promise<DocumentoPublico[]> {
    if (!files?.length || files.length > LIMITE_ARQUIVOS_LOTE) {
      throw new BadRequestException(
        `Envie de 1 a ${LIMITE_ARQUIVOS_LOTE} arquivos por vez`,
      );
    }

    if (files.some((file) => file.size === 0)) {
      throw new BadRequestException(
        'Não é permitido enviar arquivos vazios',
      );
    }

    const protegidos = files.filter((file) => pdfProtegidoPorSenha(file.buffer));

    if (protegidos.length) {
      throw new BadRequestException(
        `Estes PDFs estão protegidos por senha: ${protegidos
          .map((file) => normalizarNomeArquivo(file.originalname))
          .join(', ')}. Remova a senha e envie novamente.`,
      );
    }

    const tamanhoTotal = files.reduce(
      (total, file) => total + file.size,
      0,
    );

    if (
      files.some((file) => file.size > TAMANHO_MAXIMO_ARQUIVO) ||
      tamanhoTotal > TAMANHO_MAXIMO_LOTE
    ) {
      throw new PayloadTooLargeException(
        'O limite é 5 MB por arquivo e 20 MB por envio',
      );
    }

    const analises = await Promise.all(
      files.map((file) => this.classificador.classificar(file.buffer)),
    );

    const recusados = files.filter((_, indice) => {
      const analise = analises[indice];
      return analise && !analise.comprovante && analise.confianca !== 'baixa';
    });

    if (recusados.length) {
      throw new UnprocessableEntityException(
        `Documentos recusados por não serem comprovantes: ${recusados
          .map((file) => normalizarNomeArquivo(file.originalname))
          .join(', ')}`,
      );
    }


    // Os uploads correm em paralelo; allSettled garante que conhecemos
    // todas as chaves gravadas, mesmo quando parte deles falha.
    const uploads = await Promise.allSettled(
      files.map((file) => this.storageService.uploadPdf(file.buffer)),
    );

    const chavesEnviadas = uploads.flatMap((upload) =>
      upload.status === 'fulfilled' ? [upload.value] : [],
    );

    try {
      const falhaUpload = uploads.find(
        (upload) => upload.status === 'rejected',
      );

      if (falhaUpload) {
        throw falhaUpload.reason;
      }

      const dados: Prisma.DocumentoCreateManyInput[] = files.map(
        (file, indice) => ({
          nomeOriginal: normalizarNomeArquivo(file.originalname),
          key: chavesEnviadas[indice],
          tamanho: file.size,
          usuarioId: usuario.id,
        }),
      );

      return await this.prisma.documento.createManyAndReturn({
        data: dados,
        select: camposPublicos,
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

    const download = await this.storageService.gerarUrlDownload(
      documento.key,
      documento.nomeOriginal,
    );

    return {
      id: documento.id,
      nomeOriginal: documento.nomeOriginal,
      url: download.url,
      expiraEmSegundos: download.expiraEmSegundos,
    };
  }

  async validaDocumento(id: string, usuario: UsuarioPublico) {
    if (usuario.perfil !== Perfil.ADMIN) {
      throw new ForbiddenException('Somente administradores podem validar documentos');
    }

    try {
      return await this.prisma.documento.update({
        where: { id },
        data: {
          validado: true,
        },
        select: {
          id: true,
          validado: true,
        }
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2025'
      ) {
        throw new NotFoundException('Documento não encontrado');
      }

      throw erro;
    }
  }
}
