import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_TOKEN, urlApi } from '@/lib/auth';

function redirecionar(endereco: string | URL) {
  return NextResponse.redirect(endereco, {
    status: 303,
    headers: {
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN)?.value;

  if (!token) {
    return redirecionar(new URL('/login', request.url));
  }

  const { id } = await params;

  let resposta: Response;

  try {
    resposta = await fetch(
      urlApi(`/documentos/${encodeURIComponent(id)}/download`),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    return Response.json(
      { erro: 'Não foi possível conectar ao servidor.' },
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  if (resposta.status === 401) {
    cookieStore.delete(COOKIE_TOKEN);

    return redirecionar(new URL('/login', request.url));
  }

  if (!resposta.ok) {
    const status = [400, 403, 404].includes(resposta.status)
      ? resposta.status
      : 502;

    return Response.json(
      {
        erro:
          status === 404
            ? 'Documento não encontrado.'
            : 'Não foi possível abrir o documento.',
      },
      {
        status,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  const download: { url: string } = await resposta.json();

  return redirecionar(download.url);
}