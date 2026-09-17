import { NextResponse } from 'next/server';
import { BACKEND_URL, getTokenFromCookies } from '@/lib/serverAuth';

export async function GET() {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });

  const resposta = await fetch(`${BACKEND_URL}/imoveis/admin/meus`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const dados = await resposta.json();
  return NextResponse.json(dados, { status: resposta.status });
}
