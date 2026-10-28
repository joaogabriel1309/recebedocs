'use client';

import { useActionState } from 'react';
import { enviarDocumentos } from '@/app/actions/documentos';

export default function FormularioEnvio() {
  const [estado, acao, pendente] = useActionState(
    enviarDocumentos,
    {
      erro: '',
      sucesso: '',
    },
  );

  return (
    <section className="mt-8 rounded-lg border border-zinc-200 p-4">
      <h2 className="text-xl font-semibold">
        Enviar documentos
      </h2>

      <p
        id="orientacao-arquivos"
        className="mt-2 text-sm text-zinc-600"
      >
        Selecione até 10 PDFs. Máximo de 5 MB por arquivo
        e 20 MB no total.
      </p>

      <form action={acao} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="documentos"
            className="mb-2 block text-sm font-medium"
          >
            Arquivos PDF
          </label>

          <input
            id="documentos"
            name="files"
            type="file"
            accept=".pdf,application/pdf"
            multiple
            required
            disabled={pendente}
            aria-describedby="orientacao-arquivos"
            onChange={(event) => {
              const input = event.currentTarget;
              const arquivos = Array.from(input.files ?? []);

              const tamanhoTotal = arquivos.reduce(
                (total, arquivo) => total + arquivo.size,
                0,
              );

              let erro = '';

              if (arquivos.length > 10) {
                erro = 'Selecione no máximo 10 arquivos.';
              } else if (
                arquivos.some(
                  (arquivo) =>
                    arquivo.size === 0 ||
                    !arquivo.name.toLowerCase().endsWith('.pdf'),
                )
              ) {
                erro = 'Selecione PDFs válidos e não vazios.';
              } else if (
                arquivos.some(
                  (arquivo) => arquivo.size > 5 * 1024 * 1024,
                )
              ) {
                erro = 'Cada arquivo deve ter no máximo 5 MB.';
              } else if (tamanhoTotal > 20 * 1024 * 1024) {
                erro = 'O total deve ser de até 20 MB.';
              }

              input.setCustomValidity(erro);
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
          {pendente ? 'Enviando...' : 'Enviar documentos'}
        </button>
      </form>
    </section>
  );
}