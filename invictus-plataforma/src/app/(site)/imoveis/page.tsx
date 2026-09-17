import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertyListing } from '@/components/PropertyListing';
import { GridSkeleton } from '@/components/ui';
import { publicados } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Imóveis em São Luís/MA',
  description:
    'Busque por bairro, tipo, quartos e faixa de preço no catálogo da Invictus — venda e locação em São Luís, São José de Ribamar e Paço do Lumiar.',
};

async function ListingData() {
  const imoveis = await publicados();
  return <PropertyListing imoveis={imoveis} />;
}

/** Listagem — o estado dos filtros vive na querystring (ver lib/urlFiltros). */
export default function ImoveisPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-7">
          <GridSkeleton />
        </div>
      }
    >
      <ListingData />
    </Suspense>
  );
}
