import { NextResponse } from 'next/server';
import { BACKEND_URL, getTokenFromCookies, tokenTemPapel } from '@/lib/serverAuth';

export async function GET() {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });
  if (!(await tokenTemPapel(token, ['admin']))) {
    return NextResponse.json({ detail: 'Acesso restrito ao administrador.' }, { status: 403 });
  }

  const resposta = await fetch(`${BACKEND_URL}/config`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const dados = await resposta.json();
  return NextResponse.json(dados, { status: resposta.status });
}

export async function PATCH(request: Request) {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });
  if (!(await tokenTemPapel(token, ['admin']))) {
    return NextResponse.json({ detail: 'Acesso restrito ao administrador.' }, { status: 403 });
  }

  const body = await request.json();
  const resposta = await fetch(`${BACKEND_URL}/config`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const dados = await resposta.json();
  return NextResponse.json(dados, { status: resposta.status });
}
