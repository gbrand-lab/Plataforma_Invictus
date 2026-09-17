import type { Metadata } from 'next';
import { publicados } from '@/lib/data';
import { PropertyGrid } from '@/components/PropertyGrid';

export const metadata: Metadata = {
  title: 'Parceiros',
  description: 'Catálogo completo de imóveis da Invictus para consulta de parceiros.',
  robots: { index: false, follow: false },
};

/**
 * Vitrine para parceiros: mostra todo o catálogo publicado, sem nome de
 * corretor nem botão de contato — a única ação é clicar e ir para a página
 * normal do imóvel (/imovel/[slug]), onde aí sim aparece o contato da Invictus.
 */
export default async function ParceirosPage() {
  const imoveis = await publicados();

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-7">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Invictus</p>
        <h1 className="mt-2 text-balance font-display text-[28px] font-[440] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[34px]">
          Catálogo para parceiros
        </h1>
        <p className="mt-2 max-w-[60ch] text-[14.5px] leading-relaxed text-ink2">
          Todos os imóveis publicados na plataforma, para consulta. Clique em um imóvel para ver todos os detalhes.
        </p>
      </div>

      {imoveis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-[14px] text-muted">Nenhum imóvel publicado no momento.</p>
        </div>
      ) : (
        <PropertyGrid imoveis={imoveis} hrefBase="/parceiros/imovel" />
      )}
    </div>
  );
}
