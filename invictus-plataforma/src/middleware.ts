import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE = 'invictus_token';
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');

interface Area {
  prefixo: string;
  publicas: string[];
  papeis: string[];
}

/** Rotas públicas dentro das áreas protegidas (login/cadastro não exigem sessão). */
const AREAS: Area[] = [
  { prefixo: '/admin', publicas: ['/admin/login'], papeis: ['admin'] },
  { prefixo: '/corretor', publicas: ['/corretor/login', '/corretor/cadastro'], papeis: ['admin', 'corretor'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const area = AREAS.find((a) => pathname.startsWith(a.prefixo));
  if (!area) return NextResponse.next();

  if (area.publicas.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const loginUrl = new URL(area.publicas[0], request.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!area.papeis.includes(payload.role as string)) {
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/corretor/:path*'],
};
