'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cx } from '@/lib/format';

const LINKS = [
  { href: '/admin', label: 'Imóveis' },
  { href: '/admin/imoveis/novo', label: 'Novo imóvel' },
  { href: '/admin/corretores', label: 'Corretores' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/configuracoes', label: 'Configurações' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return null;

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4">
        <div className="flex items-center gap-8">
          <span className="font-display text-[18px] font-[440] tracking-[-0.015em] text-ink">
            Invictus <span className="text-brand">Admin</span>
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
