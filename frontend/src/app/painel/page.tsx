import { Suspense } from 'react';
import { sair } from '@/app/actions/auth';
import ListaDocumentos from '@/components/lista-documentos';
import { obterUsuario, type UsuarioAutenticado } from '@/lib/auth';
import {
  listarDocumentos,
  listarDocumentosPorUsuario,
} from '@/lib/documentos';
import FormularioEnvio from '@/components/formulario-envio';
import ResumoDocumentos from '@/components/resumo-documentos';
import Logo from '@/components/ui/logo';
import { estilos } from '@/components/ui/estilos';
import { IconeSair } from '@/components/ui/icones';
import { iniciais, primeiroNome } from '@/lib/formatar';

function Avatar({ nome, pequeno = false }: { nome: string; pequeno?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-blue-100 font-semibold text-blue-800 ${
        pequeno ? 'size-9 text-xs' : 'size-10 text-sm'
      }`}
    >
      {iniciais(nome)}
    </span>
  );
}

function Esqueleto({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl bg-zinc-200/70 motion-safe:animate-pulse ${className}`}
    />
  );
}

function EsqueletoLista() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Carregando documentos...</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Esqueleto className="col-span-2 h-20 sm:col-span-1" />
        <Esqueleto className="h-20" />
        <Esqueleto className="h-20" />
      </div>
      <Esqueleto className="h-72" />
    </div>
  );
}

async function DocumentosUsuario() {
  const documentos = await listarDocumentos();

  return (
    <div className="space-y-6">
      <ResumoDocumentos documentos={documentos} />

      <section
        aria-labelledby="titulo-meus-documentos"
        className={`${estilos.cartao} p-5 sm:p-6`}
      >
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2
            id="titulo-meus-documentos"
            className="text-base font-semibold text-zinc-900"
          >
            Meus documentos
          </h2>

          <span className="text-sm text-zinc-600">
            {documentos.length}{' '}
            {documentos.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
        </div>

        <ListaDocumentos
          documentos={documentos}
          mensagemVazia="Use o formulário de envio para mandar seus primeiros PDFs."
        />
      </section>
    </div>
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
    <div className="space-y-6">
      <ResumoDocumentos
        documentos={documentos}
        totalUsuarios={grupos.length}
      />

      <section aria-labelledby="titulo-recebidos" className="space-y-4">
        <h2
          id="titulo-recebidos"
          className="text-base font-semibold text-zinc-900"
        >
          Documentos recebidos
        </h2>

        {grupos.length === 0 && semProprietario.length === 0 && (
          <div className={`${estilos.cartao} p-5 sm:p-6`}>
            <ListaDocumentos
              documentos={[]}
              mensagemVazia="Quando os usuários enviarem PDFs, eles aparecerão aqui."
            />
          </div>
        )}

        {grupos.map((grupo) => {
          const pendentes = grupo.documentos.filter(
            (documento) => !documento.validado,
          ).length;

          return (
            <article
              key={grupo.id}
              aria-labelledby={`usuario-${grupo.id}`}
              className={estilos.cartao}
            >
              <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-zinc-100 px-5 py-4 sm:px-6">
                <div className="flex min-w-60 flex-1 items-center gap-3">
                  <Avatar nome={grupo.nome} />

                  <div className="min-w-0">
                    <h3
                      id={`usuario-${grupo.id}`}
                      className="truncate font-semibold text-zinc-900"
                    >
                      {grupo.nome}
                    </h3>

                    <p className="truncate text-sm text-zinc-600">
                      {grupo.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700">
                    Documentos enviados: {grupo.totalDocumentos}
                  </span>

                  {pendentes > 0 ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-600/25 ring-inset">
                      {pendentes}{' '}
                      {pendentes === 1 ? 'pendente' : 'pendentes'}
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-800 ring-1 ring-green-600/20 ring-inset">
                      Tudo validado
                    </span>
                  )}
                </div>
              </header>

              <div className="px-5 py-4 sm:px-6">
                <ListaDocumentos
                  documentos={grupo.documentos}
                  podeValidar
                />
              </div>
            </article>
          );
        })}

        {semProprietario.length > 0 && (
          <article
            aria-labelledby="titulo-sem-proprietario"
            className={`${estilos.cartao} border-dashed`}
          >
            <header className="border-b border-zinc-100 px-5 py-4 sm:px-6">
              <h3
                id="titulo-sem-proprietario"
                className="font-semibold text-zinc-900"
              >
                Documentos sem proprietário
              </h3>

              <p className="mt-0.5 text-sm text-zinc-600">
                Arquivos antigos que ainda não foram vinculados a uma conta.
              </p>
            </header>

            <div className="px-5 py-4 sm:px-6">
              <ListaDocumentos
                documentos={semProprietario}
                podeValidar
              />
            </div>
          </article>
        )}
      </section>
    </div>
  );
}

function Cabecalho({ usuario }: { usuario: UsuarioAutenticado }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium text-zinc-900">
              {usuario.nome}
            </p>
            <p className="truncate text-xs text-zinc-600">
              {usuario.email}
            </p>
          </div>

          <Avatar nome={usuario.nome} pequeno />

          <form action={sair}>
            <button type="submit" className={estilos.botaoSecundario}>
              <IconeSair className="size-4" />
              <span className="sr-only sm:not-sr-only">Sair</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

async function ConteudoPainel() {
  const usuario = await obterUsuario();
  const ehAdmin = usuario.perfil === 'ADMIN';

  return (
    <>
      <Cabecalho usuario={usuario} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Olá, {primeiroNome(usuario.nome)}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                ehAdmin
                  ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-700/20 ring-inset'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              <span className="sr-only">Perfil: </span>
              {ehAdmin ? 'Administrador' : 'Usuário'}
            </span>
          </div>

          <p className="mt-2 text-zinc-600">
            {ehAdmin
              ? 'Revise e valide os documentos enviados pelos usuários.'
              : 'Envie seus PDFs e acompanhe a validação de cada um.'}
          </p>

          <p className="mt-1 text-sm text-zinc-600 sm:hidden">
            {usuario.email}
          </p>
        </div>

        {ehAdmin ? (
          <Suspense fallback={<EsqueletoLista />}>
            <DocumentosAdmin />
          </Suspense>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <FormularioEnvio />
            </div>

            <Suspense fallback={<EsqueletoLista />}>
              <DocumentosUsuario />
            </Suspense>
          </div>
        )}
      </main>
    </>
  );
}

function EsqueletoPainel() {
  return (
    <div role="status" className="flex flex-1 flex-col">
      <span className="sr-only">Carregando seu painel...</span>

      <div className="h-16 border-b border-zinc-200 bg-white" />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <Esqueleto className="h-9 w-56" />
        <Esqueleto className="h-5 w-80 max-w-full" />
        <Esqueleto className="h-64" />
      </div>
    </div>
  );
}

export default function PainelPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<EsqueletoPainel />}>
        <ConteudoPainel />
      </Suspense>
    </div>
  );
}
