'use server';

import { cookies } from 'next/headers';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN, urlApi } from '@/lib/auth';

export type EstadoEnvio = {
  erro: string;
  sucesso: string;
};

export type EstadoValidacao = {
  erro: string,
  sucesso: string,
}

export async function enviarDocumentos(
  _estadoAnterior: EstadoEnvio,
  formData: FormData,
): Promise<EstadoEnvio> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    redirect('/login');
  }

  const arquivos = formData.getAll('files');

  if (arquivos.length === 0 || arquivos.length > 10) {
    return {
      erro: 'Selecione de 1 a 10 PDFs por envio.',
      sucesso: '',
    };
  }

  const dados = new FormData();
  let tamanhoTotal = 0;

  for (const arquivo of arquivos) {
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return {
        erro: 'Selecione arquivos PDF válidos e não vazios.',
        sucesso: '',
      };
    }

    if (
      arquivo.size > 5 * 1024 * 1024 ||
      !arquivo.name.toLowerCase().endsWith('.pdf')
    ) {
      return {
        erro: `${arquivo.name}: envie um PDF de até 5 MB.`,
        sucesso: '',
      };
    }

    tamanhoTotal += arquivo.size;
    dados.append('files', arquivo);
  }

  if (tamanhoTotal > 20 * 1024 * 1024) {
    return {
      erro: 'A soma dos arquivos deve ser de até 20 MB.',
      sucesso: '',
    };
  }

  let resposta: Response;

  try {
    resposta = await fetch(urlApi('/documentos/lote'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: dados,
      cache: 'no-store',
      signal: AbortSignal.timeout(120000),
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
      erro: 'O limite é 5 MB por arquivo e 20 MB por envio.',
      sucesso: '',
    };
  }

  if (resposta.status === 400 || resposta.status === 422) {
    return {
      erro:
        'Lote inválido. Confira se todos os arquivos são PDFs válidos e se há no máximo 10 arquivos.',
      sucesso: '',
    };
  }

  if (!resposta.ok) {
    return {
      erro: 'Não foi possível salvar os documentos.',
      sucesso: '',
    };
  }

  refresh();

  return {
    erro: '',
    sucesso:
      arquivos.length === 1
        ? 'Documento enviado com sucesso!'
        : `${arquivos.length} documentos enviados com sucesso!`,
  };
}

export async function validarDocumento(
  _estadoAnterior: EstadoValidacao,
  formData: FormData,
): Promise<EstadoValidacao> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    redirect('/login');
  }

  const id = formData.get('id');

  if (typeof id !== 'string' || !id.trim()) {
    return {
      erro: 'Documento inválido.',
      sucesso: '',
    };
  }

  let resposta: Response;

  try {
    resposta = await fetch(
      urlApi(`/documentos/${encodeURIComponent(id)}/validado`),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    return {
      erro: 'Não foi possível confirmar a validação. Atualize a lista.',
      sucesso: '',
    };
  }

  if (resposta.status === 401) {
    cookieStore.delete(COOKIE_TOKEN);
    redirect('/login');
  }

  if (resposta.status === 403) {
    return {
      erro: 'Somente administradores podem validar documentos.',
      sucesso: '',
    };
  }

  if (resposta.status === 404) {
    return {
      erro: 'Documento não encontrado.',
      sucesso: '',
    };
  }

  if (!resposta.ok) {
    return {
      erro: 'Não foi possível validar o documento.',
      sucesso: '',
    };
  }

  refresh();

  return {
    erro: '',
    sucesso: 'Documento validado com sucesso.',
  };
}