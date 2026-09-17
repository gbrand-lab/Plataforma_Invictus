'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Home, X } from 'lucide-react';
import { CATEGORIAS, FILTRO_VAZIO, filtrar } from '@/lib/data';
import { num } from '@/lib/format';
import type { Filtro, Imovel } from '@/lib/types';
import { filtroFromSearchParams, searchParamsFromFiltro } from '@/lib/urlFiltros';
import { FilterBar } from './FilterBar';
import { FilterDrawer } from './FilterDrawer';
import { PropertyGrid } from './PropertyGrid';
import { Btn } from './ui';

function titulo(f: Filtro): string {
  if (f.naChave) return 'Imóveis Na Chave';
  if (f.finalidade === 'aluguel') return 'Imóveis para alugar';
  if (f.finalidade === 'venda') return 'Imóveis à venda';
  if (f.finalidade === 'repasse') return 'Imóveis de repasse de chave';
  return 'Todos os imóveis';
}

/**
 * Listagem com filtros.
 * O estado vive na URL: back/forward do navegador funcionam, o link é
 * compartilhável e a busca sobrevive ao refresh.
 */
export function PropertyListing({ imoveis }: { imoveis: Imovel[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtro, setFiltro] = useState<Filtro>(() =>
    filtroFromSearchParams(new URLSearchParams(searchParams.toString())),
  );
  const [drawer, setDrawer] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Navegação externa (header, rodapé, voltar) reescreve o filtro.
  useEffect(() => {
    setFiltro(filtroFromSearchParams(new URLSearchParams(searchParams.toString())));
  }, [searchParams]);

  const set = (patch: Partial<Filtro>) => {
    const proximo = { ...filtro, ...patch };
    setFiltro(proximo);
    const qs = searchParamsFromFiltro(proximo).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const limpar = () => {
    setFiltro({ ...FILTRO_VAZIO });
    router.replace(pathname, { scroll: false });
  };

  const resultado = useMemo(() => filtrar(imoveis, filtro), [imoveis, filtro]);

  // Skeleton curto: dá feedback de que a busca recalculou.
  const chave = JSON.stringify(filtro);
  useEffect(() => {
    setCarregando(true);
    const t = setTimeout(() => setCarregando(false), 280);
    return () => clearTimeout(t);
  }, [chave]);

  const extras =
    [filtro.quartos, filtro.banheiros, filtro.vagas, filtro.precoMin, filtro.precoMax, filtro.areaMin, filtro.q].filter(
      Boolean,
    ).length + (filtro.naChave ? 1 : 0);

  const ativos: [string, Partial<Filtro>][] = [];
  if (filtro.finalidade) {
    const label =
      filtro.finalidade === 'venda' ? 'Comprar' : filtro.finalidade === 'aluguel' ? 'Alugar' : 'Repasse de chave';
    ativos.push([label, { finalidade: '' }]);
  }
  if (filtro.cidade) ativos.push([filtro.cidade, { cidade: '' }]);
  if (filtro.bairro) ativos.push([filtro.bairro, { bairro: '' }]);
  if (filtro.categoria) {
    const label = CATEGORIAS.find((c) => c.id === filtro.categoria)?.label ?? filtro.categoria;
    ativos.push([label, { categoria: '' }]);
  }
  if (filtro.naChave) ativos.push(['Na chave', { naChave: false }]);
  if (filtro.quartos) ativos.push([`${filtro.quartos}+ quartos`, { quartos: 0 }]);
  if (filtro.banheiros) ativos.push([`${filtro.banheiros}+ banheiros`, { banheiros: 0 }]);
  if (filtro.vagas) ativos.push([`${filtro.vagas}+ vagas`, { vagas: 0 }]);
  if (filtro.areaMin) ativos.push([`A partir de ${filtro.areaMin} m²`, { areaMin: '' }]);
  if (filtro.precoMin !== '' || filtro.precoMax !== '') {
    ativos.push(['Faixa de preço', { precoMin: '', precoMax: '' }]);
  }
  if (filtro.q) ativos.push([`“${filtro.q}”`, { q: '' }]);

  return (
    <>
      <FilterBar
        filtro={filtro}
        set={set}
        onAbrirDrawer={() => setDrawer(true)}
        extras={extras}
        total={resultado.length}
      />

      <div className="mx-auto max-w-[1240px] px-5 py-8 sm:px-7 sm:py-10">
        <nav aria-label="Você está aqui" className="mb-5 flex items-center gap-1.5 text-[12.5px] text-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink">
            <Home size={13} strokeWidth={1.7} /> Início
          </Link>
          <ChevronRight size={13} strokeWidth={1.7} />
          <span className="text-ink2">Imóveis</span>
        </nav>

        <div>
          <h1 className="text-[27px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">{titulo(filtro)}</h1>
          <p className="tabular mt-1.5 text-[14.5px] text-ink2">
            <strong className="font-semibold text-ink">{num(resultado.length)}</strong>{' '}
            {resultado.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            {filtro.bairro ? ` em ${filtro.bairro}` : ''}
          </p>
        </div>

        {ativos.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {ativos.map(([label, patch]) => (
              <button
                key={label}
                type="button"
                onClick={() => set(patch)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] text-ink2 transition-colors hover:border-ink/30 hover:text-ink"
              >
                {label}
                <X size={13} strokeWidth={1.8} />
              </button>
            ))}
            <button
              type="button"
              onClick={limpar}
              className="px-1 text-[13px] font-medium text-brand hover:text-brandDeep"
            >
              Limpar tudo
            </button>
          </div>
        ) : null}

        <div className="mt-7">
          {resultado.length === 0 && !carregando ? (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
              <h2 className="text-[18px] font-semibold text-ink">Nenhum imóvel com esses filtros</h2>
              <p className="mx-auto mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink2">
                Tente ampliar a faixa de preço ou remover o filtro de bairro. Se preferir, fale com um corretor e nós
                buscamos na nossa carteira.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Btn variant="outline" onClick={limpar}>
                  Limpar filtros
                </Btn>
                <Btn onClick={() => setDrawer(true)}>Ajustar busca</Btn>
              </div>
            </div>
          ) : (
            <PropertyGrid imoveis={resultado} carregando={carregando} />
          )}
        </div>
      </div>

      <FilterDrawer
        aberto={drawer}
        onFechar={() => setDrawer(false)}
        filtro={filtro}
        set={set}
        onLimpar={limpar}
        total={resultado.length}
      />
    </>
  );
}
