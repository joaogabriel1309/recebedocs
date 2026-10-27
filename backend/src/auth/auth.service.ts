import { ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  Perfil,
  Prisma,
  type Usuario,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CadastroDto } from './dto/cadastro.dto.js';

export type UsuarioPublico = Pick<
  Usuario,
  'id' | 'nome' | 'email' | 'perfil' | 'criadoEm'
>;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }

  async cadastrar(dto: CadastroDto): Promise<UsuarioPublico> {
    const senhaHash = await argon2.hash(dto.senha, {
      type: argon2.argon2id,
    });

    try {
      return await this.prisma.usuario.create({
        data: {
          nome: dto.nome,
          email: dto.email,
          senhaHash,
          perfil: Perfil.USUARIO,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          criadoEm: true,
        },
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException('E-mail já cadastrado');
      }

      throw erro;
    }
  }
}