import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CadastroDto } from './dto/cadastro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { RequestAutenticada } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('cadastro')
  cadastrar(@Body() dto: CadastroDto) {
    return this.authService.cadastrar(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  me(@Req() request: RequestAutenticada) {
    return request.usuario;
  }
}