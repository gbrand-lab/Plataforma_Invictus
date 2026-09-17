import { NextResponse } from 'next/server';
import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });

  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const dados = await resposta.json();
  return NextResponse.json(dados, { status: resposta.status });
}

export async function PATCH(request: Request, { params }: Params) {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });

  const body = await request.json();
  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/${params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const dados = await resposta.json();
  return NextResponse.json(dados, { status: resposta.status });
}

export async function DELETE(_request: Request, { params }: Params) {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });

  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/${params.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (resposta.status === 204) return new NextResponse(null, { status: 204 });
  const dados = await resposta.json().catch(() => ({}));
  return NextResponse.json(dados, { status: resposta.status });
}
