import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PartnerPropertyView } from '@/components/PartnerPropertyView';
import { getImovel, publicados, semelhantes } from '@/lib/data';

interface Props {
  params: { slug: string };
}

/** Imóveis vêm da API (dados administráveis) — a página é renderizada sob demanda. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imovel = await getImovel(params.slug);
  if (!imovel) return { title: 'Imóvel não encontrado' };

  return {
    title: imovel.titulo,
    robots: { index: false, follow: false },
  };
}

/**
 * Mesmo conteúdo de /imovel/[slug], mas sem corretor, CRECI ou botão de
 * contato — é a versão "só consulta" usada pela vitrine de parceiros.
 */
export default async function ParceirosImovelPage({ params }: Props) {
  const imovel = await getImovel(params.slug);
  if (!imovel || imovel.status !== 'published') notFound();

  const relacionados = semelhantes(imovel, await publicados(), 3);

  return <PartnerPropertyView imovel={imovel} relacionados={relacionados} />;
}
