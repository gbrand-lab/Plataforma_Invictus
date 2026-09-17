import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Imovel } from '@/lib/types';
import { finalidadeTag, money } from '@/lib/format';
import { ATALHOS } from '@/lib/urlFiltros';
import { PropertyCard } from './PropertyCard';
import { Foto, LinkArrow, Reveal, SectionHead, Specs, Tag } from './ui';

/** Seção "Imóveis selecionados para você" — curadoria manual (flag `destaque`). */
export function FeaturedProperties({ imoveis }: { imoveis: Imovel[] }) {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-7 sm:py-20">
        <Reveal>
          <SectionHead
            eyebrow="Seleção Invictus"
            titulo="Imóveis selecionados para você"
            sub="Conheça algumas das oportunidades disponíveis na Invictus."
            acao={<LinkArrow href={ATALHOS.todos}>Ver todos os imóveis</LinkArrow>}
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel, i) => (
            <Reveal key={imovel.id} delay={i * 50}>
              <PropertyCard imovel={imovel} priority={i < 3} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Seção "Novidades na Invictus".
 * Composição diferente da anterior de propósito: um destaque grande e três
 * itens em lista, para o olho não ler duas grades iguais em sequência.
 */
export function RecentProperties({ imoveis }: { imoveis: Imovel[] }) {
  const [principal, ...resto] = imoveis;
  if (!principal) return null;

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-7 sm:py-20">
      <Reveal>
        <SectionHead
          eyebrow="Atualizado esta semana"
          titulo="Novidades na Invictus"
          sub="Os imóveis mais recentes adicionados à plataforma."
          acao={<LinkArrow href={ATALHOS.todos}>Ver todos os imóveis</LinkArrow>}
        />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Reveal className="h-full">
          <Link
            href={`/imovel/${principal.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 ease-invictus hover:border-ink/15 hover:shadow-lift"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-ground">
              <Foto
                src={principal.imagens[0]}
                alt={principal.titulo}
                sizes="(max-width: 1024px) 100vw, 660px"
                className="transition-transform duration-[550ms] ease-invictus group-hover:scale-[1.04]"
              />
              <div className="absolute left-4 top-4 flex gap-1.5">
                <Tag tone="dark">{finalidadeTag(principal.finalidade)}</Tag>
                <Tag tone="orange">Novo na plataforma</Tag>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5">
              <div>
                <h3 className="text-[21px] font-semibold tracking-[-0.015em] text-ink">{principal.titulo}</h3>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] text-muted">
                  <MapPin size={14} strokeWidth={1.6} />
                  {principal.bairro} • {principal.cidade}/MA
                </p>
              </div>
              <p className="line-clamp-2 text-[14px] leading-relaxed text-ink2">{principal.descricao}</p>
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
                <p className="flex items-baseline gap-1.5">
                  <span className="tabular text-[24px] font-semibold tracking-[-0.02em] text-ink">
                    {money(principal.preco)}
                  </span>
                  {principal.finalidade === 'aluguel' ? <span className="text-[13px] text-muted">/mês</span> : null}
                </p>
                <Specs imovel={principal} />
              </div>
            </div>
          </Link>
        </Reveal>

        <div className="flex flex-col gap-4">
          {resto.slice(0, 3).map((imovel, i) => (
            <Reveal key={imovel.id} delay={i * 70} className="h-full">
              <Link
                href={`/imovel/${imovel.slug}`}
                className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-line bg-white p-3 transition-all duration-300 ease-invictus hover:border-ink/15 hover:shadow-lift"
              >
                <div className="relative h-[104px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-ground sm:h-[118px] sm:w-[158px]">
                  <Foto
                    src={imovel.imagens[0]}
                    alt={imovel.titulo}
                    sizes="160px"
                    className="transition-transform duration-[450ms] ease-invictus group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1.5 pr-1">
                  <div className="flex gap-1.5">
                    <Tag tone="outline">{finalidadeTag(imovel.finalidade)}</Tag>
                    {imovel.naChave ? <Tag tone="wash">Na chave</Tag> : null}
                  </div>
                  <h3 className="truncate text-[15px] font-semibold text-ink">{imovel.titulo}</h3>
                  <p className="truncate text-[12.5px] text-muted">
                    {imovel.bairro} • {imovel.cidade}/MA
                  </p>
                  <p className="tabular text-[16px] font-semibold text-ink">
                    {money(imovel.preco)}
                    {imovel.finalidade === 'aluguel' ? (
                      <span className="text-[12px] font-normal text-muted">/mês</span>
                    ) : null}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
