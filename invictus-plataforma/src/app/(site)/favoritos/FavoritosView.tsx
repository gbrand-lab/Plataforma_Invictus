'use client';

import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { PropertyGrid } from '@/components/PropertyGrid';
import { btnClass } from '@/components/ui';
import { useFavoritosCtx } from '@/lib/favoritos-context';
import { num } from '@/lib/format';
import type { Imovel } from '@/lib/types';

export function FavoritosView({ imoveis }: { imoveis: Imovel[] }) {
  const { favoritos, pronto } = useFavoritosCtx();
  const salvos = imoveis.filter((i) => favoritos.has(i.id));

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-7 sm:py-14">
      <h1 className="text-[27px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">Imóveis salvos</h1>
      <p className="tabular mt-1.5 text-[14.5px] text-ink2">
        {salvos.length === 0
          ? 'Você ainda não salvou nenhum imóvel.'
          : `${num(salvos.length)} ${salvos.length === 1 ? 'imóvel salvo' : 'imóveis salvos'}`}
      </p>

      {pronto && salvos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-wash text-brand">
            <Heart size={22} strokeWidth={1.6} />
          </span>
          <p className="mx-auto mt-4 max-w-[42ch] text-[14.5px] leading-relaxed text-ink2">
            Toque no coração de qualquer imóvel para guardá-lo aqui e comparar depois com calma.
          </p>
          <Link href="/imoveis" className={btnClass('primary', 'md', 'mt-6')}>
            <Search size={16} strokeWidth={1.7} /> Buscar imóveis
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <PropertyGrid imoveis={salvos} />
        </div>
      )}
    </div>
  );
}
