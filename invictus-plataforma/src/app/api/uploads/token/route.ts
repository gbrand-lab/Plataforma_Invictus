import { NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/serverAuth';

/**
 * Foto, PDF e vídeo vão direto do navegador pro backend (não passam pelo proxy
 * do Next.js — a Vercel limita bem o tamanho do corpo das suas próprias
 * functions, o que rejeitava foto de celular antes mesmo de chegar no backend).
 * Essa rota só devolve o mesmo token JWT já guardado no cookie httpOnly da
 * sessão, pra o navegador usar num único POST direto ao backend.
 */
export async function GET() {
  const token = getTokenFromCookies();
  if (!token) return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });
  return NextResponse.json({ token });
}
