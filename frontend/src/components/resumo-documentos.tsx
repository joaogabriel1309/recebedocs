import type { ReactNode } from 'react';
import { aguardaValidacao, type DocumentoResumo } from '@/lib/documentos';
import {
  IconeAlerta,
  IconeCheck,
  IconeDocumento,
  IconeRelogio,
  IconeUsuarios,
} from './ui/icones';

type Props = {
  documentos: DocumentoResumo[];
  totalUsuarios?: number;
};

function Indicador({
  rotulo,
  valor,
  icone,
  cor,
  className = '',
}: {
  rotulo: string;
  valor: number;
  icone: ReactNode;
  cor: string;
  className?: string;
}) {
  return (
    <li className={`flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}>
      <span className={`hidden size-10 shrink-0 sm:grid place-items-center rounded-xl ${cor}`}>
        {icone}
      </span>

      <div className="min-w-0">
        <p className="text-xs leading-tight font-medium text-zinc-600">{rotulo}</p>
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
          {valor.toLocaleString('pt-BR')}
        </p>
      </div>
    </li>
  );
}

export default function ResumoDocumentos({ documentos, totalUsuarios }: Props) {
  const validados = documentos.filter((documento) => documento.validado).length;
  const aguardando = documentos.filter(aguardaValidacao).length;
  const emAnalise = documentos.filter(
    (documento) => !documento.validado && documento.statusAnalise === 'PENDENTE',
  ).length;
  const recusados = documentos.filter(
    (documento) => !documento.validado && documento.statusAnalise === 'RECUSADO',
  ).length;

  const ehAdmin = totalUsuarios !== undefined;

  return (
    <ul
      className={`grid grid-cols-2 gap-3 sm:gap-4 ${
        ehAdmin ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4'
      }`}
    >
      <Indicador
        rotulo="Total de documentos"
        valor={documentos.length}
        icone={<IconeDocumento />}
        cor="bg-blue-50 text-blue-700"
        className={ehAdmin ? 'col-span-2 sm:col-span-1' : ''}
      />
      <Indicador
        rotulo="Em análise"
        valor={emAnalise}
        icone={<IconeRelogio />}
        cor="bg-sky-50 text-sky-700"
      />
      <Indicador
        rotulo="Aguardando validação"
        valor={aguardando}
        icone={<IconeRelogio />}
        cor="bg-amber-50 text-amber-700"
      />
      <Indicador
        rotulo="Validados"
        valor={validados}
        icone={<IconeCheck />}
        cor="bg-green-50 text-green-700"
      />
      {ehAdmin && (
        <Indicador
          rotulo="Usuários com envios"
          valor={totalUsuarios}
          icone={<IconeUsuarios />}
          cor="bg-zinc-100 text-zinc-700"
        />
      )}
      {/* Só aparece quando há recusas, ocupando a linha inteira para chamar atenção. */}
      {recusados > 0 && (
        <Indicador
          rotulo="Recusados pela análise"
          valor={recusados}
          icone={<IconeAlerta />}
          cor="bg-red-50 text-red-700"
          className="col-span-full"
        />
      )}
    </ul>
  );
}
