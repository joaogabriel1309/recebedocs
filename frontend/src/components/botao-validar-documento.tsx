'use client';

import { useActionState } from 'react';
import { validarDocumento } from '@/app/actions/documentos';

type Props = {
  id: string;
  validado: boolean;
};

export default function BotaoValidarDocumento({
  id,
  validado,
}: Props) {
  const [estado, acao, pendente] = useActionState(
    validarDocumento,
    {
      erro: '',
      sucesso: '',
    },
  );

  const concluido = validado || Boolean(estado.sucesso);

  return (
    <form action={acao} className="space-y-2">
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        disabled={pendente || concluido}
        className="rounded bg-green-700 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
      >
        {pendente
          ? 'Validando...'
          : concluido
            ? 'Validado'
            : 'Validar documento'}
      </button>

      {estado.erro && (
        <p role="alert" className="text-sm text-red-700">
          {estado.erro}
        </p>
      )}
    </form>
  );
}