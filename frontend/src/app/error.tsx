'use client';

import { useEffect } from 'react';

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
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-100 px-4 py-12 text-center text-zinc-900">
      <h1 className="text-2xl font-bold">
        Não foi possível carregar esta página
      </h1>

      <p className="max-w-md text-zinc-600">
        O servidor pode estar indisponível no momento. Tente novamente
        em alguns instantes.
      </p>

      <button
        type="button"
        onClick={() => retry()}
        className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white"
      >
        Tentar novamente
      </button>
    </main>
  );
}
