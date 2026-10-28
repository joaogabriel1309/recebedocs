import { HttpException, HttpStatus } from '@nestjs/common';
import { LimitadorLoginService } from './limitador-login.service.js';

describe('LimitadorLoginService', () => {
  let limitador: LimitadorLoginService;

  beforeEach(() => {
    vi.useFakeTimers();
    limitador = new LimitadorLoginService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function falhar(email: string, vezes: number) {
    for (let i = 0; i < vezes; i++) {
      limitador.registrarFalha(email);
    }
  }

  it('bloqueia após 5 falhas seguidas', () => {
    falhar('a@exemplo.com', 4);
    expect(() => limitador.verificar('a@exemplo.com')).not.toThrow();

    limitador.registrarFalha('a@exemplo.com');

    try {
      limitador.verificar('a@exemplo.com');
      expect.unreachable();
    } catch (erro) {
      expect(erro).toBeInstanceOf(HttpException);
      expect((erro as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('não afeta outros e-mails', () => {
    falhar('a@exemplo.com', 5);
    expect(() => limitador.verificar('b@exemplo.com')).not.toThrow();
  });

  it('libera após a janela de 15 minutos', () => {
    falhar('a@exemplo.com', 5);
    vi.advanceTimersByTime(15 * 60 * 1000);
    expect(() => limitador.verificar('a@exemplo.com')).not.toThrow();
  });

  it('zera as falhas após um login bem-sucedido', () => {
    falhar('a@exemplo.com', 4);
    limitador.registrarSucesso('a@exemplo.com');
    limitador.registrarFalha('a@exemplo.com');
    expect(() => limitador.verificar('a@exemplo.com')).not.toThrow();
  });
});
