'use client';

import { SlidersHorizontal } from 'lucide-react';
import { BAIRROS, CATEGORIAS, CIDADES, ORDENACOES } from '@/lib/data';
import { cx, num } from '@/lib/format';
import type { Categoria, Filtro, Finalidade, Ordenacao } from '@/lib/types';
import { selectCls, selectStyle } from './ui';

export const CHIP =
  'inline-flex h-9 items-center rounded-lg border px-3 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

/** Só pra imóvel na planta: filtra pelo teto de preço a partir da renda que o comprador informa. */
const FAIXAS_RENDA: { label: string; precoMax: number | '' }[] = [
  { label: 'Até R$ 3.000', precoMax: 260000 },
  { label: 'Até R$ 5.500', precoMax: 320000 },
  { label: 'Até R$ 9.000', precoMax: 400000 },
  { label: 'Acima de R$ 10.000', precoMax: '' },
];

interface FilterBarProps {
  filtro: Filtro;
  set: (patch: Partial<Filtro>) => void;
  onAbrirDrawer: () => void;
  /** Quantidade de filtros avançados ativos — vira badge no botão. */
  extras: number;
  total: number;
}

/** Barra fixa da listagem: os filtros de maior uso ficam a um clique. */
export function FilterBar({ filtro, set, onAbrirDrawer, extras, total }: FilterBarProps) {
  const finalidades: [Finalidade | '', string][] = [
    ['', 'Todos'],
    ['venda', 'Comprar'],
    ['aluguel', 'Alugar'],
    ['repasse', 'Repasse'],
  ];

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-ground/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2.5 px-5 py-3 sm:px-7">
        <div className="flex rounded-lg border border-line bg-white p-0.5">
          {finalidades.map(([valor, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => set({ finalidade: valor })}
              aria-pressed={filtro.finalidade === valor}
              className={cx(
                'h-8 rounded-[7px] px-3 text-[13.5px] font-medium transition-colors',
                filtro.finalidade === valor ? 'bg-ink text-white' : 'text-ink2 hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          aria-label="Cidade"
          value={filtro.cidade}
          onChange={(e) => set({ cidade: e.target.value })}
          style={selectStyle}
          className={cx(selectCls, 'hidden h-9 !w-auto min-w-[132px] text-[13.5px] md:block')}
        >
          <option value="">Todas as cidades</option>
          {CIDADES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Bairro"
          value={filtro.bairro}
          onChange={(e) => set({ bairro: e.target.value })}
          style={selectStyle}
          className={cx(selectCls, 'hidden h-9 !w-auto min-w-[136px] text-[13.5px] md:block')}
        >
          <option value="">Todos os bairros</option>
          {BAIRROS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          aria-label="Tipo do imóvel"
          value={filtro.categoria}
          onChange={(e) => set({ categoria: e.target.value as Categoria | '' })}
          style={selectStyle}
          className={cx(selectCls, 'hidden h-9 !w-auto min-w-[130px] text-[13.5px] sm:block')}
        >
          <option value="">Todos os tipos</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => set({ naChave: !filtro.naChave })}
          aria-pressed={filtro.naChave}
          className={cx(
            CHIP,
            'hidden lg:inline-flex',
            filtro.naChave ? 'border-brand bg-wash text-brandDeep' : 'border-line bg-white text-ink2 hover:border-ink/30',
          )}
        >
          Na chave
        </button>

        <button
          type="button"
          onClick={onAbrirDrawer}
          className={cx(CHIP, 'gap-2 border-line bg-white text-ink hover:border-ink/30')}
        >
          <SlidersHorizontal size={15} strokeWidth={1.7} />
          Filtros
          {extras > 0 ? (
            <span className="ml-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10.5px] font-bold text-white">
              {extras}
            </span>
          ) : null}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="tabular hidden whitespace-nowrap text-[13px] text-muted sm:block">
            {num(total)} imóveis
          </span>
          <select
            aria-label="Ordenar por"
            value={filtro.ordem}
            onChange={(e) => set({ ordem: e.target.value as Ordenacao })}
            style={selectStyle}
            className={cx(selectCls, 'h-9 !w-auto min-w-[148px] text-[13.5px]')}
          >
            {ORDENACOES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtro.finalidade === 'venda' && !filtro.naChave ? (
        <div className="border-t border-line/70">
          <div className="mx-auto max-w-[1240px] px-5 pt-2.5 sm:px-7">
            <p className="text-[13px] font-medium text-ink">
              Vamos achar o imóvel que se encaixa na sua realidade.
            </p>
          </div>
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-5 pb-2.5 pt-1.5 sm:px-7">
            <span className="text-[12.5px] font-medium text-ink2">Renda mensal:</span>
            {FAIXAS_RENDA.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => set({ precoMin: '', precoMax: f.precoMax })}
                aria-pressed={filtro.precoMax === f.precoMax}
                className={cx(
                  CHIP,
                  'h-8',
                  filtro.precoMax === f.precoMax
                    ? 'border-brand bg-wash text-brandDeep'
                    : 'border-line bg-white text-ink2 hover:border-ink/30',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
