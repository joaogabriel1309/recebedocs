import type { ReactNode } from 'react';
import { IconeCheck, IconeDocumento, IconeRelogio, IconeUsuarios } from './ui/icones';

type Props = {
  documentos: { validado: boolean }[];
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

  return (
    <ul
      className={`grid grid-cols-2 gap-3 sm:gap-4 ${
        totalUsuarios === undefined ? 'sm:grid-cols-3' : 'lg:grid-cols-4'
      }`}
    >
      <Indicador
        rotulo="Total de documentos"
        valor={documentos.length}
        icone={<IconeDocumento />}
        cor="bg-blue-50 text-blue-700"
        className={totalUsuarios === undefined ? 'col-span-2 sm:col-span-1' : ''}
      />
      <Indicador
        rotulo="Aguardando validação"
        valor={documentos.length - validados}
        icone={<IconeRelogio />}
        cor="bg-amber-50 text-amber-700"
      />
      <Indicador
        rotulo="Validados"
        valor={validados}
        icone={<IconeCheck />}
        cor="bg-green-50 text-green-700"
      />
      {totalUsuarios !== undefined && (
        <Indicador
          rotulo="Usuários com envios"
          valor={totalUsuarios}
          icone={<IconeUsuarios />}
          cor="bg-zinc-100 text-zinc-700"
        />
      )}
    </ul>
  );
}
