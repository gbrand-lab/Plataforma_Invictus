'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Heart, Menu, X } from 'lucide-react';
import { cx } from '@/lib/format';
import { ATALHOS } from '@/lib/urlFiltros';
import { useFavoritosCtx } from '@/lib/favoritos-context';
import { Logo } from './Logo';
import { WhatsAppCTA } from './WhatsAppCTA';

const NAV = [
  { label: 'Na planta/construção', href: ATALHOS.planta },
  { label: 'Pronto para morar', href: ATALHOS.pronto },
  { label: 'Aluguel', href: ATALHOS.alugar },
  { label: 'Repasse de chave', href: ATALHOS.repasse },
  { label: 'Anuncie seu imóvel', href: '/anunciar' },
  { label: 'Área do corretor', href: '/corretor/login' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { favoritos } = useFavoritosCtx();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  return (
    <header
      className={cx(
        'sticky top-0 z-50 h-16 border-b bg-white/85 backdrop-blur-md transition-[border-color,box-shadow] duration-300',
        scrolled ? 'border-line shadow-[0_1px_14px_rgba(18,19,22,.06)]' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-[1240px] items-center gap-6 px-5 sm:px-7">
        <Link href="/" aria-label="Invictus — página inicial">
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="text-[12.5px] font-medium text-ink2 transition-colors hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/favoritos"
            aria-label={`Imóveis salvos (${favoritos.size})`}
            className={cx(
              'relative grid h-10 w-10 place-items-center rounded-xl transition-colors hover:bg-ground',
              pathname === '/favoritos' ? 'text-brand' : 'text-ink2',
            )}
          >
            <Heart
              size={19}
              strokeWidth={1.6}
              className={favoritos.size > 0 ? 'text-brand' : ''}
              fill={favoritos.size > 0 ? '#ED6A1F' : 'none'}
            />
            {favoritos.size > 0 ? (
              <span className="tabular absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-ink px-1 text-[9.5px] font-bold text-white">
                {favoritos.size}
              </span>
            ) : null}
          </Link>

          <WhatsAppCTA
            mensagem="Olá! Gostaria de falar com um corretor da Invictus."
            size="sm"
            className="hidden sm:inline-flex"
          />

          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Abrir menu"
            aria-expanded={menu}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors hover:bg-ground lg:hidden"
          >
            <Menu size={20} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {menu ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setMenu(false)} />
          <div className="sheet-in absolute inset-x-0 top-0 rounded-b-2xl bg-white p-5 pb-7">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenu(false)}
                aria-label="Fechar menu"
                className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-ground"
              >
                <X size={20} strokeWidth={1.7} />
              </button>
            </div>

            <nav className="flex flex-col divide-y divide-line border-y border-line">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="flex items-center justify-between py-3.5 text-[16px] font-medium text-ink"
                >
                  {n.label}
                  <ArrowRight size={17} strokeWidth={1.6} className="text-muted" />
                </Link>
              ))}
            </nav>

            <WhatsAppCTA
              mensagem="Olá! Gostaria de falar com um corretor da Invictus."
              size="lg"
              className="mt-5 w-full"
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
