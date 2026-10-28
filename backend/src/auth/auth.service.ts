import { ConflictException, Injectable, UnauthorizedException, type OnModuleInit } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  Perfil,
  Prisma,
  type Usuario,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CadastroDto } from './dto/cadastro.dto.js';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto.js';
import { LimitadorLoginService } from './limitador-login.service.js';

export const EXPIRACAO_TOKEN_SEGUNDOS = 900;

export type UsuarioPublico = Pick<
  Usuario,
  'id' | 'nome' | 'email' | 'perfil' | 'criadoEm'
>;

export type LoginResposta = {
  accessToken: string;
  tokenType: 'Bearer';
  expiraEmSegundos: number;
  usuario: UsuarioPublico;
};

@Injectable()
export class AuthService implements OnModuleInit {
  private senhaHashAlternativa: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly limitadorLogin: LimitadorLoginService,
  ) { }

  async onModuleInit(): Promise<void> {
    this.senhaHashAlternativa = await argon2.hash(randomBytes(32), {
      type: argon2.argon2id,
    });
  }

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

  async login(dto: LoginDto): Promise<LoginResposta> {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        criadoEm: true,
        senhaHash: true,
      },
    });

    this.limitadorLogin.verificar(dto.email);

    const senhaValida = await argon2.verify(
      usuario?.senhaHash ?? this.senhaHashAlternativa,
      dto.senha,
    );

    if (!usuario || !senhaValida) {
      this.limitadorLogin.registrarFalha(dto.email);
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    this.limitadorLogin.registrarSucesso(dto.email);

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
    });

    const usuarioPublico: UsuarioPublico = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      criadoEm: usuario.criadoEm,
    };

    return {
      accessToken,
      tokenType: 'Bearer',
      expiraEmSegundos: EXPIRACAO_TOKEN_SEGUNDOS,
      usuario: usuarioPublico,
    };
  }
}