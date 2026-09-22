import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyView } from '@/components/PropertyView';
import { CONFIG } from '@/lib/config';
import { getImovel, publicados, semelhantes } from '@/lib/data';
import { money } from '@/lib/format';
import type { Imovel } from '@/lib/types';

interface Props {
  params: { slug: string };
}

/** Imóveis vêm da API (dados administráveis) — a página é renderizada sob demanda. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imovel = await getImovel(params.slug);
  if (!imovel) return { title: 'Imóvel não encontrado' };

  const titulo = `${imovel.titulo} — ${money(imovel.preco)}`;
  const descricao = `${imovel.titulo} em ${imovel.bairro}, ${imovel.cidade}/MA. ${
    imovel.quartos ? `${imovel.quartos} quartos, ` : ''
  }${imovel.area} m². ${
    imovel.finalidade === 'venda' ? 'À venda por ' : imovel.finalidade === 'aluguel' ? 'Aluguel de ' : 'Repasse por '
  }${money(imovel.preco)}.`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/imovel/${imovel.slug}` },
    openGraph: {
      type: 'article',
      title: titulo,
      description: descricao,
      url: `${CONFIG.siteUrl}/imovel/${imovel.slug}`,
      // Com fotos reais, aponte aqui para a imagem de capa (1200x630).
      images: imovel.imagens[0]?.startsWith('http') ? [imovel.imagens[0]] : undefined,
    },
  };
}

/** Schema.org — ajuda o Google a exibir preço, área e localização no resultado. */
function jsonLd(imovel: Imovel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.titulo,
    description: imovel.descricao,
    url: `${CONFIG.siteUrl}/imovel/${imovel.slug}`,
    datePosted: imovel.publicadoEm,
    offers: {
      '@type': 'Offer',
      price: imovel.preco,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      businessFunction:
        imovel.finalidade === 'aluguel'
          ? 'http://purl.org/goodrelations/v1#LeaseOut'
          : 'http://purl.org/goodrelations/v1#Sell',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: imovel.endereco,
      addressLocality: imovel.cidade,
      addressRegion: 'MA',
      addressCountry: 'BR',
    },
    numberOfRooms: imovel.quartos,
    numberOfBathroomsTotal: imovel.banheiros,
    floorSize: { '@type': 'QuantitativeValue', value: imovel.area, unitCode: 'MTK' },
  };
}

export default async function ImovelPage({ params }: Props) {
  const imovel = await getImovel(params.slug);
  if (!imovel || imovel.status !== 'published') notFound();

  const relacionados = semelhantes(imovel, await publicados(), 3);

  return (
    <>
      <script
        type="application/ld+json"
        // Escapa '<' para que um campo de texto do imóvel (ex: título) nunca consiga fechar
        // a tag <script> e injetar HTML/JS — JSON.stringify sozinho não faz esse escape.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(imovel)).replace(/</g, '\\u003c') }}
      />
      <PropertyView imovel={imovel} relacionados={relacionados} />
    </>
  );
}
