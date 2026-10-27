'use server';

import { cookies } from 'next/headers';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN, urlApi } from '@/lib/auth';

export type EstadoEnvio = {
  erro: string;
  sucesso: string;
};

export async function enviarDocumento(
  _estadoAnterior: EstadoEnvio,
  formData: FormData,
): Promise<EstadoEnvio> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    redirect('/login');
  }

  const arquivo = formData.get('file');

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return {
      erro: 'Selecione um arquivo PDF válido.',
      sucesso: '',
    };
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    return {
      erro: 'O arquivo deve ter no máximo 5 MB.',
      sucesso: '',
    };
  }

  if (!arquivo.name.toLowerCase().endsWith('.pdf')) {
    return {
      erro: 'Envie um arquivo com extensão .pdf.',
      sucesso: '',
    };
  }

  const dados = new FormData();
  dados.append('file', arquivo);

  let resposta: Response;

  try {
    resposta = await fetch(urlApi('/documentos'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: dados,
      cache: 'no-store',
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    return {
      erro:
        'Não foi possível confirmar o envio. Atualize a lista antes de tentar novamente.',
      sucesso: '',
    };
  }

  if (resposta.status === 401) {
    cookieStore.delete(COOKIE_TOKEN);
    redirect('/login');
  }

  if (resposta.status === 413) {
    return {
      erro: 'O arquivo ultrapassou o limite permitido.',
      sucesso: '',
    };
  }

  if (resposta.status === 400 || resposta.status === 422) {
    return {
      erro: 'Arquivo inválido. Envie um PDF válido de até 5 MB.',
      sucesso: '',
    };
  }

  if (!resposta.ok) {
    return {
      erro: 'Não foi possível salvar o documento. Tente novamente mais tarde.',
      sucesso: '',
    };
  }

  refresh();

  return {
    erro: '',
    sucesso: 'Documento enviado com sucesso!',
  };
}