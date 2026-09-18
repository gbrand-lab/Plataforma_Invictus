import { NextResponse } from 'next/server';
import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';

/** Repassa o upload do vídeo do imóvel ao backend, anexando o token da sessão. */
export async function POST(request: Request) {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });

  const formData = await request.formData();

  const resposta = await fetch(`${BACKEND_URL}/uploads/video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: 'no-store',
  });
  const dados = await resposta.json().catch(() => ({}));
  return NextResponse.json(dados, { status: resposta.status });
}
