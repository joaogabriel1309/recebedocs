'use client';

import { useActionState, useRef, useState } from 'react';
import { enviarDocumentos } from '@/app/actions/documentos';
import { formatarTamanho } from '@/lib/formatar';
import { estilos } from './ui/estilos';
import {
  IconeAlerta,
  IconeCheck,
  IconeDocumento,
  IconeEnviar,
  IconeFechar,
} from './ui/icones';

const LIMITE_ARQUIVOS = 10;
const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024;
const TAMANHO_MAXIMO_TOTAL = 20 * 1024 * 1024;

function problemaArquivo(arquivo: File): string {
  if (arquivo.size === 0 || !arquivo.name.toLowerCase().endsWith('.pdf')) {
    return 'Não é um PDF válido';
  }

  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
    return 'Maior que 5 MB';
  }

  return '';
}

function validarSelecao(arquivos: File[]): string {
  const tamanhoTotal = arquivos.reduce(
    (total, arquivo) => total + arquivo.size,
    0,
  );

  if (arquivos.length > LIMITE_ARQUIVOS) {
    return 'Selecione no máximo 10 arquivos.';
  }

  if (
    arquivos.some(
      (arquivo) =>
        arquivo.size === 0 ||
        !arquivo.name.toLowerCase().endsWith('.pdf'),
    )
  ) {
    return 'Selecione PDFs válidos e não vazios.';
  }

  if (arquivos.some((arquivo) => arquivo.size > TAMANHO_MAXIMO_ARQUIVO)) {
    return 'Cada arquivo deve ter no máximo 5 MB.';
  }

  if (tamanhoTotal > TAMANHO_MAXIMO_TOTAL) {
    return 'O total deve ser de até 20 MB.';
  }

  return '';
}

export default function FormularioEnvio() {
  const [estado, acao, pendente] = useActionState(
    enviarDocumentos,
    {
      erro: '',
      sucesso: '',
    },
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [selecionados, setSelecionados] = useState<File[]>([]);
  const [arrastando, setArrastando] = useState(false);

  const erroSelecao = validarSelecao(selecionados);
  const tamanhoTotal = selecionados.reduce(
    (total, arquivo) => total + arquivo.size,
    0,
  );
  // O retorno do servidor vale até o usuário começar uma nova seleção.
  const mostrarRetorno = selecionados.length === 0;

  function definirArquivos(arquivos: File[]) {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const transferencia = new DataTransfer();
    arquivos.forEach((arquivo) => transferencia.items.add(arquivo));
    input.files = transferencia.files;
    sincronizar(input);
  }

  function sincronizar(input: HTMLInputElement) {
    const arquivos = Array.from(input.files ?? []);

    input.setCustomValidity(validarSelecao(arquivos));
    setSelecionados(arquivos);
  }

  return (
    <section
      aria-labelledby="titulo-envio"
      className={`${estilos.cartao} p-5 sm:p-6`}
    >
      <h2
        id="titulo-envio"
        className="text-base font-semibold text-zinc-900"
      >
        Enviar documentos
      </h2>

      <p className="mt-1 text-sm text-zinc-600">
        Os documentos enviados ficam aguardando a validação de um
        administrador.
      </p>

      <form
        action={acao}
        onReset={() => setSelecionados([])}
        className="mt-5 space-y-4"
      >
        <label
          htmlFor="documentos"
          onDragOver={(event) => {
            event.preventDefault();
            if (!pendente) setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(event) => {
            event.preventDefault();
            setArrastando(false);

            if (!pendente) {
              definirArquivos(Array.from(event.dataTransfer.files));
            }
          }}
          className={`flex cursor-pointer flex-col items-center rounded-xl *:pointer-events-none border-2 border-dashed px-4 py-8 text-center transition-colors has-focus-visible:border-blue-600 has-focus-visible:ring-3 has-focus-visible:ring-blue-600/20 has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
            arrastando
              ? 'border-blue-600 bg-blue-50'
              : 'border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50/60'
          }`}
        >
          <span className="grid size-11 place-items-center rounded-full bg-white text-blue-700 shadow-sm ring-1 ring-zinc-200">
            <IconeEnviar />
          </span>

          <span className="mt-3 text-sm text-zinc-700">
            <span className="font-semibold text-blue-700">
              Escolha os arquivos PDF
            </span>
            <span className="hidden sm:inline"> ou arraste e solte aqui</span>
          </span>

          <span
            id="orientacao-arquivos"
            className="mt-1 text-xs text-zinc-600"
          >
            Até 10 PDFs · 5 MB por arquivo · 20 MB no total
          </span>

          <input
            ref={inputRef}
            id="documentos"
            name="files"
            type="file"
            accept=".pdf,application/pdf"
            multiple
            required
            disabled={pendente}
            aria-describedby="orientacao-arquivos"
            onChange={(event) => sincronizar(event.currentTarget)}
            className="sr-only"
          />
        </label>

        {selecionados.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-zinc-600">
              <span>
                {selecionados.length}{' '}
                {selecionados.length === 1
                  ? 'arquivo selecionado'
                  : 'arquivos selecionados'}{' '}
                · {formatarTamanho(tamanhoTotal)} de 20 MB
              </span>

              <button
                type="button"
                onClick={() => definirArquivos([])}
                disabled={pendente}
                className={`rounded font-medium text-zinc-700 underline-offset-2 hover:text-zinc-950 hover:underline disabled:opacity-60 ${estilos.foco}`}
              >
                Limpar
              </button>
            </div>

            <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
              {selecionados.map((arquivo, indice) => {
                const problema = problemaArquivo(arquivo);

                return (
                  <li
                    key={`${arquivo.name}-${arquivo.size}-${arquivo.lastModified}-${indice}`}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <IconeDocumento
                      className={`size-5 shrink-0 ${
                        problema ? 'text-red-600' : 'text-zinc-500'
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {arquivo.name}
                      </p>

                      <p
                        className={`text-xs ${
                          problema ? 'text-red-700' : 'text-zinc-600'
                        }`}
                      >
                        {formatarTamanho(arquivo.size)}
                        {problema && ` · ${problema}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        definirArquivos(
                          selecionados.filter((_, i) => i !== indice),
                        )
                      }
                      disabled={pendente}
                      aria-label={`Remover ${arquivo.name}`}
                      className={`grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60 ${estilos.foco}`}
                    >
                      <IconeFechar className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {erroSelecao && (
          <p
            role="alert"
            className="flex items-start gap-2 text-sm text-red-700"
          >
            <IconeAlerta className="mt-px size-4 shrink-0" />
            {erroSelecao}
          </p>
        )}

        {mostrarRetorno && estado.erro && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          >
            <IconeAlerta className="mt-px size-4 shrink-0" />
            {estado.erro}
          </p>
        )}

        {mostrarRetorno && estado.sucesso && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800"
          >
            <IconeCheck className="mt-px size-4 shrink-0" />
            {estado.sucesso}
          </p>
        )}

        <button
          type="submit"
          disabled={
            pendente || selecionados.length === 0 || Boolean(erroSelecao)
          }
          className={`${estilos.botaoPrimario} w-full`}
        >
          <IconeEnviar className="size-4" />
          {pendente
            ? 'Enviando...'
            : selecionados.length > 1
              ? `Enviar ${selecionados.length} documentos`
              : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}
