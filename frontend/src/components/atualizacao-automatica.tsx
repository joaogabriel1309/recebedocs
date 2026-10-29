'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  ativa: boolean;
  intervalo?: number;
};

// Recarrega os Server Components enquanto há documentos na fila de análise,
// para o status mudar na tela sem o usuário precisar atualizar a página.
export default function AtualizacaoAutomatica({
  ativa,
  intervalo = 5000,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!ativa) {
      return;
    }

    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    }, intervalo);

    return () => clearInterval(id);
  }, [ativa, intervalo, router]);

  return null;
}
