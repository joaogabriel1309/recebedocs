'use client';

import { useEffect } from 'react';
import { estilos } from '@/components/ui/estilos';
import { IconeAlerta } from '@/components/ui/icones';
import Logo from '@/components/ui/logo';

export default function Erro({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>

      <div className={`${estilos.cartao} w-full max-w-md p-6 text-center sm:p-8`}>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-700">
          <IconeAlerta className="size-6" />
        </span>

        <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">
          Não foi possível carregar esta página
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          O servidor pode estar indisponível no momento. Tente novamente
          em alguns instantes.
        </p>

        <button
          type="button"
          onClick={() => retry()}
          className={`${estilos.botaoPrimario} mt-6 w-full sm:w-auto`}
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
