import { NextResponse } from 'next/server';
import { BACKEND_URL, getTokenFromCookies, tokenTemPapel } from '@/lib/serverAuth';

export async function GET() {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });
  if (!(await tokenTemPapel(token, ['admin']))) {
    return NextResponse.json({ detail: 'Acesso restrito ao administrador.' }, { status: 403 });
  }

  const resposta = await fetch(`${BACKEND_URL}/usuarios`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const dados = await resposta.json();
  return NextResponse.json(dados, { status: resposta.status });
}
