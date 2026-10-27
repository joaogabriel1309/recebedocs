import { Suspense } from 'react';
import { sair } from '@/app/actions/auth';
import { obterUsuario } from '@/lib/auth';

async function ConteudoPainel() {
  const usuario = await obterUsuario();

  return (
    <section className="w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Olá, {usuario.nome}
          </h1>

          <p className="mt-2 text-zinc-600">
            {usuario.email}
          </p>

          <p className="mt-1 text-sm text-zinc-600">
            Perfil:{' '}
            {usuario.perfil === 'ADMIN'
              ? 'Administrador'
              : 'Usuário'}
          </p>
        </div>

        <form action={sair}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2"
          >
            Sair
          </button>
        </form>
      </div>
    </section>
  );
}

export default function PainelPage() {
  return (
    <main className="flex flex-1 justify-center bg-zinc-100 px-4 py-10 text-zinc-900">
      <Suspense
        fallback={<p role="status">Carregando seu painel...</p>}
      >
        <ConteudoPainel />
      </Suspense>
    </main>
  );
}