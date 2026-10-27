import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const COOKIE_TOKEN = 'recebedocs_token';

export type UsuarioAutenticado = {
  id: string;
  nome: string;
  email: string;
  perfil: 'USUARIO' | 'ADMIN';
  criadoEm: string;
};

export function urlApi(caminho: string): string {
  const endereco = process.env.API_URL;

  if (!endereco) {
    throw new Error('A variável API_URL não foi configurada');
  }

  return new URL(caminho, endereco).toString();
}

export async function obterUsuario(): Promise<UsuarioAutenticado> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    redirect('/login');
  }

  const resposta = await fetch(urlApi('/auth/me'), {
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
    throw new Error('Não foi possível consultar o usuário');
  }

  return resposta.json();
}