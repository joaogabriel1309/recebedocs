import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UsuarioPublico } from './auth.service.js';

export interface RequestAutenticada extends Request {
  usuario: UsuarioPublico;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestAutenticada>();

    const authorization = request.headers.authorization ?? '';
    const token = /^Bearer ([^\s]+)$/i.exec(authorization)?.[1];

    if (!token) {
      throw new UnauthorizedException('Token não informado');
    }

    let payload: { sub?: unknown };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub?: unknown;
      }>(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      !isUUID(payload.sub)
    ) {
      throw new UnauthorizedException('Token inválido');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        criadoEm: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    request.usuario = usuario;

    return true;
  }
}