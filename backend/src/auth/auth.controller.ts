import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CadastroDto } from './dto/cadastro.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('cadastro')
  cadastrar(@Body() dto: CadastroDto) {
    return this.authService.cadastrar(dto);
  }
}