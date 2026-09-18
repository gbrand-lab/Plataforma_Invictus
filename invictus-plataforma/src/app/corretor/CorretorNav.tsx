'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cx } from '@/lib/format';
import { Logo } from '@/components/Logo';

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
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-[16px] font-[440] text-brand">Corretor</span>
        </div>
        <button
          type="button"
          onClick={sair}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          Sair
        </button>
      </div>
      <nav className="scrollbar-none flex gap-1 overflow-x-auto whitespace-nowrap border-t border-line px-5 py-2 sm:mx-auto sm:max-w-[1100px] sm:border-t-0 sm:px-5 sm:pb-4 sm:pt-0">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cx(
              'shrink-0 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors',
              pathname === link.href ? 'bg-wash text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
