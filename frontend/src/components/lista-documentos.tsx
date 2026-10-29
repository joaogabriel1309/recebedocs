import type { DocumentoResumo } from '@/lib/documentos';
import { formatarData, formatarTamanho } from '@/lib/formatar';
import BotaoValidarDocumento from './botao-validar-documento';
import SeloStatus from './selo-status';
import { estilos } from './ui/estilos';
import { IconeAbrir, IconeDocumento } from './ui/icones';

type Props = {
  documentos: DocumentoResumo[];
  podeValidar?: boolean;
  mensagemVazia?: string;
};

export default function ListaDocumentos({
  documentos,
  podeValidar = false,
  mensagemVazia = 'Os PDFs enviados aparecerão aqui.',
}: Props) {
  if (documentos.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">
          <IconeDocumento />
        </span>

        <p className="mt-3 font-medium text-zinc-900">
          Nenhum documento enviado
        </p>

        <p className="mt-1 text-sm text-zinc-600">{mensagemVazia}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {documentos.map((documento) => {
        const data = formatarData(documento.criadoEm);

        return (
          <li
            key={documento.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700">
                <IconeDocumento />
              </span>

              <div className="min-w-0">
                <p
                  className="line-clamp-2 font-medium text-zinc-900 wrap-anywhere"
                  title={documento.nomeOriginal}
                >
                  {documento.nomeOriginal}
                </p>

                <p className="mt-0.5 text-xs text-zinc-600">
                  {formatarTamanho(documento.tamanho)}
                  {data && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="sr-only">, enviado em </span>
                      <time dateTime={documento.criadoEm}>{data}</time>
                    </>
                  )}
                </p>

                {!documento.validado &&
                  documento.statusAnalise === 'RECUSADO' &&
                  documento.motivoAnalise && (
                    <p className="mt-1 text-xs text-red-700">
                      <span className="sr-only">Motivo da recusa: </span>
                      {documento.motivoAnalise}
                    </p>
                  )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pl-13 sm:shrink-0 sm:justify-end sm:pl-0">
              <SeloStatus
                validado={documento.validado}
                statusAnalise={documento.statusAnalise}
                admin={podeValidar}
              />

              <a
                href={`/documentos/${encodeURIComponent(documento.id)}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className={estilos.botaoSecundario}
              >
                <IconeAbrir className="size-4" />
                Abrir PDF
                <span className="sr-only">
                  {' '}
                  {documento.nomeOriginal} (abre em nova aba)
                </span>
              </a>

              {/* Enquanto a IA analisa não há o que validar; um documento
                  recusado ainda pode ser validado, pois a IA pode errar. */}
              {podeValidar && documento.statusAnalise !== 'PENDENTE' && (
                <BotaoValidarDocumento
                  id={documento.id}
                  nomeArquivo={documento.nomeOriginal}
                  validado={documento.validado}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
