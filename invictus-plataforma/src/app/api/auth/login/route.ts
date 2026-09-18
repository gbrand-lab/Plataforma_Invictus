import { NextResponse } from 'next/server';
import { AUTH_COOKIE, BACKEND_URL, formatarErroBackend } from '@/lib/serverAuth';

export async function POST(request: Request) {
  const body = await request.json();

  const resposta = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    const detail = formatarErroBackend(erro.detail, 'E-mail ou senha inválidos.');
    return NextResponse.json({ detail }, { status: resposta.status });
  }

  const { access_token: token } = await resposta.json();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h — mesmo prazo do JWT no backend
  });
  return res;
}
