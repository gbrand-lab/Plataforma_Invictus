import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const AUTH_COOKIE = 'invictus_token';

export const BACKEND_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8000';

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');

/** Lê o token JWT do cookie httpOnly — usado em Route Handlers e Server Components do /admin. */
export function getTokenFromCookies(): string | undefined {
  return cookies().get(AUTH_COOKIE)?.value;
}

/**
 * Confere o papel do token localmente antes de repassar ao backend — defesa em
 * profundidade: o backend também valida, mas assim uma rota /api/admin/* nova
 * que esqueça de checar não fica exposta a qualquer usuário autenticado.
 */
export async function tokenTemPapel(token: string, papeis: string[]): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return papeis.includes(payload.role as string);
  } catch {
    return false;
  }
}
