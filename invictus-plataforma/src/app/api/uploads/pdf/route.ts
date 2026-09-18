import { NextResponse } from 'next/server';
import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';

/** Repassa o PDF (book do imóvel) ao backend, que devolve uma imagem por página. */
export async function POST(request: Request) {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });

  const formData = await request.formData();

  const resposta = await fetch(`${BACKEND_URL}/uploads/pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: 'no-store',
  });
  const dados = await resposta.json().catch(() => ({}));
  return NextResponse.json(dados, { status: resposta.status });
}
