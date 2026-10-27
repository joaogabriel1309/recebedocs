import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) { }

  async listarDocumentosPorUsuario() {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        documentos: {
          some: {},
        },
      },
      orderBy: [
        { nome: 'asc' },
        { id: 'asc' },
      ],
      select: {
        id: true,
        nome: true,
        email: true,
        _count: {
          select: {
            documentos: true,
          },
        },
        documentos: {
          orderBy: [
            { criadoEm: 'desc' },
            { id: 'desc' },
          ],
          select: {
            id: true,
            nomeOriginal: true,
            tamanho: true,
            validado: true,
            criadoEm: true,
          },
        },
      },
    });

    return usuarios.map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      totalDocumentos: usuario._count.documentos,
      documentos: usuario.documentos,
    }));
  }
}