import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DocumentosService, normalizarNomeArquivo } from './documentos.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Perfil, Prisma } from '../generated/prisma/client.js';
import type { UsuarioPublico } from '../auth/auth.service.js';

const usuario: UsuarioPublico = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Usuária',
  email: 'usuaria@exemplo.com',
  perfil: Perfil.USUARIO,
  criadoEm: new Date(),
};

const admin: UsuarioPublico = {
  ...usuario,
  id: '22222222-2222-4222-8222-222222222222',
  perfil: Perfil.ADMIN,
};

function arquivo(nome: string, tamanho = 10): Express.Multer.File {
  return {
    originalname: nome,
    size: tamanho,
    buffer: Buffer.alloc(tamanho),
  } as Express.Multer.File;
}

describe('DocumentosService', () => {
  let service: DocumentosService;
  let storage: {
    uploadPdf: ReturnType<typeof vi.fn>;
    remover: ReturnType<typeof vi.fn>;
    gerarUrlDownload: ReturnType<typeof vi.fn>;
  };
  let prisma: {
    documento: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      createManyAndReturn: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    let contador = 0;

    storage = {
      uploadPdf: vi.fn(() => Promise.resolve(`documentos/${++contador}.pdf`)),
      remover: vi.fn(() => Promise.resolve()),
      gerarUrlDownload: vi.fn(() =>
        Promise.resolve({ url: 'https://r2.exemplo/x', expiraEmSegundos: 300 }),
      ),
    };

    prisma = {
      documento: {
        findUnique: vi.fn(),
        update: vi.fn(),
        createManyAndReturn: vi.fn((args: { data: unknown[] }) =>
          Promise.resolve(args.data),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        { provide: StorageService, useValue: storage },
        { provide: PrismaService, useValue: prisma },
        {
          provide: getQueueToken('analise-documentos'),
          useValue: { addBulk: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<DocumentosService>(DocumentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('gerarDownload', () => {
    it('não permite baixar documento de outro usuário', async () => {
      prisma.documento.findUnique.mockResolvedValue({
        id: 'doc',
        key: 'documentos/1.pdf',
        nomeOriginal: 'a.pdf',
        usuarioId: 'outro-usuario',
      });

      await expect(service.gerarDownload('doc', usuario)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(storage.gerarUrlDownload).not.toHaveBeenCalled();
    });

    it('permite ao dono e ao administrador baixar o documento', async () => {
      prisma.documento.findUnique.mockResolvedValue({
        id: 'doc',
        key: 'documentos/1.pdf',
        nomeOriginal: 'a.pdf',
        usuarioId: usuario.id,
      });

      await expect(service.gerarDownload('doc', usuario)).resolves.toMatchObject({
        url: 'https://r2.exemplo/x',
      });
      await expect(service.gerarDownload('doc', admin)).resolves.toMatchObject({
        url: 'https://r2.exemplo/x',
      });
      expect(storage.gerarUrlDownload).toHaveBeenCalledWith('documentos/1.pdf', 'a.pdf');
    });
  });

  describe('criarLote', () => {
    it('remove do bucket os arquivos já enviados quando um upload falha', async () => {
      storage.uploadPdf
        .mockResolvedValueOnce('documentos/a.pdf')
        .mockRejectedValueOnce(new Error('falha no R2'))
        .mockResolvedValueOnce('documentos/c.pdf');

      await expect(
        service.criarLote([arquivo('a.pdf'), arquivo('b.pdf'), arquivo('c.pdf')], usuario),
      ).rejects.toThrow('falha no R2');

      expect(prisma.documento.createManyAndReturn).not.toHaveBeenCalled();
      expect(storage.remover).toHaveBeenCalledWith('documentos/a.pdf');
      expect(storage.remover).toHaveBeenCalledWith('documentos/c.pdf');
    });

    it('remove os arquivos do bucket quando o banco falha', async () => {
      prisma.documento.createManyAndReturn.mockRejectedValue(new Error('falha no banco'));

      await expect(
        service.criarLote([arquivo('a.pdf'), arquivo('b.pdf')], usuario),
      ).rejects.toThrow('falha no banco');

      expect(storage.remover).toHaveBeenCalledTimes(2);
    });

    it('associa cada arquivo à sua chave e ao usuário', async () => {
      await service.criarLote([arquivo('a.pdf'), arquivo('b.pdf')], usuario);

      expect(prisma.documento.createManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            expect.objectContaining({ nomeOriginal: 'a.pdf', key: 'documentos/1.pdf', usuarioId: usuario.id }),
            expect.objectContaining({ nomeOriginal: 'b.pdf', key: 'documentos/2.pdf', usuarioId: usuario.id }),
          ],
        }),
      );
    });

    it('rejeita arquivos vazios antes de enviar ao bucket', async () => {
      await expect(
        service.criarLote([arquivo('a.pdf', 0)], usuario),
      ).rejects.toThrow('vazios');
      expect(storage.uploadPdf).not.toHaveBeenCalled();
    });
  });

  describe('validaDocumento', () => {
    it('recusa usuários que não são administradores', async () => {
      await expect(service.validaDocumento('doc', usuario)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.documento.update).not.toHaveBeenCalled();
    });

    it('retorna 404 quando o documento não existe', async () => {
      prisma.documento.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('não encontrado', {
          code: 'P2025',
          clientVersion: 'teste',
        }),
      );

      await expect(service.validaDocumento('doc', admin)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('marca o documento como validado', async () => {
      prisma.documento.update.mockResolvedValue({ id: 'doc', validado: true });

      await expect(service.validaDocumento('doc', admin)).resolves.toEqual({
        id: 'doc',
        validado: true,
      });
    });
  });
});

describe('normalizarNomeArquivo', () => {
  it('remove caracteres de controle e espaços nas pontas', () => {
    expect(normalizarNomeArquivo('  rela\u0000tório‮.pdf  ')).toBe('relatório.pdf');
  });

  it('usa um nome padrão quando o nome fica vazio', () => {
    expect(normalizarNomeArquivo('\u0000 ')).toBe('documento.pdf');
  });

  it('limita o tamanho do nome', () => {
    expect(normalizarNomeArquivo('a'.repeat(300))).toHaveLength(255);
  });
});
