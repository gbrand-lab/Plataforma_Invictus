import type { Imovel } from '@/lib/types';
import { cx } from '@/lib/format';
import { PropertyCard } from './PropertyCard';
import { GridSkeleton } from './ui';

interface PropertyGridProps {
  imoveis: Imovel[];
  carregando?: boolean;
  /** Classe de colunas do breakpoint lg — abaixo disso é sempre 1 ou 2 colunas. */
  cols?: string;
  /** Base do link dos cards — `/parceiros/imovel` na vitrine de parceiros, sem contato. */
  hrefBase?: string;
}

export function PropertyGrid({ imoveis, carregando = false, cols = 'lg:grid-cols-3', hrefBase }: PropertyGridProps) {
  if (carregando) return <GridSkeleton quantidade={6} />;

  return (
    <div className={cx('grid grid-cols-1 gap-5 sm:grid-cols-2', cols)}>
      {imoveis.map((imovel, i) => (
        <PropertyCard key={imovel.id} imovel={imovel} priority={i < 3} className="h-full" hrefBase={hrefBase} />
      ))}
    </div>
  );
}
