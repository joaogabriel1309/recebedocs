'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN, urlApi } from '@/lib/auth';

export type EstadoLogin = {
  erro: string;
};

type RespostaLogin = {
  accessToken: string;
  expiraEmSegundos: number;
};

export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = formData.get('email');
  const senha = formData.get('senha');

  if (
    typeof email !== 'string' ||
    typeof senha !== 'string' ||
    !email.trim() ||
    !senha ||
    email.trim().length > 254 ||
    senha.length > 128
  ) {
    return {
      erro: 'Preencha um e-mail e uma senha válidos.',
    };
  }

  let resposta: Response;

  try {
    resposta = await fetch(urlApi('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return {
      erro: 'Não foi possível conectar ao servidor. Tente novamente.',
    };
  }

  if (resposta.status === 400 || resposta.status === 401) {
    return {
      erro: 'E-mail ou senha inválidos.',
    };
  }

  if (resposta.status === 429) {
    return {
      erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
    };
  }

  if (!resposta.ok) {
    return {
      erro: 'Não foi possível entrar agora. Tente novamente.',
    };
  }

  const dados: Partial<RespostaLogin> | null = await resposta
    .json()
    .catch(() => null);

  if (
    !dados ||
    typeof dados.accessToken !== 'string' ||
    !dados.accessToken ||
    typeof dados.expiraEmSegundos !== 'number' ||
    !Number.isInteger(dados.expiraEmSegundos) ||
    dados.expiraEmSegundos <= 0
  ) {
    return {
      erro: 'O servidor retornou uma resposta de login inválida.',
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_TOKEN, dados.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: dados.expiraEmSegundos,
  });

  redirect('/painel');
}

export async function sair(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_TOKEN);

  redirect('/login');
}