'use client';

import { useActionState } from 'react';
import { enviarDocumento } from '@/app/actions/documentos';

export default function FormularioEnvio() {
  const [estado, acao, pendente] = useActionState(
    enviarDocumento,
    {
      erro: '',
      sucesso: '',
    },
  );

  return (
    <section className="mt-8 rounded-lg border border-zinc-200 p-4">
      <h2 className="text-xl font-semibold">
        Enviar documento
      </h2>

      <p id="orientacao-arquivo" className="mt-2 text-sm text-zinc-600">
        Selecione um PDF de até 5 MB.
      </p>

      <form action={acao} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="documento"
            className="mb-2 block text-sm font-medium"
          >
            Arquivo PDF
          </label>

          <input
            id="documento"
            name="file"
            type="file"
            accept=".pdf,application/pdf"
            aria-describedby="orientacao-arquivo"
            required
            disabled={pendente}
            onChange={(event) => {
              const input = event.currentTarget;
              const arquivo = input.files?.[0];

              input.setCustomValidity(
                arquivo && arquivo.size > 5 * 1024 * 1024
                  ? 'O arquivo deve ter no máximo 5 MB.'
                  : '',
              );
            }}
            className="block w-full rounded-lg border border-zinc-300 p-2 text-sm"
          />
        </div>

        {estado.erro && (
          <p role="alert" className="text-sm text-red-700">
            {estado.erro}
          </p>
        )}

        {estado.sucesso && (
          <p role="status" className="text-sm text-green-700">
            {estado.sucesso}
          </p>
        )}

        <button
          type="submit"
          disabled={pendente}
          className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pendente ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}