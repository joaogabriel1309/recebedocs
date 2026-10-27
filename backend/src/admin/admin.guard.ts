import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { RequestAutenticada } from '../auth/jwt-auth.guard.js';
import { Perfil } from '../generated/prisma/client.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequestAutenticada>();

    if (!request.usuario) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (request.usuario.perfil !== Perfil.ADMIN) {
      throw new ForbiddenException(
        'Acesso permitido somente para administradores',
      );
    }

    return true;
  }
}