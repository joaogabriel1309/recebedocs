import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN, urlApi } from '@/lib/auth';

export type DocumentoResumo = {
  id: string;
  nomeOriginal: string;
  tamanho: number;
  validado: boolean;
  criadoEm: string;
};

type DocumentoComUsuario = DocumentoResumo & {
  usuarioId: string | null;
};

export type DocumentosPorUsuario = {
  id: string;
  nome: string;
  email: string;
  totalDocumentos: number;
  documentos: DocumentoResumo[];
};

const FORMATO_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Impede que um id como ".." altere o caminho da chamada à API.
export function ehIdDocumentoValido(id: unknown): id is string {
  return typeof id === 'string' && FORMATO_UUID.test(id);
}

async function consultarApi<T>(caminho: string): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    redirect('/login');
  }

  const resposta = await fetch(urlApi(caminho), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  if (resposta.status === 401) {
    redirect('/login');
  }

  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os documentos');
  }

  return resposta.json();
}

export function listarDocumentos(): Promise<DocumentoComUsuario[]> {
  return consultarApi<DocumentoComUsuario[]>('/documentos');
}

export function listarDocumentosPorUsuario(): Promise<
  DocumentosPorUsuario[]
> {
  return consultarApi<DocumentosPorUsuario[]>(
    '/admin/usuarios/documentos',
  );
}