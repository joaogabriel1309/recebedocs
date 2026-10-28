import { IconeDocumento } from './icones';

type Props = {
  tamanho?: 'normal' | 'grande';
};

export default function Logo({ tamanho = 'normal' }: Props) {
  const grande = tamanho === 'grande';

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid place-items-center rounded-xl bg-blue-700 text-white shadow-sm ${
          grande ? 'size-12' : 'size-9'
        }`}
      >
        <IconeDocumento className={grande ? 'size-7' : 'size-5'} />
      </span>

      <span
        className={`font-semibold tracking-tight text-zinc-900 ${
          grande ? 'text-2xl' : 'text-lg'
        }`}
      >
        Recebe<span className="text-blue-700">Docs</span>
      </span>
    </span>
  );
}
