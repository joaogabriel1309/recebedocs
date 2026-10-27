import { Suspense } from 'react';
import { sair } from '@/app/actions/auth';
import ListaDocumentos from '@/components/lista-documentos';
import { obterUsuario } from '@/lib/auth';
import {
  listarDocumentos,
  listarDocumentosPorUsuario,
} from '@/lib/documentos';
import FormularioEnvio from '@/components/formulario-envio';

async function DocumentosUsuario() {
  const documentos = await listarDocumentos();

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">
        Meus documentos
      </h2>

      <ListaDocumentos documentos={documentos} />
    </section>
  );
}

async function DocumentosAdmin() {
  const [grupos, documentos] = await Promise.all([
    listarDocumentosPorUsuario(),
    listarDocumentos(),
  ]);

  const semProprietario = documentos.filter(
    (documento) => documento.usuarioId === null,
  );

  return (
    <section className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">
        Documentos recebidos
      </h2>

      {grupos.length === 0 && semProprietario.length === 0 && (
        <p className="text-sm text-zinc-600">
          Nenhum documento recebido.
        </p>
      )}

      {grupos.map((grupo) => (
        <article
          key={grupo.id}
          className="rounded-lg border border-zinc-200 p-4"
        >
          <h3 className="font-semibold">{grupo.nome}</h3>

          <p className="mt-1 text-sm text-zinc-600">
            {grupo.email}
          </p>

          <p className="mb-4 mt-1 text-sm text-zinc-600">
            Documentos enviados: {grupo.totalDocumentos}
          </p>

          <ListaDocumentos
            documentos={grupo.documentos}
            podeValidar
          />
        </article>
      ))}

      {semProprietario.length > 0 && (
        <article className="rounded-lg border border-zinc-200 p-4">
          <h3 className="font-semibold">
            Documentos sem proprietário
          </h3>

          <p className="mb-4 mt-1 text-sm text-zinc-600">
            Arquivos antigos que ainda não foram vinculados a uma conta.
          </p>

          <ListaDocumentos
            documentos={semProprietario}
            podeValidar
          />
        </article>
      )}
    </section>
  );
}

async function ConteudoPainel() {
  const usuario = await obterUsuario();

  return (
    <div className="w-full max-w-5xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4">
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
      </header>

      {usuario.perfil === 'USUARIO' && (
        <FormularioEnvio />
      )}

      <Suspense
        fallback={<p className="mt-8">Carregando documentos...</p>}
      >
        {usuario.perfil === 'ADMIN' ? (
          <DocumentosAdmin />
        ) : (
          <DocumentosUsuario />
        )}
      </Suspense>
    </div>
  );
}

export default function PainelPage() {
  return (
    <main className="flex flex-1 items-start justify-center bg-zinc-100 px-4 py-10 text-zinc-900">
      <Suspense
        fallback={<p role="status">Carregando seu painel...</p>}
      >
        <ConteudoPainel />
      </Suspense>
    </main>
  );
}