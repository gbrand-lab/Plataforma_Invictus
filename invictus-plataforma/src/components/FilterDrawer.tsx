'use client';

import { useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { BAIRROS, CATEGORIAS, CIDADES } from '@/lib/data';
import { cx, num, somenteDigitos } from '@/lib/format';
import type { Categoria, Filtro } from '@/lib/types';
import { Btn, inputCls, selectCls, selectStyle } from './ui';
import { CHIP } from './FilterBar';

function Contador({
  valor,
  onChange,
  opcoes = [0, 1, 2, 3, 4],
}: {
  valor: number;
  onChange: (n: number) => void;
  opcoes?: number[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-pressed={valor === n}
          className={cx(
            CHIP,
            valor === n ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink2 hover:border-ink/30',
          )}
        >
          {n === 0 ? 'Qualquer' : `${n}+`}
        </button>
      ))}
    </div>
  );
}

interface FilterDrawerProps {
  aberto: boolean;
  onFechar: () => void;
  filtro: Filtro;
  set: (patch: Partial<Filtro>) => void;
  onLimpar: () => void;
  total: number;
}

/** Filtros avançados. No mobile é a única entrada; no desktop complementa a barra. */
export function FilterDrawer({ aberto, onFechar, filtro, set, onLimpar, total }: FilterDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    if (aberto) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Filtros">
      <div className="absolute inset-0 bg-ink/45" onClick={onFechar} />

      <aside className="drawer-in absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[17px] font-semibold text-ink">Filtros</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar filtros"
            className="grid h-9 w-9 place-items-center rounded-full text-ink2 hover:bg-ground"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Busca livre</p>
            <div className="relative">
              <Search
                size={16}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="fd-q"
                value={filtro.q}
                onChange={(e) => set({ q: e.target.value })}
                placeholder="Bairro, condomínio ou referência"
                className={cx(inputCls, 'pl-10')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="fd-cidade" className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Cidade</span>
              <select
                id="fd-cidade"
                value={filtro.cidade}
                onChange={(e) => set({ cidade: e.target.value })}
                style={selectStyle}
                className={selectCls}
              >
                <option value="">Todas</option>
                {CIDADES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="fd-bairro" className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Bairro</span>
              <select
                id="fd-bairro"
                value={filtro.bairro}
                onChange={(e) => set({ bairro: e.target.value })}
                style={selectStyle}
                className={selectCls}
              >
                <option value="">Todos</option>
                {BAIRROS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label htmlFor="fd-tipo" className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Tipo do imóvel</span>
            <select
              id="fd-tipo"
              value={filtro.categoria}
              onChange={(e) => set({ categoria: e.target.value as Categoria | '' })}
              style={selectStyle}
              className={selectCls}
            >
              <option value="">Todos os tipos</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Quartos</p>
            <Contador valor={filtro.quartos} onChange={(n) => set({ quartos: n })} />
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Banheiros</p>
            <Contador valor={filtro.banheiros} onChange={(n) => set({ banheiros: n })} opcoes={[0, 1, 2, 3]} />
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Vagas</p>
            <Contador valor={filtro.vagas} onChange={(n) => set({ vagas: n })} opcoes={[0, 1, 2, 3]} />
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Valor (R$)</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                id="fd-min"
                inputMode="numeric"
                value={filtro.precoMin}
                onChange={(e) => {
                  const v = somenteDigitos(e.target.value);
                  set({ precoMin: v === '' ? '' : Number(v) });
                }}
                placeholder="Mínimo"
                className={cx(inputCls, 'tabular')}
              />
              <input
                id="fd-max"
                inputMode="numeric"
                value={filtro.precoMax}
                onChange={(e) => {
                  const v = somenteDigitos(e.target.value);
                  set({ precoMax: v === '' ? '' : Number(v) });
                }}
                placeholder="Máximo"
                className={cx(inputCls, 'tabular')}
              />
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Área mínima (m²)</p>
            <input
              id="fd-area"
              inputMode="numeric"
              value={filtro.areaMin}
              onChange={(e) => {
                const v = somenteDigitos(e.target.value);
                set({ areaMin: v === '' ? '' : Number(v) });
              }}
              placeholder="Ex.: 90"
              className={cx(inputCls, 'tabular')}
            />
          </div>

          <label htmlFor="fd-chave" className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4">
            <input
              id="fd-chave"
              type="checkbox"
              checked={filtro.naChave}
              onChange={(e) =>
                set({ naChave: e.target.checked, ordem: e.target.checked ? 'menor' : 'recentes' })
              }
              className="mt-0.5 h-4 w-4 accent-[#ED6A1F]"
            />
            <span>
              <span className="block text-[14px] font-medium text-ink">Somente imóveis Na Chave</span>
              <span className="block text-[12.5px] text-muted">Prontos para morar, com entrega imediata.</span>
            </span>
          </label>
        </div>

        <footer className="flex items-center gap-3 border-t border-line px-5 py-4">
          <Btn variant="outline" className="flex-1" onClick={onLimpar}>
            Limpar
          </Btn>
          <Btn className="flex-[1.4]" onClick={onFechar}>
            Ver {num(total)} imóveis
          </Btn>
        </footer>
      </aside>
    </div>
  );
}
