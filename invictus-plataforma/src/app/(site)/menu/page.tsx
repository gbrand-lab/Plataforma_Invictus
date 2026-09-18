import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Building2, Home, KeyRound, LayoutGrid, Repeat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ATALHOS } from '@/lib/urlFiltros';
import { AbrirLeadDrawerButton } from '@/components/AbrirLeadDrawerButton';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Escolha o que você procura: na planta/construção, pronto para morar, aluguel ou repasse de chave.',
};

interface Opcao {
  titulo: string;
  texto: string;
  href: string;
  Icone: LucideIcon;
}

const OPCOES: Opcao[] = [
  {
    titulo: 'Ver todas as opções',
    texto: 'Todo o catálogo de imóveis disponíveis.',
    href: ATALHOS.todos,
    Icone: LayoutGrid,
  },
  {
    titulo: 'Na planta/construção',
    texto: 'Imóvel na planta/construção.',
    href: ATALHOS.planta,
    Icone: Building2,
  },
  {
    titulo: 'Pronto para morar',
    texto: 'Imóvel pronto para morar.',
    href: ATALHOS.pronto,
    Icone: KeyRound,
  },
  {
    titulo: 'Aluguel',
    texto: 'Encontre seu próximo imóvel para alugar.',
    href: ATALHOS.alugar,
    Icone: Home,
  },
  {
    titulo: 'Repasse de chave',
    texto: 'Assuma o financiamento e entre com as chaves na mão.',
    href: ATALHOS.repasse,
    Icone: Repeat,
  },
];

/** Tela central de navegação — o app é para escolher rápido o que procura, sem passar pela home institucional. */
export default function MenuPage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Invictus</p>
        <h1 className="mt-2 text-balance font-display text-[28px] font-[440] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[34px]">
          O que você procura?
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {OPCOES.map((o) => (
          <Link
            key={o.titulo}
            href={o.href}
            className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-200 ease-invictus hover:border-ink/15 hover:shadow-lift"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-wash text-brandDeep">
              <o.Icone size={22} strokeWidth={1.6} />
            </span>
            <span className="flex-1">
              <span className="block text-[17px] font-semibold tracking-[-0.01em] text-ink">{o.titulo}</span>
              <span className="mt-0.5 block text-[13.5px] text-ink2">{o.texto}</span>
            </span>
            <ArrowRight
              size={18}
              strokeWidth={1.7}
              className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand"
            />
          </Link>
        ))}
      </div>

      <AbrirLeadDrawerButton className="mx-auto mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-[14px] font-medium text-ink2 transition-colors hover:border-ink/30 hover:text-ink" />
    </div>
  );
}
