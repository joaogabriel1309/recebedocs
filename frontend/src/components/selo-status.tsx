import { IconeCheck, IconeRelogio } from './ui/icones';

type Props = {
  validado: boolean;
};

export default function SeloStatus({ validado }: Props) {
  return validado ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 ring-1 ring-green-600/20 ring-inset">
      <IconeCheck className="size-3.5" />
      Documento validado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-600/25 ring-inset">
      <IconeRelogio className="size-3.5" />
      Aguardando validação
    </span>
  );
}
