import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { CATEGORIAS } from '@/lib/data';
import { money, num } from '@/lib/format';
import type { Imovel } from '@/lib/types';
import { PropertyCard } from './PropertyCard';
import { PropertyDetails } from './PropertyDetails';
import { PropertyFeatures } from './PropertyFeatures';
import { PropertyGallery } from './PropertyGallery';
import { PropertyLocation } from './PropertyLocation';
import { SectionHead, Tag } from './ui';

interface PartnerPropertyViewProps {
  imovel: Imovel;
  relacionados: Imovel[];
}

/**
 * Versão da página de imóvel para a vitrine de parceiros (/parceiros):
 * mesmo conteúdo informativo, mas sem corretor, sem CRECI e sem nenhum
 * botão de contato/WhatsApp — só para consulta do catálogo.
 */
export function PartnerPropertyView({ imovel, relacionados }: PartnerPropertyViewProps) {
  const categoria = CATEGORIAS.find((c) => c.id === imovel.categoria)?.label ?? 'Imóveis';

  return (
    <article className="pb-16">
      <div className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-7">
        <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
          <Link href="/parceiros" className="inline-flex items-center gap-1.5 hover:text-ink">
            <Home size={13} strokeWidth={1.7} /> Parceiros
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} />
          <span className="truncate text-ink2">{imovel.titulo}</span>
        </nav>

        <div className="mt-4">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <Tag tone="orange">
              {imovel.finalidade === 'venda' ? 'À venda' : imovel.finalidade === 'aluguel' ? 'Para alugar' : 'Repasse de chave'}
            </Tag>
            {imovel.naChave ? <Tag tone="outline">Na chave</Tag> : null}
            {imovel.novo ? <Tag tone="outline">Novo</Tag> : null}
            <Tag tone="outline">Ref. {imovel.ref}</Tag>
          </div>

          <h1 className="text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink sm:text-[34px]">
            {imovel.titulo}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-ink2">
            {imovel.bairro} · {imovel.cidade} • Maranhão
          </p>

          <p className="tabular mt-3 text-[22px] font-semibold tracking-[-0.015em] text-ink">
            {money(imovel.preco)}
            {imovel.finalidade === 'aluguel' ? <span className="text-[13px] font-normal text-muted">/mês</span> : null}
          </p>
        </div>
      </div>

      <div className="mt-5 lg:mx-auto lg:max-w-[1240px] lg:px-7">
        <PropertyGallery imovel={imovel} />
      </div>

      <div className="mx-auto mt-8 max-w-[1240px] px-5 sm:px-7">
        <PropertyDetails imovel={imovel} />
        <PropertyFeatures caracteristicas={imovel.caracteristicas} />
        <PropertyLocation imovel={imovel} />
      </div>

      {relacionados.length > 0 ? (
        <section className="mt-16 border-t border-line bg-white">
          <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-7">
            <SectionHead
              titulo="Outros imóveis do catálogo"
              sub={`Outras opções em ${imovel.bairro} e região com perfil parecido.`}
            />
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((r) => (
                <PropertyCard key={r.id} imovel={r} hrefBase="/parceiros/imovel" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <p className="mx-auto mt-4 max-w-[1240px] px-5 text-[12px] text-muted sm:px-7">
        {imovel.area ? `${num(imovel.area)} m² · ` : ''}Consulta de catálogo — sem contato direto nesta página.
      </p>
    </article>
  );
}
