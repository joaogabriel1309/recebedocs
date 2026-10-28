import { montarContentDisposition } from './storage.service.js';

describe('montarContentDisposition', () => {
  it('codifica nomes com acentos e mantém um fallback ASCII', () => {
    expect(montarContentDisposition('relatório final.pdf')).toBe(
      `inline; filename="relatorio final.pdf"; filename*=UTF-8''relat%C3%B3rio%20final.pdf`,
    );
  });

  it('não permite quebrar o cabeçalho com aspas', () => {
    const valor = montarContentDisposition('a"; filename="b.exe');

    expect(valor).toContain(`filename="a; filename=b.exe"`);
    expect(valor).toContain(`filename*=UTF-8''a%22%3B%20filename%3D%22b.exe`);
  });
});
