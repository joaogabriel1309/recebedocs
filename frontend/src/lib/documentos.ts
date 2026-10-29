import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN, urlApi } from '@/lib/auth';

export type StatusAnalise =
  | 'PENDENTE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'REVISAO_MANUAL';

export type DocumentoResumo = {
  id: string;
  nomeOriginal: string;
  tamanho: number;
  validado: boolean;
  statusAnalise: StatusAnalise;
  motivoAnalise: string | null;
  criadoEm: string;
};

// Documentos que o admin já pode validar: a IA terminou e não recusou.
export function aguardaValidacao(documento: DocumentoResumo): boolean {
  return (
    !documento.validado &&
    documento.statusAnalise !== 'PENDENTE' &&
    documento.statusAnalise !== 'RECUSADO'
  );
}

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