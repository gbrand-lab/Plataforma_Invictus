'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cx } from '@/lib/format';

const LINKS = [
  { href: '/corretor', label: 'Meus imóveis' },
  { href: '/corretor/imoveis/novo', label: 'Novo imóvel' },
];

const PUBLICAS = ['/corretor/login', '/corretor/cadastro'];

export function CorretorNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (PUBLICAS.includes(pathname)) return null;

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/corretor/login');
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4">
        <div className="flex items-center gap-8">
          <span className="font-display text-[18px] font-[440] tracking-[-0.015em] text-ink">
            Invictus <span className="text-brand">Corretor</span>
          </span>
          <nav className="flex gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  'rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors',
                  pathname === link.href ? 'bg-wash text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={sair}
          className="rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
