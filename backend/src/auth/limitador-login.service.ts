import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

const MAXIMO_FALHAS = 5;
const JANELA_MS = 15 * 60 * 1000;
const MAXIMO_ENTRADAS = 10_000;

type Tentativas = {
  falhas: number;
  expiraEm: number;
};

/**
 * Limita tentativas de login com senha errada por e-mail.
 *
 * O estado fica em memória: vale para uma única instância da API.
 * Com mais de uma instância, troque por um armazenamento compartilhado (ex.: Redis).
 */
@Injectable()
export class LimitadorLoginService {
  private readonly tentativas = new Map<string, Tentativas>();

  verificar(email: string): void {
    const registro = this.tentativas.get(email);

    if (!registro) {
      return;
    }

    if (registro.expiraEm <= Date.now()) {
      this.tentativas.delete(email);
      return;
    }

    if (registro.falhas >= MAXIMO_FALHAS) {
      throw new HttpException(
        'Muitas tentativas de login. Tente novamente mais tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  registrarFalha(email: string): void {
    const agora = Date.now();
    const registro = this.tentativas.get(email);

    if (registro && registro.expiraEm > agora) {
      registro.falhas += 1;
      return;
    }

    this.liberarEspaco(agora);
    this.tentativas.set(email, { falhas: 1, expiraEm: agora + JANELA_MS });
  }

  registrarSucesso(email: string): void {
    this.tentativas.delete(email);
  }

  private liberarEspaco(agora: number): void {
    if (this.tentativas.size < MAXIMO_ENTRADAS) {
      return;
    }

    for (const [email, registro] of this.tentativas) {
      if (registro.expiraEm <= agora) {
        this.tentativas.delete(email);
      }
    }

    // Map preserva a ordem de inserção: descarta os registros mais antigos.
    for (const email of this.tentativas.keys()) {
      if (this.tentativas.size < MAXIMO_ENTRADAS) {
        break;
      }

      this.tentativas.delete(email);
    }
  }
}
