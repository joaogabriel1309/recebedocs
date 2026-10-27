import type { DocumentoResumo } from '@/lib/documentos';
import BotaoValidarDocumento from './botao-validar-documento';

type Props = {
  documentos: DocumentoResumo[];
  podeValidar?: boolean;
};

export default function ListaDocumentos({ documentos, podeValidar = false }: Props) {
  if (documentos.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Nenhum documento enviado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200">
          <tr>
            <th scope="col" className="py-3 pr-4">
              Arquivo
            </th>

            <th scope="col" className="py-3 pr-4">
              Tamanho
            </th>

            <th scope="col" className="py-3 pr-4">
              Status
            </th>

            <th scope="col" className="py-3">
              Ação
            </th>
          </tr>
        </thead>

        <tbody>
          {documentos.map((documento) => (
            <tr
              key={documento.id}
              className="border-b border-zinc-100"
            >
              <td className="break-all py-3 pr-4">
                {documento.nomeOriginal}
              </td>

              <td className="whitespace-nowrap py-3 pr-4">
                {(documento.tamanho / 1024).toLocaleString(
                  'pt-BR',
                  { maximumFractionDigits: 1 },
                )}{' '}
                KB
              </td>

              <td className="py-3 pr-4">
                <span
                  className={
                    documento.validado
                      ? 'inline-block text-green-800'
                      : 'inline-block text-amber-800'
                  }
                >
                  {documento.validado
                    ? 'Documento validado'
                    : 'Aguardando validação'}
                </span>
              </td>

              <td className="whitespace-nowrap py-3">
                <a
                  href={`/documentos/${encodeURIComponent(documento.id)}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 underline"
                >
                  Abrir PDF
                </a>
                {podeValidar && (
                  <BotaoValidarDocumento
                    id={documento.id}
                    validado={documento.validado}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}