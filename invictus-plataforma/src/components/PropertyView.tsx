'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Heart, Home, Share2 } from 'lucide-react';
import { CATEGORIAS } from '@/lib/data';
import { CONFIG, mensagemImovel } from '@/lib/config';
import { cx, money, num } from '@/lib/format';
import { useFavoritosCtx } from '@/lib/favoritos-context';
import type { Imovel } from '@/lib/types';
import { ContactCard } from './ContactCard';
import { PropertyDetails } from './PropertyDetails';
import { PropertyFeatures } from './PropertyFeatures';
import { PropertyGallery } from './PropertyGallery';
import { PropertyLocation } from './PropertyLocation';
import { PropertyCard } from './PropertyCard';
import { WhatsAppCTA } from './WhatsAppCTA';
import { SectionHead, Tag, Toast } from './ui';

interface PropertyViewProps {
  imovel: Imovel;
  relacionados: Imovel[];
}

/** Página de produto do imóvel: ver → entender → demonstrar interesse. */
export function PropertyView({ imovel, relacionados }: PropertyViewProps) {
  const { isFavorito, alternar } = useFavoritosCtx();
  const [toast, setToast] = useState('');
  const favorito = isFavorito(imovel.id);
  const categoria = CATEGORIAS.find((c) => c.id === imovel.categoria)?.label ?? 'Imóveis';

  const compartilhar = async () => {
    const url = `${CONFIG.siteUrl}/imovel/${imovel.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: imovel.titulo, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast('Link copiado para a área de transferência');
      }
    } catch {
      /* o usuário cancelou o compartilhamento */
    }
  };

  const salvar = () => {
    alternar(imovel.id);
    setToast(favorito ? 'Removido dos favoritos' : 'Imóvel salvo nos favoritos');
  };

  return (
    <article className="pb-28 lg:pb-16">
      <div className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-7">
        <nav aria-label="Você está aqui" className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink">
            <Home size={13} strokeWidth={1.7} /> Início
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} />
          <Link href={`/imoveis?finalidade=${imovel.finalidade}`} className="hover:text-ink">
            {imovel.finalidade === 'venda' ? 'Comprar' : imovel.finalidade === 'aluguel' ? 'Alugar' : 'Repasse de chave'}
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} />
          <Link href={`/imoveis?categoria=${imovel.categoria}`} className="hover:text-ink">
            {categoria}
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} />
          <span className="truncate text-ink2">{imovel.titulo}</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
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
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={salvar}
              aria-pressed={favorito}
              className={cx(
                'inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-[13.5px] font-medium transition-colors',
                favorito
                  ? 'border-brand bg-wash text-brandDeep'
                  : 'border-line bg-white text-ink2 hover:border-ink/30 hover:text-ink',
              )}
            >
              <Heart
                size={16}
                strokeWidth={1.6}
                className={favorito ? 'text-brand' : ''}
                fill={favorito ? '#ED6A1F' : 'none'}
              />
              {favorito ? 'Salvo' : 'Salvar'}
            </button>

            <button
              type="button"
              onClick={compartilhar}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[13.5px] font-medium text-ink2 transition-colors hover:border-ink/30 hover:text-ink"
            >
              <Share2 size={16} strokeWidth={1.6} /> Compartilhar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 lg:mx-auto lg:max-w-[1240px] lg:px-7">
        <PropertyGallery imovel={imovel} />
      </div>

      <div className="mx-auto mt-8 grid max-w-[1240px] grid-cols-1 gap-10 px-5 sm:px-7 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div className="min-w-0">
          <PropertyDetails imovel={imovel} />
          <PropertyFeatures caracteristicas={imovel.caracteristicas} />
          <PropertyLocation imovel={imovel} />
        </div>

        <aside>
          <div className="lg:sticky lg:top-[88px]">
            <ContactCard imovel={imovel} />
          </div>
        </aside>
      </div>

      {relacionados.length > 0 ? (
        <section className="mt-16 border-t border-line bg-white">
          <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-7">
            <SectionHead
              titulo="Você também pode gostar"
              sub={`Outras opções em ${imovel.bairro} e região com perfil parecido.`}
            />
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((r) => (
                <PropertyCard key={r.id} imovel={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA fixo no mobile: acompanha a navegação sem cobrir conteúdo */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="tabular truncate text-[17px] font-semibold leading-tight text-ink">
              {money(imovel.preco)}
              {imovel.finalidade === 'aluguel' ? (
                <span className="text-[12px] font-normal text-muted">/mês</span>
              ) : null}
            </p>
            <p className="truncate text-[12px] text-muted">
              {imovel.bairro}
              {imovel.area ? ` · ${num(imovel.area)} m²` : ''}
            </p>
          </div>
          <WhatsAppCTA
            mensagem={mensagemImovel(imovel.titulo, imovel.ref)}
            label="Tenho interesse"
            className="shrink-0 px-4"
          />
        </div>
      </div>

      <Toast msg={toast} onClose={() => setToast('')} />
    </article>
  );
}
