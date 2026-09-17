import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/serverAuth';

/** Público — captura do drawer "quero receber atualizações de imóveis". */
export async function POST(request: Request) {
  const body = await request.json();

  const resposta = await fetch(`${BACKEND_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const dados = await resposta.json().catch(() => ({}));
  return NextResponse.json(dados, { status: resposta.status });
}
