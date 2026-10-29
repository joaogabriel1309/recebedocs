import type { StatusAnalise } from '@/lib/documentos';
import { IconeAlerta, IconeCheck, IconeRelogio } from './ui/icones';

type Props = {
  validado: boolean;
  statusAnalise: StatusAnalise;
  admin?: boolean;
};

const base =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset';

export default function SeloStatus({
  validado,
  statusAnalise,
  admin = false,
}: Props) {
  if (validado) {
    return (
      <span className={`${base} bg-green-50 text-green-800 ring-green-600/20`}>
        <IconeCheck className="size-3.5" />
        Documento validado
      </span>
    );
  }

  if (statusAnalise === 'PENDENTE') {
    return (
      <span className={`${base} bg-blue-50 text-blue-800 ring-blue-600/20`}>
        <IconeRelogio className="size-3.5 motion-safe:animate-pulse" />
        Em análise
      </span>
    );
  }

  if (statusAnalise === 'RECUSADO') {
    return (
      <span className={`${base} bg-red-50 text-red-800 ring-red-600/20`}>
        <IconeAlerta className="size-3.5" />
        Recusado
      </span>
    );
  }

  // Para o usuário, uma falha da IA é só mais uma espera; o admin precisa
  // saber que ninguém conferiu o documento ainda.
  return (
    <span className={`${base} bg-amber-50 text-amber-800 ring-amber-600/25`}>
      <IconeRelogio className="size-3.5" />
      {admin && statusAnalise === 'REVISAO_MANUAL'
        ? 'Revisão manual'
        : 'Aguardando validação'}
    </span>
  );
}
