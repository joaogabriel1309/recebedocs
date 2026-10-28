'use client';

import { useActionState } from 'react';
import { validarDocumento } from '@/app/actions/documentos';
import { estilos } from './ui/estilos';
import { IconeCheck } from './ui/icones';

type Props = {
  id: string;
  nomeArquivo: string;
  validado: boolean;
};

export default function BotaoValidarDocumento({
  id,
  nomeArquivo,
  validado,
}: Props) {
  const [estado, acao, pendente] = useActionState(
    validarDocumento,
    {
      erro: '',
      sucesso: '',
    },
  );

  // O selo de status já indica documentos validados; o botão só aparece
  // enquanto há algo a fazer. A mensagem de sucesso continua montada para
  // ser anunciada por leitores de tela após a lista ser atualizada.
  if (validado && !estado.sucesso) {
    return null;
  }

  const concluido = validado || Boolean(estado.sucesso);

  return (
    <form action={acao} className="contents">
      <input type="hidden" name="id" value={id} />

      {!validado && (
        <button
          type="submit"
          disabled={pendente || concluido}
          aria-label={
            concluido
              ? `${nomeArquivo} validado`
              : `Validar documento ${nomeArquivo}`
          }
          className={estilos.botaoSucesso}
        >
          <IconeCheck className="size-4" />
          {pendente
            ? 'Validando...'
            : concluido
              ? 'Validado'
              : 'Validar'}
        </button>
      )}

      {estado.erro && (
        <p role="alert" className="basis-full text-sm text-red-700 sm:text-right">
          {estado.erro}
        </p>
      )}

      {estado.sucesso && (
        <p role="status" className="sr-only">
          {estado.sucesso}
        </p>
      )}
    </form>
  );
}
